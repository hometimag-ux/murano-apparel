// Liquid Engine v3 - с поддержкой переменных в теге widget
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
                
                // Обрабатываем переменные внутри цикла {{ item }}
                itemOutput = itemOutput.replace(/\{\{\s*([^}]+)\s*\}\}/g, (m, path) => {
                    return this.getValueFromContext(path.trim(), context);
                });
                
                // Обрабатываем теги {% widget variable %} где variable - это имя из цикла
                itemOutput = itemOutput.replace(/\{\%\s*widget\s+(\w+)\s*\%\}/g, (m, widgetVarName) => {
                    // widgetVarName - это 'widgetDrop', нужно получить его значение из context
                    const actualWidgetName = this.getValueFromContext(widgetVarName, context);
                    console.log(`🟢 Виджет из переменной ${widgetVarName} = ${actualWidgetName}`);
                    
                    if (actualWidgetName && typeof this.widgets[actualWidgetName] === 'function') {
                        const widgetHtml = this.widgets[actualWidgetName](context);
                        return `<div data-widget-id="${actualWidgetName}">${widgetHtml}</div>`;
                    } else if (typeof this.widgets[widgetVarName] === 'function') {
                        // Если это прямое имя виджета
                        const widgetHtml = this.widgets[widgetVarName](context);
                        return `<div data-widget-id="${widgetVarName}">${widgetHtml}</div>`;
                    }
                    console.warn(`⚠️ Виджет не найден: ${actualWidgetName || widgetVarName}`);
                    return `<div style="background:#ffcccc; padding:10px; border:1px solid red;">Виджет "${actualWidgetName || widgetVarName}" не найден</div>`;
                });
                
                result += itemOutput;
            }
            return result;
        });
        
        // 2. Обрабатываем виджеты вне циклов {% widget name %}
        output = output.replace(/\{\%\s*widget\s+(\w+)\s*\%\}/g, (match, widgetName) => {
            console.log(`🟢 Прямой вызов виджета: ${widgetName}`);
            if (typeof this.widgets[widgetName] === 'function') {
                const widgetHtml = this.widgets[widgetName](this.data);
                return `<div data-widget-id="${widgetName}">${widgetHtml}</div>`;
            }
            return match;
        });
        
        // 3. Обрабатываем обычные переменные {{ variable }}
        output = output.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, path) => {
            return this.getValue(path);
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

// Регистрируем виджеты
window.liquidEngine.registerWidget('promo-slider', (data) => {
    const settings = data.widget_settings?.promo_slider || {};
    const bgColor = settings.bg_color || '#0066cc';
    const text = settings.slide_text || 'Распродажа!';
    return `
        <div style="background:${bgColor}; color:white; padding:40px; text-align:center; border-radius:16px; margin:10px 0;">
            <div style="font-size:48px;">🎠</div>
            <div style="font-size:24px; font-weight:bold;">${text}</div>
            <div style="font-size:12px; margin-top:8px;">Промо-слайдер ✨</div>
        </div>
    `;
});

window.liquidEngine.registerWidget('product-grid', (data) => {
    const settings = data.widget_settings?.product_grid || {};
    const title = settings.title || 'Наши товары';
    const products = data.products || [];
    return `
        <div style="border:2px solid #0066cc; padding:20px; margin:10px 0; border-radius:16px; background:white;">
            <h3 style="margin:0 0 16px 0; color:#0066cc;">📦 ${title}</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px,1fr)); gap:16px;">
                ${products.map(p => `
                    <div style="border:1px solid #eee; border-radius:12px; padding:12px; text-align:center;">
                        <div style="background:#f5f5f5; height:80px; border-radius:8px;"></div>
                        <div style="font-weight:bold; margin:8px 0 4px;">${p.title}</div>
                        <div style="color:#0066cc;">${p.price}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
});

window.liquidEngine.registerWidget('header-banner', (data) => {
    const settings = data.widget_settings?.header_banner || {};
    const text = settings.text || 'Бесплатная доставка при заказе от 3000 ₽';
    const bgColor = settings.bg_color || '#f8f9fa';
    return `
        <div style="background:${bgColor}; padding:12px; text-align:center; border-bottom:1px solid #ddd;">
            🏷️ ${text}
        </div>
    `;
});

console.log('🚀 Liquid Engine v3 загружен');
console.log('📋 Зарегистрированные виджеты:', Object.keys(window.liquidEngine.widgets));
