// ========== УПРАВЛЕНИЕ МЕНЮ (СВОРАЧИВАЕМОЕ) ==========
(function() {
    const sidebar = document.getElementById('sidebarMenu');
    const collapseBtn = document.getElementById('collapseBtn');
    const pinBtn = document.getElementById('pinBtn');
    const menuToggle = document.getElementById('menuToggle');
    const pageTitle = document.getElementById('pageTitle');
    const contentArea = document.getElementById('contentArea');
    
    // Состояния
    let isCollapsed = localStorage.getItem('menuCollapsed') === 'true';
    let isPinned = localStorage.getItem('menuPinned') === 'true';
    
    // Функция обновления состояния меню
    function updateMenuState() {
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            collapseBtn.innerHTML = '▶';
            collapseBtn.title = 'Развернуть меню';
        } else {
            sidebar.classList.remove('collapsed');
            collapseBtn.innerHTML = '◀';
            collapseBtn.title = 'Свернуть меню';
        }
        
        if (isPinned) {
            pinBtn.classList.add('active');
            pinBtn.innerHTML = '<span>📌</span> <span>Закреплено</span>';
        } else {
            pinBtn.classList.remove('active');
            pinBtn.innerHTML = '<span>📌</span> <span>Закрепить</span>';
        }
    }
    
    // Сворачивание/разворачивание
    function toggleCollapse() {
        isCollapsed = !isCollapsed;
        localStorage.setItem('menuCollapsed', isCollapsed);
        updateMenuState();
    }
    
    // Закрепление (запрещает сворачивание при клике на стрелку)
    function togglePin() {
        isPinned = !isPinned;
        localStorage.setItem('menuPinned', isPinned);
        updateMenuState();
        
        if (isPinned) {
            // Если закреплено — убираем кнопку сворачивания или делаем её неактивной
            collapseBtn.style.opacity = '0.5';
            collapseBtn.style.cursor = 'not-allowed';
        } else {
            collapseBtn.style.opacity = '1';
            collapseBtn.style.cursor = 'pointer';
        }
    }
    
    // Сворачиваем только если не закреплено
    collapseBtn.addEventListener('click', () => {
        if (!isPinned) {
            toggleCollapse();
        }
    });
    
    pinBtn.addEventListener('click', togglePin);
    
    // Для мобильных — кнопка гамбургера
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        // Закрытие по клику вне меню на мобильных
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }
    
    // Применяем начальное состояние
    updateMenuState();
    if (isPinned) {
        collapseBtn.style.opacity = '0.5';
        collapseBtn.style.cursor = 'not-allowed';
    }
    
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
            sidebar.classList.remove('open');
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
