// js/script.js の最初の方に追加
if (typeof gsap !== 'undefined') {
    gsap.from("#hero h2", { duration: 1.2, y: 50, opacity: 0, delay: 0.5, ease: "power3.out" });
    gsap.from("#hero p", { duration: 1.2, y: 30, opacity: 0, delay: 0.8, ease: "power3.out" });
    gsap.from("#hero .btn", { duration: 1, y: 20, opacity: 0, delay: 1.1, stagger: 0.2, ease: "power3.out" });

    // ScrollTriggerを使った例（AOSと併用または置き換え）
    // gsap.utils.toArray('.news-item').forEach(item => {
    //     gsap.from(item, {
    //         scrollTrigger: {
    //             trigger: item,
    //             start: "top 80%", // 上から80%の位置で開始
    //             toggleActions: "play none none none", //スクロールで再生、戻っても何もしない
    //         },
    //         opacity: 0,
    //         y: 50,
    //         duration: 0.8,
    //         ease: "power2.out"
    //     });
    // });
}


document.addEventListener('DOMContentLoaded', function() {

    // AOS (Animate On Scroll) ライブラリの初期化
    AOS.init({
        duration: 800, // アニメーションの時間
        once: true, // アニメーションを1回だけ実行
        offset: 100, // トリガーポイントのオフセット
        easing: 'ease-in-out-quad', // イージングの種類
    });

    // ヘッダーのスクロールエフェクト
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // モバイルメニューのトグル
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const isExpanded = navMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            menuToggle.innerHTML = isExpanded ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            menuToggle.setAttribute('aria-label', isExpanded ? 'メニューを閉じる' : 'メニューを開く');
            
            // メニュー表示時にbodyのスクロールを禁止（オプション）
            // document.body.style.overflow = isExpanded ? 'hidden' : '';
        });
    }

    // 製品情報ページのモーダル表示 (ダミーデータ)
    const productDetailToggles = document.querySelectorAll('.product-detail-toggle');
    const modal = document.getElementById('product-modal');
    const modalContent = document.querySelector('.modal .modal-content');
    const closeModalButton = document.querySelector('.modal .close-button');

    const productData = { // データは前回と同じなので省略。必要なら前回のものをコピー
        p001: {
            img: 'img/product1-large.jpg',
            title: '超薄ステンレス箔 (SUS304, SUS316L)',
            description: '最先端の精密圧延技術により、0.01mmの極薄厚さを実現。高い寸法精度と均一な表面品質を誇ります。電子部品のシールド材、精密ガスケット、医療用カテーテル部品、センサーダイアフラムなど、微細な加工が求められる分野で広く採用されています。',
            specs: [
                { key: '対応鋼種', value: 'SUS304, SUS316L, SUS430 他' },
                { key: '製造可能厚さ', value: '0.01mm - 0.10mm' },
                { key: '製造可能幅', value: '5mm - 300mm' },
                { key: '表面仕上げ', value: '2B, BA, HL, No.4 他応相談' },
                { key: '用途例', value: '電子部品、医療機器、精密バネ、ガスケット' }
            ]
        },
        p002: {
            img: 'img/product2-large.jpg',
            title: '高強度ステンレス鋼板 (SUS630, SUS631)',
            description: '析出硬化系ステンレス鋼で、熱処理により高い強度と硬度が得られます。耐食性も良好で、過酷な環境下での使用に適しています。航空機の構造部材、自動車のエンジン部品、産業機械のシャフトやギアなどに使用されます。',
            specs: [
                { key: '対応鋼種', value: 'SUS630 (17-4PH), SUS631 (17-7PH)' },
                { key: '製造可能厚さ', value: '0.5mm - 3.0mm' },
                { key: '製造可能幅', value: '最大 600mm' },
                { key: '熱処理状態', value: '時効硬化処理 (H900, H1025など) 対応' },
                { key: '用途例', value: '航空宇宙部品、自動車部品、高強度バネ' }
            ]
        },
        p003: {
            img: 'img/product3-large.jpg',
            title: '耐熱ステンレス鋼 (SUS310S, SUS309S)',
            description: 'クロムとニッケルの含有量が高く、優れた耐酸化性と高温強度を持つオーステナイト系ステンレス鋼です。高温環境下での構造部材として、熱交換器、工業炉、ボイラー部品、排気系部品などに使用されます。',
            specs: [
                { key: '対応鋼種', value: 'SUS310S, SUS309S, SUH409L 他' },
                { key: '製造可能厚さ', value: '0.3mm - 5.0mm' },
                { key: '製造可能幅', value: '最大 1000mm' },
                { key: '特性', value: '高温耐酸化性、高温強度' },
                { key: '用途例', value: '熱交換器、炉材、自動車排気系部品' }
            ]
        }
    };

    function openModal() {
        modal.style.display = "block";
        // CSSアニメーションのために一度リフローを強制する
        // modalContent.offsetWidth; // この行は場合によっては不要
        modalContent.style.animation = 'modalOpen 0.5s ease-out forwards';
        document.body.style.overflow = 'hidden'; // 背景スクロール禁止
    }

    function closeModal() {
        modalContent.style.animation = 'modalClose 0.3s ease-in forwards'; // 閉じるアニメーション（CSSで定義）
        setTimeout(() => {
            modal.style.display = "none";
            modalContent.style.animation = ''; // アニメーションをリセット
            document.body.style.overflow = ''; // 背景スクロール許可
        }, 300); // アニメーション時間と合わせる
    }
    // CSSに閉じるアニメーションを追加
    // @keyframes modalClose {
    //    from { opacity: 1; transform: translateY(0) scale(1); }
    //    to { opacity: 0; transform: translateY(-30px) scale(0.95); }
    // }
    // 上記コメントアウトはstyle.cssに追記してください。

    if (modal && productDetailToggles.length > 0 && closeModalButton) {
        productDetailToggles.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.productId;
                const data = productData[productId];
                if (data) {
                    document.getElementById('modal-img').src = data.img || 'img/placeholder-large.jpg';
                    document.getElementById('modal-img').alt = data.title;
                    document.getElementById('modal-title').textContent = data.title;
                    document.getElementById('modal-description').textContent = data.description;
                    
                    const specsTableBody = document.getElementById('modal-specs');
                    specsTableBody.innerHTML = ''; 
                    data.specs.forEach(spec => {
                        const row = specsTableBody.insertRow();
                        const cell1 = row.insertCell();
                        const cell2 = row.insertCell();
                        cell1.outerHTML = `<th>${spec.key}</th>`;
                        cell2.textContent = spec.value;
                    });
                    
                    openModal();
                }
            });
        });

        closeModalButton.addEventListener('click', closeModal);

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                closeModal();
            }
        });
        
        // ESCキーでモーダルを閉じる
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
            }
        });
    }

    // 投資家向け情報ページのチャート (Chart.jsを使用)
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Open Sans', 'Noto Sans JP', sans-serif"; // チャートのフォント設定
        Chart.defaults.color = '#555'; // チャートのデフォルト文字色

        const salesChartCtx = document.getElementById('salesChart');
        if (salesChartCtx) {
            new Chart(salesChartCtx, {
                type: 'bar',
                data: {
                    labels: ['2019年度', '2020年度', '2021年度', '2022年度', '2023年度'],
                    datasets: [{
                        label: '売上高 (億円)',
                        data: [100, 110, 125, 130, 150],
                        backgroundColor: 'rgba(10, 43, 76, 0.8)', // var(--primary-color)
                        borderColor: 'rgba(10, 43, 76, 1)',
                        borderWidth: 1,
                        borderRadius: 4, // バーの角丸
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, ticks: { callback: function(value) { return value + '億円' } } } },
                    plugins: { legend: { labels: { font: { size: 14 } } } }
                }
            });
        }

        const profitChartCtx = document.getElementById('profitChart');
        if (profitChartCtx) {
            new Chart(profitChartCtx, {
                type: 'line',
                data: {
                    labels: ['2019年度', '2020年度', '2021年度', '2022年度', '2023年度'],
                    datasets: [{
                        label: '営業利益 (億円)',
                        data: [8, 9, 11, 12, 15],
                        borderColor: 'rgba(242, 116, 5, 1)', // var(--secondary-color)
                        backgroundColor: 'rgba(242, 116, 5, 0.1)', // 折れ線グラフのエリア塗りつぶし
                        tension: 0.3, // 曲線の滑らかさ
                        fill: true, // エリア塗りつぶし有効
                        pointBackgroundColor: 'rgba(242, 116, 5, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(242, 116, 5, 1)',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, ticks: { callback: function(value) { return value + '億円' } } } },
                    plugins: { legend: { labels: { font: { size: 14 } } } }
                }
            });
        }
    } else {
        console.warn('Chart.js is not loaded. Charts will not be displayed.');
    }

    // お問い合わせフォームの基本的なバリデーションと送信処理（ダミー）
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            // バリデーションロジックは前回と同じなので省略。必要なら前回のものをコピー
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            const privacyPolicy = document.getElementById('privacy-policy').checked;

            if (!name || !email || !subject || !message) {
                alert('必須項目をすべて入力してください。');
                return;
            }
            if (!validateEmail(email)) {
                alert('有効なメールアドレスを入力してください。');
                return;
            }
            if (!privacyPolicy) {
                alert('プライバシーポリシーに同意してください。');
                return;
            }

            // ダミー送信処理
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 送信中...';
            submitButton.disabled = true;

            setTimeout(() => { // 送信処理のシミュレーション
                alert('お問い合わせありがとうございます。内容を確認後、担当者よりご連絡いたします。');
                contactForm.reset();
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }, 1500);
        });
    }
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Helper: Convert hex to RGB for CSS variables (if needed, or set manually in CSS)
    // function hexToRgb(hex) {
    //     let r = 0, g = 0, b = 0;
    //     if (hex.length == 4) { // #RGB
    //         r = parseInt(hex[1] + hex[1], 16);
    //         g = parseInt(hex[2] + hex[2], 16);
    //         b = parseInt(hex[3] + hex[3], 16);
    //     } else if (hex.length == 7) { // #RRGGBB
    //         r = parseInt(hex[1] + hex[2], 16);
    //         g = parseInt(hex[3] + hex[4], 16);
    //         b = parseInt(hex[5] + hex[6], 16);
    //     }
    //     return `${r}, ${g}, ${b}`;
    // }
    // const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    // if (primaryColor) {
    //     document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(primaryColor));
    // }
    // このヘルパーは、CSS側でRGBを手動設定したので、今回はコメントアウトしています。

});
