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
        products: 'Товары',
        orders: 'Заказы',
        chat: 'Диалоги',
        delivery: 'Доставка',
        payment: 'Оплата',
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
        
        if (saveToHistory) localStorage.setItem('lastPage', page);
        if (pageTitle) pageTitle.textContent = titles[page] || 'Страница';
        
        // ===== РЕДАКТОР САЙТА — ОТКРЫВАЕМ В НОВОЙ ВКЛАДКЕ =====
        if (page === 'widget-editor') {
            window.open('/murano-apparel/widget-editor.html', '_blank');
            return;
        }
        
        // ===== ОСТАЛЬНЫЕ СТРАНИЦЫ — ЗАГРУЖАЕМ В IFRAME =====
        let iframeSrc = '';
        switch(page) {
            case 'products': iframeSrc = '/murano-apparel/pages/products.html'; break;
            case 'orders': iframeSrc = '/murano-apparel/pages/orders.html'; break;
            case 'chat': iframeSrc = '/murano-apparel/pages/chat.html'; break;
            case 'delivery': iframeSrc = '/murano-apparel/pages/delivery.html'; break;
            default: iframeSrc = '';
        }
        
        if (iframeSrc && contentArea) {
            contentArea.innerHTML = `<iframe src="${iframeSrc}" style="width:100%; height:100%; border:none; background: #f8f9fa; border-radius: 0;"></iframe>`;
        } else if (contentArea) {
            contentArea.innerHTML = `<div class="content-card" style="display: flex; align-items: center; justify-content: center; min-height: 400px; background: white; border-radius: 20px;"><div style="text-align: center; color: #999;"><div style="font-size: 48px; margin-bottom: 16px;">🚧</div><div>Страница в разработке</div></div></div>`;
        }
        
        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('open');
        }
    }
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            loadPage(page, true);
        });
    });
    
    // Загружаем товары по умолчанию
    loadPage('products', false);
})();
