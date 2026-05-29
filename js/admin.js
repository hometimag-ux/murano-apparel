// ========== УПРАВЛЕНИЕ МЕНЮ И ЗАГРУЗКА СТРАНИЦ ==========
(function() {
    const sidebar = document.getElementById('sidebarMenu');
    const collapseBtn = document.getElementById('collapseBtn');
    const menuToggle = document.getElementById('menuToggle');
    const pageTitle = document.getElementById('pageTitle');
    const contentArea = document.getElementById('contentArea');
    
    // Состояние — свернуто или нет
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
    
    async function loadPage(page, saveToHistory = true) {
        // Обновляем активный пункт меню
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Сохраняем последнюю страницу
        if (saveToHistory) localStorage.setItem('lastPage', page);
        
        // Обновляем заголовок
        if (pageTitle) pageTitle.textContent = titles[page] || 'Страница';
        
        // Для редактора виджетов — используем iframe
        if (page === 'widget-editor') {
            if (contentArea) {
                contentArea.innerHTML = `<iframe src="widget-editor.html" style="width:100%; height:100%; border:none; background: white; border-radius: 0;"></iframe>`;
            }
            return;
        }
        
        // Для страницы чата — используем iframe
        if (page === 'chat') {
            if (contentArea) {
                contentArea.innerHTML = `<iframe src="/murano-apparel/pages/chat.html" style="width:100%; height:100%; border:none; background: white; border-radius: 0;"></iframe>`;
            }
            return;
        }
        
        // Для страницы товаров — используем iframe
        if (page === 'products') {
            if (contentArea) {
                contentArea.innerHTML = `<iframe src="/murano-apparel/pages/products.html" style="width:100%; height:100%; border:none; background: #f8f9fa; border-radius: 0;"></iframe>`;
            }
            return;
        }
        
        // Для остальных страниц — показываем заглушку
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="content-card" style="display: flex; align-items: center; justify-content: center; min-height: 400px; background: white; border-radius: 20px;">
                    <div style="text-align: center; color: #999;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🚧</div>
                        <div>Страница "${titles[page] || page}" в разработке</div>
                        <div style="margin-top: 16px; font-size: 12px;">Создайте файл: pages/${page}.html</div>
                    </div>
                </div>
            `;
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
    
    // Загружаем последнюю открытую страницу или товары по умолчанию
    const lastPage = localStorage.getItem('lastPage');
    const validPages = ['products', 'chat', 'widget-editor'];
    
    if (lastPage && validPages.includes(lastPage)) {
        loadPage(lastPage, false);
    } else {
        loadPage('products', false);
    }
})();
