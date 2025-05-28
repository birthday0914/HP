// 厳格モード
"use strict";

// GSAPプラグイン登録
// gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText); // SplitTextを一旦コメントアウト
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin); // SplitTextなしで登録

document.addEventListener('DOMContentLoaded', function() {
    "use strict"; // 厳格モードは関数の先頭が良い場合も
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin); // SplitTextはコメントアウトのまま

    const body = document.body;
    const pageId = body.dataset.page; // ★ この行がコメントアウトされていないか、正しい位置にあるか確認

    // ... (以降のコード) ...

    // --- 0. Smooth Scroll & Lenis (オプション: より滑らかなスクロール体験) ---
    // const lenis = new Lenis()
    // function raf(time) {
    //   lenis.raf(time)
    //   requestAnimationFrame(raf)
    // }
    // requestAnimationFrame(raf)
    // gsap.ticker.add((time)=>{ lenis.raf(time * 1000) }); // GSAPと同期

    // --- 1. ローディング画面 ---
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        const loaderLogo = loadingOverlay.querySelector('.loader-logo');
        const loadingTl = gsap.timeline();
        loadingTl
            .fromTo(loaderLogo, { opacity: 0, scale: 0.8, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power2.out' })
            .to(loaderLogo, { opacity: 0, scale: 1.2, duration: 0.5, ease: 'power2.in' }, "+=0.5")
            .to(loadingOverlay, { 
                yPercent: -100, 
                duration: 0.8, 
                ease: 'expo.inOut',
                onComplete: () => {
                    loadingOverlay.style.display = 'none';
                    body.classList.remove('loading');
                    // ヒーローアニメーションなどをここで開始
                    if (typeof initHomePageAnimations === 'function' && pageId === 'home') {
                        initHomePageAnimations();
                    }
                }
            });
        body.classList.add('loading'); // 初期はローディング中
    }


    // --- 2. カスタムカーソル (よりインタラクティブに) ---
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    if (cursor && follower) {
        body.style.cursor = 'none';
        let mouseX = 0, mouseY = 0;
        let posX = 0, posY = 0;
        let isHoveringLink = false;
        let isSticking = false;
        let stickTarget = null;

        window.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        gsap.ticker.add(() => {
            if (isSticking && stickTarget) {
                const targetRect = stickTarget.getBoundingClientRect();
                const targetCenterX = targetRect.left + targetRect.width / 2;
                const targetCenterY = targetRect.top + targetRect.height / 2;
                posX += (targetCenterX - posX) / 5;
                posY += (targetCenterY - posY) / 5;
            } else {
                posX += (mouseX - posX) / 7;
                posY += (mouseY - posY) / 7;
            }
            gsap.set(follower, { x: posX - follower.offsetWidth / 2, y: posY - follower.offsetHeight / 2 });
            gsap.set(cursor, { x: mouseX - cursor.offsetWidth / 2, y: mouseY - cursor.offsetHeight / 2 });
        });

        document.querySelectorAll('a, button, [data-cursor-text], [data-cursor-stick]').forEach(el => {
            el.addEventListener('mouseenter', () => {
                isHoveringLink = true;
                cursor.classList.add('hover');
                follower.classList.add('hover');
                if (el.dataset.cursorText) {
                    follower.setAttribute('data-text', el.dataset.cursorText);
                    follower.classList.add('text-active');
                }
                if (el.hasAttribute('data-cursor-stick')) {
                    isSticking = true;
                    stickTarget = el;
                    gsap.to(follower, { scale: 1.8, duration: 0.3 }); // 吸い付き時に大きく
                }
            });
            el.addEventListener('mouseleave', () => {
                isHoveringLink = false;
                cursor.classList.remove('hover');
                follower.classList.remove('hover');
                follower.removeAttribute('data-text');
                follower.classList.remove('text-active');
                if (isSticking) {
                    isSticking = false;
                    stickTarget = null;
                    gsap.to(follower, { scale: 1, duration: 0.3 });
                }
            });
        });
    }


    // --- 3. ヘッダー ---
    const siteHeader = document.querySelector('.site-header');
    const mainContentForHeader = document.querySelector('.main-content'); // mainタグセレクタ変更
    if (siteHeader && mainContentForHeader) {
        const initialHeaderHeight = siteHeader.offsetHeight;
        mainContentForHeader.style.paddingTop = initialHeaderHeight + 'px';

        ScrollTrigger.create({
            start: "top -1px", // 1pxスクロールしたら
            end: 99999,
            toggleClass: { targets: siteHeader, className: "scrolled" },
            onUpdate: (self) => {
                const currentHeaderHeight = siteHeader.offsetHeight;
                if (mainContentForHeader.style.paddingTop !== currentHeaderHeight + 'px') {
                     mainContentForHeader.style.paddingTop = currentHeaderHeight + 'px';
                }
                // スクロール方向による表示/非表示 (より洗練された方法)
                if (self.direction === -1 && self.scroll() > 200) { // 上スクロール
                    gsap.to(siteHeader, { y: 0, duration: 0.3, ease: 'power2.out' });
                } else if (self.direction === 1 && self.scroll() > siteHeader.offsetHeight + 50) { // 下スクロール
                    gsap.to(siteHeader, { y: '-100%', duration: 0.3, ease: 'power2.in' });
                }
            }
        });
    }

    // --- 4. モバイルメニュー (よりスムーズなアニメーション) ---
    const menuToggleBtn = document.getElementById('mobile-menu-toggle');
    const mobileNavEl = document.getElementById('mobile-nav-menu');
    if (menuToggleBtn && mobileNavEl) {
        const mobileNavLinks = mobileNavEl.querySelectorAll('.mobile-nav-link');
        const mobileNavTl = gsap.timeline({ paused: true, reversed: true });

        mobileNavTl
            .to(mobileNavEl, { 
                x: '0%', 
                duration: 0.6, 
                ease: 'expo.inOut' // よりダイナミックなイージング
            })
            .fromTo(mobileNavLinks, 
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, stagger: 0.07, duration: 0.5, ease: 'power3.out' }, 
                "-=0.3"
            )
            .fromTo(mobileNavEl.querySelector('.mobile-nav-social'),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
                "-=0.3"
            );

        menuToggleBtn.addEventListener('click', () => {
            menuToggleBtn.classList.toggle('active');
            body.classList.toggle('mobile-menu-open');
            mobileNavTl.reversed() ? mobileNavTl.play() : mobileNavTl.reverse();
        });

        // メニュー項目クリックでメニューを閉じる
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNavEl.classList.contains('active') || menuToggleBtn.classList.contains('active')) { // 状態確認
                    menuToggleBtn.click(); // トグルボタンのクリックイベントを発火させて閉じる
                }
            });
        });
    }


     // --- 5. ヒーローセクション アニメーション (index.html - SplitTextを使わない形に一時的に変更) ---
    function initHomePageAnimations() {
        if (pageId === 'home' && document.querySelector('.hero-section')) {
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            const heroButtons = document.querySelectorAll('.hero-cta-buttons .btn');

            // SplitTextを使わないシンプルなフェードインに変更
            const homeHeroTl = gsap.timeline({ delay: 0.2 });
            homeHeroTl
                .from(heroTitle, { opacity: 0, y: 50, duration: 1, ease: "power3.out" })
                .from(heroSubtitle, { opacity: 0, y: 30, duration: 0.8, ease: "power2.out" }, "-=0.6")
                .from(heroButtons, {
                    opacity: 0,
                    y: 20,
                    scale: 0.9,
                    duration: 0.7,
                    ease: "elastic.out(1, 0.75)",
                    stagger: 0.15
                }, "-=0.4");
        }
    }
    // ローディングが終わってからヒーローアニメーションを開始するように修正済み
    // ... (他のコードもSplitTextを使用している箇所があれば同様に修正またはコメントアウト) ...
});

    // --- 6. パララックス効果 (より細かく) ---
    gsap.utils.toArray(".parallax-bg-image").forEach(bg => {
        const speed = parseFloat(bg.dataset.speed) || 0.5; // data-speed属性で速度制御
        gsap.to(bg, {
            yPercent: -100 * speed, // スピードに応じて移動量変更
            ease: "none",
            scrollTrigger: {
                trigger: bg.closest(".parallax-section"),
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5 // 少し滑らかに追従
            }
        });
    });
    // コンテンツのフェードイン & 視差 (GSAPの基本アニメーション)
    gsap.utils.toArray(".parallax-content .section-title, .parallax-content .lead-text, .parallax-content .btn, .anim-fade-up").forEach(el => {
        gsap.fromTo(el, 
            { opacity: 0, y: el.classList.contains('btn') ? 30 : 60 }, // ボタンは移動量少なめ
            {
                opacity: 1, y: 0, duration: 1, ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%", // 少し早めに開始
                    end: "bottom 20%",
                    toggleActions: "play none none none", // 一度だけ再生
                    markers: false // デバッグ用
                },
                delay: parseFloat(el.dataset.animDelay) || 0 // data-anim-delay属性
            }
        );
    });
    // 画像リビールアニメーション
    gsap.utils.toArray(".anim-image-reveal").forEach(imgContainer => {
        const img = imgContainer.querySelector('img');
        const cover = document.createElement('div');
        cover.classList.add('image-reveal-cover');
        imgContainer.appendChild(cover); // CSSでcoverのスタイル定義が必要
        // CSS例: .image-reveal-cover { position:absolute; top:0; left:0; width:100%; height:100%; background:var(--cyan-accent); transform-origin:left; }

        gsap.fromTo(cover, 
            { scaleX: 1 },
            { 
                scaleX: 0, duration: 1.2, ease: 'expo.inOut',
                scrollTrigger: { trigger: imgContainer, start: "top 80%" }
            }
        );
        if (img) {
            gsap.fromTo(img,
                { scale: 1.3, opacity:0.5 },
                { 
                    scale: 1, opacity:1, duration: 1.4, ease: 'expo.out', delay:0.2,
                    scrollTrigger: { trigger: imgContainer, start: "top 80%" }
                }
            );
        }
    });


    // --- 7. 製品スライダー (Swiper.js - よりインタラクティブに) ---
    if (document.querySelector('.product-swiper') && typeof Swiper !== 'undefined') {
        const productSwiperEl = document.querySelector('.product-swiper');
        const productSwiper = new Swiper(productSwiperEl, {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            centeredSlides: true, // アクティブなスライドを中央に
            effect: 'coverflow', // Coverflowエフェクト
            coverflowEffect: {
                rotate: 30,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
            },
            pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            breakpoints: {
                768: { slidesPerView: 2, spaceBetween: 40, centeredSlides: false, effect: 'slide' }, // 768px以上は通常のスライド
                1024: { slidesPerView: 3, spaceBetween: 50, centeredSlides: false, effect: 'slide' },
            },
            on: {
                init: function (swiper) {
                    gsap.from(swiper.slides, {opacity:0, scale:0.8, stagger:0.1, duration:0.7, ease:'power2.out'});
                },
                slideChangeTransitionStart: function(swiper) {
                    const activeSlideInfo = swiper.slides[swiper.activeIndex].querySelector('.product-info');
                    if (activeSlideInfo) {
                        gsap.fromTo(activeSlideInfo, 
                            {opacity:0, y:20}, 
                            {opacity:1, y:0, duration:0.6, delay:0.2, ease:'power2.out'}
                        );
                    }
                    // 他のスライドの情報を一旦隠すなど
                }
            }
        });
        // スライダーのボタンにカーソルエフェクト
        productSwiperEl.querySelectorAll('.swiper-button-next, .swiper-button-prev, .swiper-pagination-bullet').forEach(el => {
             el.addEventListener('mouseenter', () => follower.classList.add('swiper-nav-hover'));
             el.addEventListener('mouseleave', () => follower.classList.remove('swiper-nav-hover'));
        });
    }

    // --- 8. 投資家情報ページのグラフ ---
    // Chart.jsのコードは前回のを参考に、CSSで.chart-containerのサイズを適切に設定し、
    // Chart.jsオプションで maintainAspectRatio: false を使うとレスポンシブにしやすい。
    // グラフの表示アニメーションもChart.jsの機能やGSAPで追加可能。


    // --- 9. "sankoudesign"風ホバーエフェクト (CSSで大部分実装、JSで補助) ---
    document.querySelectorAll('.hover-effect-card, .product-card-featured').forEach(card => {
        const img = card.querySelector('img');
        const overlay = card.querySelector('.overlay-content, .product-card-overlay');
        if (img) { // imgタグがない場合エラーにならないように
             card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                // 画像の視差効果 (少しだけ動かす)
                gsap.to(img, {
                    x: (x - rect.width / 2) / 20, // 20の値で強度調整
                    y: (y - rect.height / 2) / 20,
                    rotationY: (x - rect.width / 2) / 50,
                    rotationX: -(y - rect.height / 2) / 50,
                    duration: 0.7,
                    ease: 'power3.out'
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(img, { x:0, y:0, rotationX:0, rotationY:0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
            });
        }
    });

    // --- 10. マグネティックボタン ---
    document.querySelectorAll('.magnetic-button').forEach(button => {
        const span = button.querySelector('span') || button; // spanがあればspanを、なければボタン自体を動かす
        button.addEventListener('mousemove', e => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(span, { x: x * 0.3, y: y * 0.5, duration: 0.3, ease: 'power2.out' });
        });
        button.addEventListener('mouseleave', () => {
            gsap.to(span, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        });
    });

    // --- 11. フッターの年表示 ---
    // (前回と同じ)

    // --- 12. スムーススクロール (ページ内リンク) ---
    // (前回と同じ - GSAP ScrollToPlugin 使用)

    // --- 13. フォームのインタラクション (contact.html) ---
    if (pageId === 'contact' && document.querySelector('form')) {
        document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
            input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
            input.addEventListener('blur', () => {
                if (input.value === '') {
                    input.parentElement.classList.remove('focused');
                }
            });
            // 初期状態で値があればfocusedクラスを付与
            if (input.value !== '') {
                input.parentElement.classList.add('focused');
            }
        });
    }

    // --- 14. アクティブなナビゲーションリンクの自動設定 ---
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll('.main-navigation .nav-link, .mobile-navigation .mobile-nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
    // トップページの場合、明示的にindex.htmlにactiveをつける
    if (currentPath === "index.html" || currentPath === "") {
         document.querySelector('.main-navigation a[href="index.html"]')?.classList.add('active');
         document.querySelector('.mobile-navigation a[href="index.html"]')?.classList.add('active');
    }


    console.log("All scripts initialized. Let's roll!");

; // End of DOMContentLoaded})

