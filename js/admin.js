// ========== УПРОЩЁННЫЙ, НО РАБОЧИЙ ADMIN.JS ==========
(function() {
    const sidebar = document.getElementById('sidebarMenu');
    const collapseBtn = document.getElementById('collapseBtn');
    const menuToggle = document.getElementById('menuToggle');
    const pageTitle = document.getElementById('pageTitle');
    const contentArea = document.getElementById('contentArea');
    
    let isCollapsed = localStorage.getItem('menuCollapsed') === 'true';
    
    function updateMenuState() {
        if (!sidebar) return;
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    }
    
    function toggleCollapse() {
        isCollapsed = !isCollapsed;
        localStorage.setItem('menuCollapsed', isCollapsed);
        updateMenuState();
    }
    
    if (collapseBtn) collapseBtn.addEventListener('click', toggleCollapse);
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (sidebar) sidebar.classList.toggle('open');
        });
    }
    
    updateMenuState();
    
    // ===== ЗАГРУЗКА СТРАНИЦ =====
    const titles = {
        dashboard: 'Главная',
        products: 'Товары',
        orders: 'Заказы',
        delivery: 'Доставка',
        payment: 'Оплата',
        chat: 'Диалоги',
        'widget-editor': 'Редактор сайта',
        settings: 'Настройки'
    };
    
    // Функция для загрузки любой страницы в iframe
    function loadPageInIframe(url, title) {
        if (contentArea) {
            contentArea.innerHTML = `<iframe src="${url}" style="width:100%; height:100%; border:none; background: #f8f9fa; border-radius: 0;"></iframe>`;
        }
        if (pageTitle) pageTitle.textContent = title;
    }
    
    async function loadPage(page, saveToHistory = true) {
        console.log(`Загрузка страницы: ${page}`);
        
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        if (saveToHistory) localStorage.setItem('lastPage', page);
        if (pageTitle) pageTitle.textContent = titles[page] || 'Страница';
        
        // Редактор сайта — загружаем менеджер сайтов
        if (page === 'widget-editor') {
            loadPageInIframe('/murano-apparel/widget-editor.html', titles[page]);
            return;
        }
        
        // Остальные страницы
        let iframeSrc = '';
        switch(page) {
            case 'products': iframeSrc = '/murano-apparel/pages/products.html'; break;
            case 'orders': iframeSrc = '/murano-apparel/pages/orders.html'; break;
            case 'chat': iframeSrc = '/murano-apparel/pages/chat.html'; break;
            case 'delivery': iframeSrc = '/murano-apparel/pages/delivery.html'; break;
            default: iframeSrc = '';
        }
        
        if (iframeSrc) {
            loadPageInIframe(iframeSrc, titles[page]);
        } else if (contentArea) {
            contentArea.innerHTML = `<div class="content-card" style="display: flex; align-items: center; justify-content: center; min-height: 400px; background: white; border-radius: 20px;"><div style="text-align: center; color: #999;"><div style="font-size: 48px; margin-bottom: 16px;">🚧</div><div>Страница "${titles[page] || page}" в разработке</div></div></div>`;
        }
        
        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('open');
        }
    }
    
    // ===== НОВЫЙ ОБРАБОТЧИК СООБЩЕНИЙ ОТ IFRAME =====
    window.addEventListener('message', (event) => {
        // Важно: проверяем origin для безопасности, но для GitHub Pages можно ослабить
        // if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'loadEditor' && event.data.url) {
            // Загружаем редактор сайта в тот же iframe
            loadPageInIframe(event.data.url, 'Редактор сайта');
        }
        
        if (event.data.type === 'backToManager') {
            // Возвращаемся к менеджеру сайтов
            loadPageInIframe('/murano-apparel/widget-editor.html', 'Управление сайтами');
        }
    });
    
    // Навешиваем обработчики на пункты меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            loadPage(page, true);
        });
    });
    
    // Загружаем стартовую страницу
    loadPage('widget-editor', false);
})();
