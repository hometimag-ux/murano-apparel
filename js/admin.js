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
    
    if (saveToHistory) localStorage.setItem('lastPage', page);
    if (pageTitle) pageTitle.textContent = titles[page] || 'Страница';
    
    // Редактор виджетов
    if (page === 'widget-editor') {
        if (contentArea) {
            contentArea.innerHTML = `<iframe src="widget-editor.html" style="width:100%; height:100%; border:none; background: white; border-radius: 0;"></iframe>`;
        }
        return;
    }
    
    // Чат
    if (page === 'chat') {
        if (contentArea) {
            contentArea.innerHTML = `<iframe src="/murano-apparel/pages/chat.html" style="width:100%; height:100%; border:none; background: #f8f9fa; border-radius: 0;"></iframe>`;
        }
        return;
    }
    
    // Товары
    if (page === 'products') {
        if (contentArea) {
            contentArea.innerHTML = `<iframe src="/murano-apparel/pages/products.html" style="width:100%; height:100%; border:none; background: #f8f9fa; border-radius: 0;"></iframe>`;
        }
        return;
    }
    
    // Заказы
    if (page === 'orders') {
        if (contentArea) {
            contentArea.innerHTML = `<iframe src="/murano-apparel/pages/orders.html" style="width:100%; height:100%; border:none; background: #f8f9fa; border-radius: 0;"></iframe>`;
        }
        return;
    }
    
    // ДОСТАВКА — ИСПРАВЛЕНО!
    if (page === 'delivery') {
        if (contentArea) {
            contentArea.innerHTML = `<iframe src="/murano-apparel/pages/delivery.html" style="width:100%; height:100%; border:none; background: #f8f9fa; border-radius: 0;"></iframe>`;
        }
        return;
    }
    
    // Оплата — заглушка (пока)
    if (page === 'payment') {
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="content-card" style="display: flex; align-items: center; justify-content: center; min-height: 400px; background: white; border-radius: 20px;">
                    <div style="text-align: center; color: #999;">
                        <div style="font-size: 48px; margin-bottom: 16px;">💳</div>
                        <div>Страница "Оплата" в разработке</div>
                        <div style="margin-top: 16px; font-size: 12px;">Настройка способов оплаты будет добавлена позже</div>
                    </div>
                </div>
            `;
        }
        return;
    }
    
    // Настройки — заглушка (пока)
    if (page === 'settings') {
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="content-card" style="display: flex; align-items: center; justify-content: center; min-height: 400px; background: white; border-radius: 20px;">
                    <div style="text-align: center; color: #999;">
                        <div style="font-size: 48px; margin-bottom: 16px;">⚙️</div>
                        <div>Страница "Настройки" в разработке</div>
                        <div style="margin-top: 16px; font-size: 12px;">Системные настройки будут добавлены позже</div>
                    </div>
                </div>
            `;
        }
        return;
    }
    
    // Для остальных страниц — заглушка
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
    
    if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('open');
    }
}
