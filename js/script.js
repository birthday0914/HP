// js/script.js
document.addEventListener('DOMContentLoaded', function () {
  // --- フッターナビゲーションのアクティブ状態管理 ---
  const navLinks = document.querySelectorAll('footer .flex.gap-2 > a');
  const currentPagePath = window.location.pathname.split('/').pop(); // 例: "products.html"

  // ページ名と対応するナビゲーションテキストのマッピング
  // HTMLファイル名に合わせて調整してください。
  const pageToNavText = {
    'index.html': 'Home', // ホームページのファイル名が index.html の場合
    '': 'Home', // ルートパスの場合 (例: example.com/)
    'products.html': 'Products',
    'process.html': 'Process', // HTMLファイル名が process.html の場合
    'about.html': 'About',     // HTMLファイル名が about.html の場合
    'investor.html': '', // Investor Relationsページにはフッターナビに対応する項目がないので空
    'contact.html': 'Contact'  // HTMLファイル名が contact.html の場合
  };

  // investor.htmlの場合、フッターにInvestor Relationsタブがないため、汎用的な処理
  // SustainabilityはProcessページで対応していると仮定
  if (currentPagePath === 'investor.html') {
      // Investorページでは特別なアクティブ処理は不要（フッターに該当項目なし）
  } else {
    navLinks.forEach(link => {
      const linkTextElement = link.querySelector('p');
      if (linkTextElement) {
        const linkText = linkTextElement.textContent.trim();
        const iconDiv = link.querySelector('div[data-icon]');
        const pElement = link.querySelector('p');

        // デフォルトで非アクティブスタイルに (現在のHTMLではアクティブがハードコードされているため、それを上書き)
        link.classList.remove('rounded-full');
        link.classList.remove('text-[#0e141b]');
        link.classList.add('text-[#4e7397]');
        if (iconDiv) {
          iconDiv.classList.remove('text-[#0e141b]');
          iconDiv.classList.add('text-[#4e7397]');
        }
        if (pElement) {
          pElement.classList.remove('text-[#0e141b]');
          pElement.classList.add('text-[#4e7397]');
        }


        // 現在のページと一致するリンクをアクティブにする
        if (pageToNavText[currentPagePath] === linkText ||
           (currentPagePath === 'products.html' && linkText === 'Products') || // Products.html (1番目のHTML)
           (currentPagePath === 'process.html' && linkText === 'Process') || // Process.html (2番目のHTML、Productsタブの隣のアイコンがPackageなのでProducts、LeafなのでSustainabilityではなく、FactoryアイコンでProcessが適切)
           (currentPagePath === 'about.html' && linkText === 'About') || // About.html (3番目のHTML)
           (currentPagePath === 'contact.html' && linkText === 'Contact') // Contact.html (5番目のHTML)
           // 他のページも同様に追加
        ) {
          link.classList.remove('text-[#4e7397]');
          link.classList.add('text-[#0e141b]');
          // ProductsとAbout, Process, Contactページでは rounded-full はアクティブな<a>に付与
          if (linkText === 'Products' || linkText === 'About' || linkText === 'Process' || linkText === 'Contact' ) {
              link.classList.add('rounded-full');
          }

          if (iconDiv) {
            iconDiv.classList.remove('text-[#4e7397]');
            iconDiv.classList.add('text-[#0e141b]');
            // アイコンによってfill属性を変えるなどの処理もここで行える
          }
          if (pElement) {
            pElement.classList.remove('text-[#4e7397]');
            pElement.classList.add('text-[#0e141b]');
          }
        }
      }
    });
  }


  // --- お問い合わせフォームのバリデーション (contact.html のみ) ---
  if (currentPagePath === 'contact.html' || document.querySelector('form input[placeholder="Your Name"]')) {
    const contactForm = document.querySelector('form button[type="submit"], form button:not([type])'); // 送信ボタンでフォームを特定
    if (contactForm) {
      const formElement = contactForm.closest('form') || contactForm.parentElement.closest('div[class*="flex px-4 py-3"]'); // 簡易的なフォーム要素特定

      if(formElement) {
        // エラーメッセージ表示用のヘルパー関数
        const displayError = (inputElement, message) => {
          let errorSpan = inputElement.nextElementSibling;
          if (!errorSpan || !errorSpan.classList.contains('error-message')) {
            errorSpan = document.createElement('span');
            errorSpan.classList.add('error-message'); // style.cssで定義したクラス
            inputElement.parentNode.insertBefore(errorSpan, inputElement.nextSibling);
          }
          errorSpan.textContent = message;
          inputElement.classList.add('border-red-500'); // エラー時に枠を赤くする (Tailwindクラス)
        };

        const clearError = (inputElement) => {
          let errorSpan = inputElement.nextElementSibling;
          if (errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.textContent = '';
          }
          inputElement.classList.remove('border-red-500');
        };

        formElement.addEventListener('submit', function (event) {
          event.preventDefault(); // デフォルトの送信をキャンセル

          let isValid = true;

          const nameInput = formElement.querySelector('input[placeholder="Your Name"]');
          const emailInput = formElement.querySelector('input[placeholder="Your Email"]');
          const subjectInput = formElement.querySelector('input[placeholder="Subject"]');
          const messageTextarea = formElement.querySelector('textarea[placeholder="Your Message"]');

          // Name validation
          if (nameInput && nameInput.value.trim() === '') {
            displayError(nameInput, 'Name is required.');
            isValid = false;
          } else if (nameInput) {
            clearError(nameInput);
          }

          // Email validation
          if (emailInput) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailInput.value.trim() === '') {
              displayError(emailInput, 'Email is required.');
              isValid = false;
            } else if (!emailPattern.test(emailInput.value.trim())) {
              displayError(emailInput, 'Please enter a valid email address.');
              isValid = false;
            } else {
              clearError(emailInput);
            }
          }

          // Subject validation (optional, but if present, check if empty)
          if (subjectInput && subjectInput.value.trim() === '') {
            displayError(subjectInput, 'Subject is required.');
            isValid = false;
          } else if (subjectInput) {
            clearError(subjectInput);
          }

          // Message validation
          if (messageTextarea && messageTextarea.value.trim() === '') {
            displayError(messageTextarea, 'Message is required.');
            isValid = false;
          } else if (messageTextarea) {
            clearError(messageTextarea);
          }

          if (isValid) {
            alert('Message sent successfully! (This is a demo)');
            // ここで実際のフォーム送信処理 (例: fetch APIを使った非同期送信) を行う
            // formElement.reset(); // フォームをリセット
          }
        });

        // フォームの送信ボタンに type="submit" がない場合があるので、
        // 送信ボタンのクリックイベントで submit をトリガーするようにする
        const submitButton = formElement.querySelector('button:not([type]), button[type="button"]');
        if (submitButton && !submitButton.type && !formElement.hasAttribute('action')) { // typeなしで、action属性もない場合
            submitButton.addEventListener('click', () => {
                formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            });
        } else if (submitButton && submitButton.type !== 'submit') { // type="button"など
             submitButton.addEventListener('click', () => {
                formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            });
        }
      }
    }
  }
});
