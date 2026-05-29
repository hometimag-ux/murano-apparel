// ========== УПРАВЛЕНИЕ МЕНЮ ==========
(function() {
    const sidebar = document.getElementById('sidebarMenu');
    const menuToggle = document.getElementById('menuToggle');
    const menuOverlay = document.getElementById('menuOverlay');
    const pinBtn = document.getElementById('pinBtn');
    const pageTitle = document.getElementById('pageTitle');
    const contentArea = document.getElementById('contentArea');
    
    let isPinned = localStorage.getItem('menuPinned') === 'true';
    
    function updateMenuState() {
        if (isPinned) {
            sidebar.classList.add('pinned');
            pinBtn.classList.add('active');
            pinBtn.innerHTML = '📌 pinned';
        } else {
            sidebar.classList.remove('pinned');
            pinBtn.classList.remove('active');
            pinBtn.innerHTML = '📌';
        }
    }
    
    function openMenu() {
        sidebar.classList.add('open');
        menuOverlay.classList.add('active');
    }
    
    function closeMenu() {
        if (!isPinned) {
            sidebar.classList.remove('open');
            menuOverlay.classList.remove('active');
        }
    }
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (sidebar.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }
    
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }
    
    if (pinBtn) {
        pinBtn.addEventListener('click', () => {
            isPinned = !isPinned;
            localStorage.setItem('menuPinned', isPinned);
            updateMenuState();
            if (isPinned) closeMenu();
        });
    }
    
    updateMenuState();
    
    // ========== ЗАГРУЗКА СТРАНИЦ ==========
    function getPageTitle(page) {
        const titles = {
            dashboard: 'Главная',
            products: 'Товары',
            orders: 'Заказы',
            delivery: 'Доставка',
            payment: 'Оплата',
            'widget-editor': 'Редактор виджетов',
            settings: 'Настройки'
        };
        return titles[page] || 'Страница';
    }
    
    function showPlaceholder(page) {
        contentArea.innerHTML = `
            <div class="content-card" style="padding: 60px 40px; text-align: center;">
                <div style="font-size: 64px; margin-bottom: 20px;">📄</div>
                <h2>${getPageTitle(page)}</h2>
                <p style="color: #666; margin: 16px 0;">Страница в разработке</p>
                <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 16px; text-align: left; max-width: 400px; margin: 0 auto;">
                    <strong>📁 Создайте файл:</strong>
                    <code style="background: #e9ecef; padding: 4px 8px; border-radius: 6px; display: inline-block; margin-top: 8px;">pages/${page}.html</code>
                </div>
            </div>
        `;
        pageTitle.textContent = getPageTitle(page);
    }
    
    async function loadPage(page) {
        // Обновляем активный пункт меню
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        if (page === 'widget-editor') {
            pageTitle.textContent = 'Редактор виджетов';
            contentArea.innerHTML = `
                <div class="content-card" style="height: 100%; display: flex; flex-direction: column;">
                    <iframe src="widget-editor.html" style="width: 100%; height: 100%; border: none;"></iframe>
                </div>
            `;
            return;
        }
        
        try {
            const response = await fetch(`pages/${page}.html`);
            if (response.ok) {
                const html = await response.text();
                contentArea.innerHTML = `<div class="content-card">${html}</div>`;
                pageTitle.textContent = getPageTitle(page);
            } else {
                showPlaceholder(page);
            }
        } catch(e) {
            showPlaceholder(page);
        }
        
        // Закрываем меню на мобильных
        if (window.innerWidth <= 768) {
            closeMenu();
        }
    }
    
    // Навешиваем обработчики на пункты меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            loadPage(page);
        });
    });
    
    // Загружаем редактор виджетов по умолчанию
    loadPage('widget-editor');
})();
