// ========== УПРОЩЁННАЯ ЗАГРУЗКА СТРАНИЦ ==========
(function() {
    const sidebar = document.getElementById('sidebarMenu');
    const collapseBtn = document.getElementById('collapseBtn');
    const contentArea = document.getElementById('contentArea');
    const pageTitle = document.getElementById('pageTitle');
    
    // Состояние меню
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
    updateMenuState();
    
    // ===== ЗАГРУЗКА СТРАНИЦ =====
    async function loadPage(page) {
        // Обновляем активный пункт меню
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Сохраняем последнюю страницу
        localStorage.setItem('lastPage', page);
        
        // Обновляем заголовок
        const titles = {
            dashboard: 'Главная',
            products: 'Товары',
            'products-new': 'Товары',
            orders: 'Заказы',
            chat: 'Диалоги',
            'widget-editor': 'Редактор сайта',
            settings: 'Настройки'
        };
        if (pageTitle) pageTitle.textContent = titles[page] || 'Страница';
        
        // Для редактора виджетов — используем iframe
        if (page === 'widget-editor') {
            if (contentArea) {
                contentArea.innerHTML = `<iframe src="widget-editor.html" style="width:100%; height:100%; border:none; background:white;"></iframe>`;
            }
            return;
        }
        
        // Для остальных страниц — загружаем HTML напрямую
        try {
            // Пробуем загрузить products-new.html для товаров
            let pageFile = page;
            if (page === 'products') pageFile = 'products';
            
            const response = await fetch(`pages/${pageFile}.html`);
            if (response.ok) {
                const html = await response.text();
                if (contentArea) {
                    contentArea.innerHTML = html;
                }
                console.log(`✅ Загружена страница: ${pageFile}.html`);
            } else {
                contentArea.innerHTML = `<div style="padding: 40px; text-align: center; color: #999;">❌ Страница ${page}.html не найдена</div>`;
            }
        } catch(e) {
            console.error('Ошибка загрузки:', e);
            contentArea.innerHTML = `<div style="padding: 40px; text-align: center; color: #999;">❌ Ошибка загрузки страницы</div>`;
        }
    }
    
    // Навешиваем обработчики на пункты меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            loadPage(page);
        });
    });
    
    // Загружаем последнюю страницу или товары по умолчанию
    const lastPage = localStorage.getItem('lastPage');
    if (lastPage && lastPage !== 'widget-editor') {
        loadPage(lastPage);
    } else {
        loadPage('products');
    }
})();
