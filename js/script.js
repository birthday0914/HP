// 厳格モード (ファイルの先頭またはDOMContentLoaded内)
"use strict";

// GSAPプラグイン登録 (SplitTextが利用可能な場合)
// もしSplitTextが利用できない場合は、gsap.registerPlugin(ScrollTrigger, ScrollToPlugin); のみとする
if (typeof SplitText !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
} else {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    console.warn("SplitText plugin is not available. Text animations will be simplified.");
}


document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const pageId = body.dataset.page; // 現在のページを識別 (HTMLの<body>にdata-page属性が必要)
    let isMobile = window.innerWidth < 992; // モバイル判定の閾値 (CSSの--breakpoint-mdと合わせる)

    // --- 0. Smooth Scroll & Lenis (オプション: より滑らかなスクロール体験) ---
    // Lenisを使用する場合は、HTMLにCDNを読み込み、以下のコメントを解除
    /*
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    gsap.ticker.add((time) => { lenis.lenis && lenis.raf(time * 1000); }); // GSAPと同期
    gsap.defaults({ ease: "none" }); // GSAPのデフォルトイージングをnoneに (Lenis側で制御するため)
    */


    // --- 1. ローディング画面 ---
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        const loaderLogo = loadingOverlay.querySelector('.loader-logo');
        const loadingTl = gsap.timeline();

        // imagesLoadedライブラリなどを使って主要コンテンツの読み込み完了を待つのが理想
        // ここでは簡易的にsetTimeoutで代用
        body.classList.add('loading');
        window.addEventListener('load', () => { // 全リソース読み込み後 (より確実)
            loadingTl
                .to(loaderLogo, { opacity: 0, scale: 0.8, y: -20, duration: 0.4, ease: 'power2.in' })
                .to(loadingOverlay, {
                    yPercent: -100,
                    duration: 1, // 少し長めに
                    ease: 'expo.inOut',
                    onComplete: () => {
                        if (loadingOverlay.parentNode) { // 要素が存在するか確認
                           loadingOverlay.parentNode.removeChild(loadingOverlay);
                        }
                        body.classList.remove('loading');
                        body.classList.add('loaded'); // ロード完了クラス
                        // ページ固有のアニメーション開始トリガー
                        ScrollTrigger.refresh(); // ScrollTriggerの位置を再計算
                        if (pageId === 'home' && typeof initHomePageAnimations === 'function') {
                            initHomePageAnimations();
                        }
                        // 他のページのアニメーション初期化もここで行うか、各ページ判定で呼び出す
                    }
                }, "+=0.2");
        });
         // フォールバックタイマー (もしloadイベントが遅い場合)
        setTimeout(() => {
            if (body.classList.contains('loading')) {
                console.log("Loading fallback triggered.");
                gsap.to(loadingOverlay, { opacity: 0, duration: 0.5, display:'none', onComplete: () => {
                    body.classList.remove('loading');
                    body.classList.add('loaded');
                    ScrollTrigger.refresh();
                     if (pageId === 'home' && typeof initHomePageAnimations === 'function') {
                        initHomePageAnimations();
                    }
                }});
            }
        }, 5000); // 5秒で強制的に終了
    } else {
        // ローディングオーバーレイがない場合は直接アニメーション開始
        body.classList.add('loaded');
        if (pageId === 'home' && typeof initHomePageAnimations === 'function') {
            initHomePageAnimations();
        }
    }


    // --- 2. カスタムカーソル ---
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    if (cursor && follower && !isMobile) { // モバイルではカスタムカーソルを無効化
        body.style.cursor = 'none';
        let mouseX = 0, mouseY = 0;
        let posX = 0, posY = 0;
        let isSticking = false;
        let stickTarget = null;
        let currentCursorText = '';

        gsap.set(cursor, { xPercent: -50, yPercent: -50 });
        gsap.set(follower, { xPercent: -50, yPercent: -50 });

        window.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            gsap.to(cursor, { duration: 0.1, x: mouseX, y: mouseY }); // カーソル本体は即時追従
        });

        gsap.ticker.add(() => {
            if (isSticking && stickTarget) {
                const targetRect = stickTarget.getBoundingClientRect();
                const targetCenterX = targetRect.left + targetRect.width / 2;
                const targetCenterY = targetRect.top + targetRect.height / 2;
                posX += (targetCenterX - posX) / 4; // 吸い付きの強さ (数値を小さくすると強く)
                posY += (targetCenterY - posY) / 4;
            } else {
                posX += (mouseX - posX) / 8; // フォロワーの追従の滑らかさ
                posY += (mouseY - posY) / 8;
            }
            gsap.set(follower, { x: posX, y: posY });
        });

        document.querySelectorAll('a, button, input[type="submit"], [data-cursor-text], [data-cursor-stick], .swiper-button-next, .swiper-button-prev, .swiper-pagination-bullet').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                follower.classList.add('hover');
                currentCursorText = el.dataset.cursorText || '';
                if (currentCursorText) {
                    follower.setAttribute('data-text', currentCursorText);
                    follower.classList.add('text-active');
                }
                if (el.hasAttribute('data-cursor-stick')) {
                    isSticking = true;
                    stickTarget = el;
                    gsap.to(follower, { scale: 2.2, duration: 0.3, ease: 'power2.out' });
                }
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                follower.classList.remove('hover');
                follower.removeAttribute('data-text');
                follower.classList.remove('text-active');
                if (isSticking) {
                    isSticking = false;
                    stickTarget = null;
                    gsap.to(follower, { scale: 1, duration: 0.3, ease: 'power2.out' });
                }
            });
        });
    } else if (cursor && follower && isMobile) { // モバイルなら非表示
        cursor.style.display = 'none';
        follower.style.display = 'none';
    }


    // --- 3. ヘッダーのスクロールエフェクト ---
    const siteHeader = document.querySelector('.site-header');
    const mainContentForHeader = document.querySelector('.main-content');
    if (siteHeader && mainContentForHeader) {
        let lastScrollTop = 0;
        const headerHeight = siteHeader.offsetHeight;
        mainContentForHeader.style.paddingTop = headerHeight + 'px';

        ScrollTrigger.create({
            start: "top top-=" + headerHeight, // ヘッダー分下にスクロールしたら
            end: 99999,
            onUpdate: (self) => {
                const currentScrollTop = self.scroll();
                if (currentScrollTop > lastScrollTop && currentScrollTop > headerHeight * 1.5) { // 下スクロール
                    if (!siteHeader.classList.contains('scrolled-down')) {
                        gsap.to(siteHeader, { y: '-100%', duration: 0.4, ease: 'power2.inOut' });
                        siteHeader.classList.add('scrolled-down');
                        siteHeader.classList.remove('scrolled-up');
                    }
                } else { // 上スクロールまたはトップ付近
                    if (siteHeader.classList.contains('scrolled-down')) {
                        gsap.to(siteHeader, { y: '0%', duration: 0.4, ease: 'power2.out' });
                        siteHeader.classList.remove('scrolled-down');
                        siteHeader.classList.add('scrolled-up');
                    }
                }
                if (currentScrollTop <= 10) { // トップに戻ったらクラスリセット
                    siteHeader.classList.remove('scrolled-up', 'scrolled-down', 'scrolled');
                } else {
                    siteHeader.classList.add('scrolled');
                }
                lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;

                // ヘッダーの高さが動的に変わる場合 (例: paddingが変わる) は再計算
                const newHeaderHeight = siteHeader.offsetHeight;
                if (mainContentForHeader.style.paddingTop !== newHeaderHeight + 'px') {
                     mainContentForHeader.style.paddingTop = newHeaderHeight + 'px';
                }
            }
        });
    }


    // --- 4. モバイルメニュー開閉 ---
    const menuToggleBtn = document.getElementById('mobile-menu-toggle');
    const mobileNavEl = document.getElementById('mobile-nav-menu');
    if (menuToggleBtn && mobileNavEl) {
        const mobileNavLinks = mobileNavEl.querySelectorAll('.mobile-nav-link');
        const mobileNavTl = gsap.timeline({ paused: true, reversed: true });

        mobileNavTl
            .set(mobileNavEl, { display: 'flex' }) // アニメーション開始前に表示
            .to(mobileNavEl, { x: '0%', duration: 0.6, ease: 'expo.inOut' })
            .fromTo(mobileNavLinks,
                { opacity: 0, x: -40, skewX:10 },
                { opacity: 1, x: 0, skewX:0, stagger: 0.06, duration: 0.5, ease: 'power3.out' },
                "-=0.35"
            )
            .fromTo(mobileNavEl.querySelector('.mobile-nav-social'),
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
                "-=0.3"
            );

        menuToggleBtn.addEventListener('click', () => {
            menuToggleBtn.classList.toggle('active');
            body.classList.toggle('mobile-menu-open');
            if (mobileNavTl.reversed()) {
                mobileNavTl.play();
            } else {
                // 閉じる時は逆再生開始前にリンクなどを一旦隠す（オプション）
                gsap.to(mobileNavLinks, {opacity:0, x:-20, stagger:0.03, duration:0.2, ease:'power1.in', onComplete: () => {
                    mobileNavTl.reverse();
                }});
            }
            menuToggleBtn.setAttribute('aria-expanded', String(menuToggleBtn.classList.contains('active')));
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                // ページ内リンクでなければ、またはメニューが開いていれば閉じる
                if (href && href.startsWith('#')) {
                    // スムーススクロールは後述の共通処理に任せる
                }
                if (mobileNavEl.style.transform === 'translateX(0%)' || menuToggleBtn.classList.contains('active')) { // より確実に状態をチェック
                    menuToggleBtn.click();
                }
            });
        });
    }


    // --- 5. ヒーローセクション アニメーション (index.html) ---
    function initHomePageAnimations() {
        if (pageId === 'home' && document.querySelector('.hero-section')) {
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            const heroButtons = document.querySelectorAll('.hero-cta-buttons .btn');
            const scrollIndicator = document.querySelector('.scroll-down-indicator');

            const homeHeroTl = gsap.timeline({ delay: 0.3 }); // ローディングアニメーションとの兼ね合い

            } if (heroTitle) { // SplitTextがない場合のフォールバック
                homeHeroTl.from(heroTitle, { opacity: 0, y: 50, duration: 1, ease: "power3.out" });
            }
        if (heroSubtitle) { // SplitText がない場合のフォールバック
            homeHeroTl.from(heroSubtitle, { opacity: 0, y: 30, duration: 0.8, ease: "power2.out" }, "-=0.7"); // 少し調整
        }
        // ... (ボタンなどのアニメーションはそのまま)
           

            if (heroButtons.length > 0) {
                homeHeroTl.from(heroButtons, {
                    opacity: 0, y: 30, scale: 0.8,
                    duration: 0.7, ease: "back.out(1.7)", stagger: 0.15
                }, "-=0.4");
            }
            if (scrollIndicator) {
                homeHeroTl.fromTo(scrollIndicator, {opacity:0, y:20}, {opacity:1, y:0, duration:0.5, ease:'power1.out'}, "-=0.2");
            }
        }

    // ローディング完了後に呼び出されるように変更済み


    // --- 6. パララックス効果 & スクロールベースのアニメーション ---
    gsap.utils.toArray(".parallax-bg-image").forEach(bg => {
        const speed = parseFloat(bg.dataset.speed) || 0.3; // data-speedがなければ0.3
        gsap.to(bg, {
            yPercent: -100 * speed,
            ease: "none",
            scrollTrigger: {
                trigger: bg.closest(".parallax-section"),
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8, // 少し遅れて追従
                // markers: true // デバッグ用
            }
        });
    });

    // セクションタイトルやテキストなどの汎用フェードアップアニメーション
    gsap.utils.toArray(".anim-fade-up, .section-header, .process-highlight-item, .featured-product-grid > div, .about-short-text").forEach(el => {
        gsap.from(el, {
            opacity: 0,
            y: 60,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 88%", // 要素の上端が画面下から88%の位置に来たら
                end: "bottom 20%",
                toggleActions: "play none none none", // 一度再生したらそのまま
                // markers: true, // デバッグ用
            },
            delay: parseFloat(el.dataset.animDelay) || 0
        });
    });

    // 画像リビールアニメーション (より洗練されたものに)
    gsap.utils.toArray(".anim-image-reveal").forEach(container => {
        const img = container.querySelector('img');
        if (img) {
            const cover = document.createElement('div');
            cover.classList.add('image-reveal-cover'); // CSSでスタイル定義 (例: position:absolute, bg: var(--cyan-accent))
            container.appendChild(cover);
            gsap.set(img, { scale: 1.2, opacity: 0.7 }); // 初期状態

            const tl = gsap.timeline({
                scrollTrigger: { trigger: container, start: "top 85%", toggleActions: "play none none none" }
            });
            tl.to(cover, { scaleX: 0, duration: 1.2, ease: 'expo.inOut', transformOrigin: 'left center' })
              .to(img, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out' }, "-=1"); // カバーと同時に画像もアニメーション
        }
    });

    // スケールアップアニメーション
    gsap.utils.toArray(".anim-scale-up").forEach(el => {
         gsap.from(el, {
            opacity: 0,
            scale: 0.7,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
            delay: parseFloat(el.dataset.animDelay) || 0
        });
    });


    // --- 7. 製品スライダー (Swiper.js) (products.html) ---
    if (pageId === 'products' && document.querySelector('.product-swiper') && typeof Swiper !== 'undefined') {
        const productSwiperEl = document.querySelector('.product-swiper');
        const productSwiper = new Swiper(productSwiperEl, {
            loop: false, // 無限ループはコンテンツ量によっては検討
            slidesPerView: 1,
            spaceBetween: 20,
            grabCursor: true,
            centeredSlides: false,
            effect: 'slide', // デフォルトはスライド
            pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            breakpoints: {
                640: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 40, effect: 'coverflow', centeredSlides: true,
                    coverflowEffect: { rotate: 0, stretch: 80, depth: 150, modifier: 1, slideShadows: false, },
                },
                1200: { slidesPerView: 3, spaceBetween: 50, effect: 'coverflow', centeredSlides: true,
                    coverflowEffect: { rotate: 0, stretch: 100, depth: 200, modifier: 1, slideShadows: false, },
                }
            },
            on: {
                init: function (swiper) {
                    // 最初の表示アニメーション
                    gsap.from(swiper.slides, {opacity:0, y:60, stagger:0.08, duration:0.8, ease:'power3.out'});
                },
                slideChangeTransitionStart: function(swiper) {
                    // 現在のスライドのアニメーション
                    const activeSlide = swiper.slides[swiper.activeIndex];
                    const activeSlideInfo = activeSlide.querySelector('.product-info');
                    if (activeSlideInfo) {
                        gsap.fromTo(activeSlideInfo,
                            {opacity:0, y:25},
                            {opacity:1, y:0, duration:0.5, delay:0.1, ease:'power2.out'}
                        );
                    }
                    // 非アクティブなスライドのスタイル調整 (オプション)
                    swiper.slides.forEach((slide, index) => {
                        if (index !== swiper.activeIndex) {
                            // gsap.to(slide.querySelector('.product-info'), {opacity:0.5, duration:0.3});
                        }
                    });
                }
            }
        });
    }


// js/script.js

// --- 8. 投資家向け情報ページのグラフ (Chart.js) (investors.html) ---
if (pageId === 'investors' && typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Noto Sans JP', 'Open Sans', sans-serif";
    Chart.defaults.color = getComputedStyle(body).getPropertyValue('--text-light').trim() || '#F0F4F8';
    Chart.defaults.borderColor = getComputedStyle(body).getPropertyValue('--border-color-dark').trim() || 'rgba(100, 125, 150, 0.3)'; // グリッドラインの色も設定

    const salesChartCtx = document.getElementById('salesChart');
    if (salesChartCtx) {
        new Chart(salesChartCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['2019', '2020', '2021', '2022', '2023'], // 年度を削除してシンプルに
                datasets: [{
                    label: '売上高 (億円)',
                    data: [100, 110, 125, 130, 150], // ダミーデータ
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--cyan-accent').trim() || '#00E0FF',
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--cyan-darker').trim() || '#00B8D4',
                    borderWidth: 1,
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // ★ これが重要！コンテナの高さに追従
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: Chart.defaults.color, // 目盛りの文字色
                            callback: function(value) { return value + '億円' }
                        },
                        grid: {
                            color: Chart.defaults.borderColor, // Y軸のグリッドライン色
                            drawBorder: false, // 軸線は描画しない
                        }
                    },
                    x: {
                        ticks: {
                            color: Chart.defaults.color // 目盛りの文字色
                        },
                        grid: {
                            display: false, // X軸のグリッドラインは非表示
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: Chart.defaults.color, // 凡例の文字色
                            font: { size: 13 } // 少し小さく
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 25, 47, 0.9)', // ツールチップ背景
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--cyan-accent').trim(),
                        bodyColor: Chart.defaults.color,
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color-dark').trim(),
                        borderWidth: 1,
                        padding: 10,
                         cornerRadius: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--border-radius').trim()) || 4, // ★ 修正後
                    }
                },
                animation: { duration: 1000, easing: 'easeInOutQuart' }
            }
        });
    }

    const profitChartCtx = document.getElementById('profitChart');
    if (profitChartCtx) {
        new Chart(profitChartCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['2019', '2020', '2021', '2022', '2023'],
                datasets: [{
                    label: '営業利益 (億円)',
                    data: [8, 9, 11, 12, 15], // ダミーデータ
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--blue-light').trim() || '#6597FF',
                    backgroundColor: 'rgba(101, 151, 255, 0.15)', // エリアの色を少し濃く
                    tension: 0.4, // 曲線の滑らかさを調整
                    fill: true,
                    pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--blue-light').trim(),
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--blue-light').trim(),
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    borderWidth: 2, // 線の太さ
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // ★ これが重要！コンテナの高さに追従
                scales: {
                     y: {
                        beginAtZero: true,
                        ticks: {
                            color: Chart.defaults.color,
                            callback: function(value) { return value + '億円' }
                        },
                        grid: {
                            color: Chart.defaults.borderColor,
                            drawBorder: false,
                        }
                    },
                    x: {
                        ticks: {
                            color: Chart.defaults.color
                        },
                        grid: {
                            display: false,
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: Chart.defaults.color,
                            font: { size: 13 }
                        }
                    },
                     tooltip: { /* 上記と同様のスタイル */ }
                },
                animation: { duration: 1200, easing: 'easeInOutSine', delay: 200 }
            }
        });
    }
}

    // --- 9. "sankoudesign"風ホバーエフェクト (CSS主体、JSで追加効果) ---
    document.querySelectorAll('.hover-effect-card, .product-card-featured, .product-card-slide').forEach(card => {
        const img = card.querySelector('img');
        if (img) {
            const tl = gsap.timeline({ paused: true });
            tl.to(img, { scale: 1.08, duration: 0.8, ease: 'power3.out' }) // 少し控えめなスケール
              .to(card.querySelector('.product-card-overlay, .image-overlay-text, .product-info'),
                  { y: '0%', opacity: 1, duration: 0.6, ease: 'power3.out' }, "-=0.6"); // オーバーレイアニメーション

            card.addEventListener('mouseenter', () => tl.play());
            card.addEventListener('mouseleave', () => tl.reverse());

            // マウス追従の傾き (より繊細に)
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                gsap.to(card, { // カード全体を少し傾ける
                    rotationY: (x - rect.width / 2) / (rect.width / 2) * 3, // 最大3度
                    rotationX: -(y - rect.height / 2) / (rect.height / 2) * 3,
                    transformPerspective: 500, // 視点
                    duration: 0.7,
                    ease: 'power1.out'
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { rotationX:0, rotationY:0, duration: 0.5, ease: 'elastic.out(1, 0.7)' });
            });
        }
    });


    // --- 10. マグネティックボタン ---
    document.querySelectorAll('.magnetic-button').forEach(button => {
        const strength = 30; // 吸い付きの強さ
        button.addEventListener('mousemove', e => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(button, {
                x: x * 0.2, y: y * 0.3, // 文字も少し動かす場合は span をターゲットに
                duration: 0.4,
                ease: 'power2.out'
            });
        });
        button.addEventListener('mouseleave', () => {
            gsap.to(button, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
        });
    });


    // --- 11. フッターの年表示 ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }


    // --- 12. スムーススクロール (ページ内リンク) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1 && href !== '#') { // #だけのリンクは除く
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    let offsetY = siteHeader ? siteHeader.offsetHeight : 80;
                    // モバイルメニューが開いていれば閉じる処理が先に行われることを考慮
                    if (body.classList.contains('mobile-menu-open')) {
                        // モバイルメニューを閉じる (もし閉じることでヘッダー高さが変わるなら、閉じた後の高さを取得する必要がある)
                        // menuToggleBtn.click(); // これだと非同期になる可能性
                        // offsetYは固定値にしておくか、閉じるアニメーション完了後にスクロールが良い
                    }

                    gsap.to(window, {
                        duration: 1.5, // 少し長めに
                        scrollTo: {
                            y: targetElement,
                            offsetY: offsetY + 10 // 少し余裕を持たせる
                        },
                        ease: "power3.inOut"
                    });

                    // モバイルメニューが開いていれば閉じる
                    if (mobileNavEl && mobileNavEl.style.transform === 'translateX(0%)') { // より正確な判定
                        if (menuToggleBtn && menuToggleBtn.classList.contains('active')) {
                            menuToggleBtn.click();
                        }
                    }
                }
            }
        });
    });


    // --- 13. フォームのインタラクション (contact.html) ---
    if (pageId === 'contact' && document.querySelector('form.contact-form')) {
        document.querySelectorAll('.contact-form .form-group input, .contact-form .form-group textarea').forEach(input => {
            const label = input.parentElement.querySelector('label');
            function checkValue() {
                if (input.value.trim() !== '') {
                    input.parentElement.classList.add('filled');
                } else {
                    input.parentElement.classList.remove('filled');
                }
            }
            checkValue(); // 初期チェック
            input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
                checkValue();
            });
            input.addEventListener('input', checkValue); // 入力中もチェック
        });
        // フォーム送信時の処理 (ダミー)
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                // ここでバリデーション処理
                // ...
                // ダミーの成功表示
                gsap.to(this, {opacity:0.5, duration:0.3, onComplete: () => {
                    alert('お問い合わせありがとうございます。送信されました（これはダミーです）。');
                    this.reset();
                    gsap.to(this, {opacity:1, duration:0.3});
                    this.querySelectorAll('.form-group').forEach(fg => fg.classList.remove('filled','focused'));
                }});
            });
        }
    }


    // --- 14. アクティブなナビゲーションリンクの自動設定 ---
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll('.main-navigation .nav-link, .mobile-navigation .mobile-nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href').split("/").pop() || "index.html";
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
    // トップページ ("" や "/") の場合の明示的な処理
    if (currentPath === "index.html" || window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/')) {
         document.querySelector('.main-navigation a[href="index.html"]')?.classList.add('active');
         document.querySelector('.mobile-navigation a[href="index.html"]')?.classList.add('active');
    }


    // --- 最後にウィンドウリサイズ時の処理 ---
    window.addEventListener('resize', () => {
        isMobile = window.innerWidth < 992; // モバイル判定更新
        if (siteHeader && mainContentForHeader) { // ヘッダーとメインコンテンツがあればpadding再計算
            mainContentForHeader.style.paddingTop = siteHeader.offsetHeight + 'px';
        }
        ScrollTrigger.refresh(); // ScrollTriggerの位置を再計算
    });

    console.log("Advanced scripts initialized. Let's make it shine!");

}); // End of DOMContentLoaded
