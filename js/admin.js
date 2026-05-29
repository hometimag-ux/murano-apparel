// ========== УПРАВЛЕНИЕ МЕНЮ (СВОРАЧИВАЕМОЕ) ==========
(function() {
    const sidebar = document.getElementById('sidebarMenu');
    const collapseBtn = document.getElementById('collapseBtn');
    const menuToggle = document.getElementById('menuToggle');
    const pageTitle = document.getElementById('pageTitle');
    const contentArea = document.getElementById('contentArea');
    
    // Состояние — свернуто или нет
    let isCollapsed = localStorage.getItem('menuCollapsed') === 'true';
    
    // Функция обновления состояния меню
    function updateMenuState() {
        if (!sidebar) return;
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    }
    
    // Сворачивание/разворачивание
    function toggleCollapse() {
        isCollapsed = !isCollapsed;
        localStorage.setItem('menuCollapsed', isCollapsed);
        updateMenuState();
    }
    
    if (collapseBtn) {
        collapseBtn.addEventListener('click', toggleCollapse);
    }
    
    // Для мобильных — кнопка гамбургера
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (sidebar) sidebar.classList.toggle('open');
        });
        
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (sidebar && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
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
            chat: 'Чат с клиентами',
            settings: 'Настройки'
        };
        return titles[page] || 'Страница';
    }
    
    function showPlaceholder(page) {
        if (!contentArea) return;
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
        if (pageTitle) pageTitle.textContent = getPageTitle(page);
    }
    
    async function loadPage(page, saveToHistory = true) {
        // Обновляем активный пункт меню
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Сохраняем текущую страницу в localStorage
        if (saveToHistory) {
            localStorage.setItem('lastPage', page);
        }
        
        if (page === 'widget-editor') {
            if (pageTitle) pageTitle.textContent = 'Редактор виджетов';
            if (contentArea) {
                contentArea.innerHTML = `
                    <div class="content-card" style="height: 100%; display: flex; flex-direction: column;">
                        <iframe src="widget-editor.html" style="width: 100%; height: 100%; border: none;"></iframe>
                    </div>
                `;
            }
            return;
        }
        
        try {
            const response = await fetch(`pages/${page}.html`);
            if (response.ok) {
                const html = await response.text();
                if (contentArea) contentArea.innerHTML = `<div class="content-card">${html}</div>`;
                if (pageTitle) pageTitle.textContent = getPageTitle(page);
            } else {
                showPlaceholder(page);
            }
        } catch(e) {
            showPlaceholder(page);
        }
        
        // Закрываем меню на мобильных
        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('open');
        }
    }
    
    // Навешиваем обработчики на пункты меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            loadPage(page, true);
        });
    });
    
    // Загружаем последнюю открытую страницу или редактор по умолчанию
    const lastPage = localStorage.getItem('lastPage');
    if (lastPage && lastPage !== 'widget-editor') {
        // Проверяем, существует ли такой пункт меню
        const exists = Array.from(document.querySelectorAll('.nav-item')).some(item => item.dataset.page === lastPage);
        if (exists) {
            loadPage(lastPage, false);
        } else {
            loadPage('widget-editor', false);
        }
    } else {
        loadPage('widget-editor', false);
    }
})();
