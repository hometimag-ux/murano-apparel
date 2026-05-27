// Liquid Engine v2 - полная версия с корректной обработкой виджетов
window.LiquidEngine = class LiquidEngine {
    constructor(data) {
        this.data = data;
        this.widgets = {};
    }

    registerWidget(name, renderFn) {
        this.widgets[name] = renderFn;
        console.log(`✅ Виджет зарегистрирован: ${name}`);
    }

    parse(template) {
        let output = template;
        
        // 1. Сначала обрабатываем циклы {% for ... %} ... {% endfor %}
        output = output.replace(/\{\%\s*for\s+(\w+)\s+in\s+([^\s%]+)\s*\%\}(.*?)\{\%\s*endfor\s*\%\}/gs, (match, itemName, collectionPath, content) => {
            const collection = this.getValue(collectionPath);
            if (!Array.isArray(collection)) return '';
            
            let result = '';
            for (const item of collection) {
                const context = { ...this.data, [itemName]: item };
                let itemOutput = content;
                // Обрабатываем переменные внутри цикла
                itemOutput = itemOutput.replace(/\{\{\s*([^}]+)\s*\}\}/g, (m, path) => {
                    return this.getValueFromContext(path.trim(), context);
                });
                // Обрабатываем виджеты внутри цикла
                itemOutput = this.processWidgets(itemOutput, context);
                result += itemOutput;
            }
            return result;
        });
        
        // 2. Обрабатываем виджеты {% widget name %}
        output = this.processWidgets(output, this.data);
        
        // 3. Обрабатываем обычные переменные {{ variable }}
        output = output.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, path) => {
            return this.getValue(path);
        });
        
        return output;
    }
    
    processWidgets(template, context) {
        let output = template;
        // Ищем все теги {% widget xxx %} и заменяем их на результат рендеринга
        output = output.replace(/\{\%\s*widget\s+(\w+)\s*\%\}/g, (match, widgetName) => {
            console.log(`🟢 Обработка виджета: ${widgetName}`);
            if (typeof this.widgets[widgetName] === 'function') {
                const result = this.widgets[widgetName](context);
                // Добавляем data-widget-id для возможности клика
                return `<div data-widget-id="${widgetName}">${result}</div>`;
            }
            console.warn(`⚠️ Виджет не найден: ${widgetName}`);
            return `<div style="background:#ffcccc; padding:10px; border:1px solid red;">Виджет "${widgetName}" не найден</div>`;
        });
        return output;
    }

    getValue(path) {
        return this.getValueFromContext(path, this.data);
    }

    getValueFromContext(path, context) {
        try {
            const parts = path.split('.');
            let result = context;
            for (const part of parts) {
                if (result === undefined || result === null) return '';
                result = result[part];
            }
            return result !== undefined && result !== null ? result : '';
        } catch(e) {
            return '';
        }
    }
};

// Данные магазина
window.storeData = {
    shop: { name: 'Murano Apparel', url: 'https://murano-apparel.com' },
    template: 'index',
    settings: { type_sidebar: 'normal' },
    products: [
        { id: 1, title: 'Хлопковая футболка', price: '1990 ₽', available: true },
        { id: 2, title: 'Джинсы skinny', price: '3990 ₽', available: true },
        { id: 3, title: 'Кеды белые', price: '2990 ₽', available: true }
    ],
    widget_lists: {
        'header-list': { widgets: [] },
        'index-list': { widgets: [] },
        'footer-list': { widgets: [] }
    },
    widget_settings: {}
};

// Загрузка сохранённых данных
const saved = localStorage.getItem('insales_clone_store');
if (saved) {
    try {
        const data = JSON.parse(saved);
        window.storeData = { ...window.storeData, ...data };
        console.log('📀 Данные загружены из localStorage');
    } catch(e) {}
}

// Функция сохранения
window.saveStoreData = function(data) {
    window.storeData = data;
    localStorage.setItem('insales_clone_store', JSON.stringify(data));
    console.log('💾 Данные сохранены');
};

// Создаём экземпляр движка
window.liquidEngine = new LiquidEngine(window.storeData);

// Регистрируем виджеты с красивым отображением
window.liquidEngine.registerWidget('promo-slider', (data) => {
    const settings = data.widget_settings?.promo_slider || {};
    const bgColor = settings.bg_color || '#0066cc';
    const text = settings.slide_text || 'Распродажа!';
    return `
        <div style="background:${bgColor}; color:white; padding:40px; text-align:center; border-radius:16px; margin:10px 0; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-size:48px; margin-bottom:16px;">🎠</div>
            <div style="font-size:24px; font-weight:bold;">${text}</div>
            <div style="font-size:14px; opacity:0.8; margin-top:8px;">Промо-слайдер | Нажмите для настройки</div>
        </div>
    `;
});

window.liquidEngine.registerWidget('product-grid', (data) => {
    const settings = data.widget_settings?.product_grid || {};
    const title = settings.title || 'Наши товары';
    const count = settings.product_count || 3;
    const products = data.products.slice(0, count);
    return `
        <div style="border:2px solid #0066cc; padding:20px; margin:10px 0; border-radius:16px; background:white;">
            <h3 style="margin:0 0 16px 0; color:#0066cc;">📦 ${title}</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px,1fr)); gap:16px;">
                ${products.map(p => `
                    <div class="product-card" style="border:1px solid #eee; border-radius:12px; padding:12px; text-align:center;">
                        <div style="background:#f5f5f5; height:100px; border-radius:8px; display:flex; align-items:center; justify-content:center;">🛍️</div>
                        <div style="font-weight:bold; margin:8px 0 4px;">${p.title}</div>
                        <div style="color:#0066cc;">${p.price}</div>
                    </div>
                `).join('')}
            </div>
            <div style="font-size:12px; color:#999; margin-top:12px; text-align:center;">Нажмите для настройки</div>
        </div>
    `;
});

window.liquidEngine.registerWidget('header-banner', (data) => {
    const settings = data.widget_settings?.header_banner || {};
    const text = settings.text || 'Бесплатная доставка при заказе от 3000 ₽';
    const bgColor = settings.bg_color || '#f8f9fa';
    return `
        <div style="background:${bgColor}; padding:12px; text-align:center; border-bottom:1px solid #ddd; margin:5px 0; border-radius:8px;">
            🏷️ ${text}
            <div style="font-size:10px; color:#999; margin-top:4px;">Нажмите для настройки</div>
        </div>
    `;
});

console.log('🚀 Liquid Engine v2 загружен');
console.log('📋 Зарегистрированные виджеты:', Object.keys(window.liquidEngine.widgets));
