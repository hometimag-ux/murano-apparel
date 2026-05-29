// ========== УПРАВЛЕНИЕ МЕНЮ И ЗАГРУЗКА СТРАНИЦ ==========
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
        menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && sidebar && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
    
    updateMenuState();
    
    // --- Загрузка страниц ---
    const titles = {
        dashboard: 'Главная', products: 'Товары', orders: 'Заказы',
        delivery: 'Доставка', payment: 'Оплата', 'widget-editor': 'Редактор виджетов',
        chat: 'Чат с клиентами', settings: 'Настройки'
    };
    
    async function loadPage(page, saveToHistory = true) {
        // Обновляем активный пункт меню
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        if (saveToHistory) localStorage.setItem('lastPage', page);
        if (pageTitle) pageTitle.textContent = titles[page] || 'Страница';
        
        if (page === 'widget-editor') {
            if (contentArea) {
                contentArea.innerHTML = `<div class="content-card" style="height: 100%;"><iframe src="widget-editor.html" style="width:100%; height:100%; border:none;"></iframe></div>`;
            }
            return;
        }
        
        try {
            const response = await fetch(`pages/${page}.html`);
            if (response.ok) {
                if (contentArea) contentArea.innerHTML = `<div class="content-card">${await response.text()}</div>`;
            } else {
                throw new Error('Not found');
            }
        } catch(e) {
            if (contentArea) {
                contentArea.innerHTML = `<div class="content-card" style="padding: 60px; text-align: center;"><div style="font-size: 64px;">📄</div><h2>${titles[page] || page}</h2><p style="color: #666;">Страница в разработке</p><code style="background:#e9ecef; padding: 4px 8px;">pages/${page}.html</code></div>`;
            }
        }
        
        if (window.innerWidth <= 768 && sidebar) sidebar.classList.remove('open');
    }
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => loadPage(item.dataset.page, true));
    });
    
    const lastPage = localStorage.getItem('lastPage');
    const isValidPage = lastPage && Array.from(document.querySelectorAll('.nav-item')).some(item => item.dataset.page === lastPage);
    loadPage(isValidPage ? lastPage : 'widget-editor', false);
})();
