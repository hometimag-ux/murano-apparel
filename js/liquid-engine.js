// Liquid Engine v1.0 - парсер шаблонов для InSales Clone
class LiquidEngine {
    constructor(data) {
        this.data = data; // Данные магазина
        this.widgets = {}; // Зарегистрированные виджеты
        this.partials = {}; // Include-файлы
    }

    // Регистрация виджета
    registerWidget(name, renderFn) {
        this.widgets[name] = renderFn;
    }

    // Регистрация partial (для include)
    registerPartial(name, content) {
        this.partials[name] = content;
    }

    // Главный метод парсинга
    parse(template) {
        let output = template;
        
        // Обработка {% include "file" %}
        output = output.replace(/\{\%\s*include\s+"([^"]+)"\s*\%\}/g, (match, filename) => {
            if (this.partials[filename]) {
                return this.parse(this.partials[filename]);
            }
            return `<!-- Partial ${filename} not found -->`;
        });
        
        // Обработка цикла {% for item in collection %}...{% endfor %}
        output = output.replace(/\{\%\s*for\s+(\w+)\s+in\s+([^\s%]+)\s*\%\}(.*?)\{\%\s*endfor\s*\%\}/gs, (match, itemName, collectionPath, content) => {
            const collection = this.getValue(collectionPath);
            if (!Array.isArray(collection)) return '';
            
            return collection.map(item => {
                const context = { ...this.data, [itemName]: item };
                return this.parseWithContext(content, context);
            }).join('');
        });
        
        // Обработка условия {% if condition %}...{% endif %}
        output = output.replace(/\{\%\s*if\s+([^%]+)\s*\%\}(.*?)\{\%\s*endif\s*\%\}/gs, (match, condition, content) => {
            const result = this.evaluateCondition(condition.trim(), this.data);
            return result ? this.parse(content) : '';
        });
        
        // Обработка виджета {% widget widgetName %}
        output = output.replace(/\{\%\s*widget\s+(\w+)\s*\%\}/g, (match, widgetName) => {
            if (typeof this.widgets[widgetName] === 'function') {
                return this.widgets[widgetName](this.data);
            }
            return `<div class="widget-error">Виджет "${widgetName}" не найден</div>`;
        });
        
        // Обработка переменных {{ variable.path }}
        output = output.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, path) => {
            return this.getValue(path.trim());
        });
        
        return output;
    }

    parseWithContext(template, context) {
        let output = template;
        
        output = output.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, path) => {
            return this.getValueFromContext(path.trim(), context);
        });
        
        output = output.replace(/\{\%\s*widget\s+(\w+)\s*\%\}/g, (match, widgetName) => {
            if (typeof this.widgets[widgetName] === 'function') {
                return this.widgets[widgetName](context);
            }
            return '';
        });
        
        return output;
    }

    getValue(path) {
        return this.getValueFromContext(path, this.data);
    }

    getValueFromContext(path, context) {
        try {
            return path.split('.').reduce((obj, key) => obj && obj[key], context) || '';
        } catch(e) {
            return '';
        }
    }

    evaluateCondition(condition, data) {
        // Обработка простых условий вида: product.price > 100
        const operators = ['==', '!=', '>', '<', '>=', '<='];
        for (const op of operators) {
            const parts = condition.split(op);
            if (parts.length === 2) {
                const left = this.getValue(parts[0].trim());
                let right = parts[1].trim();
                if ((right.startsWith('"') && right.endsWith('"')) || 
                    (right.startsWith("'") && right.endsWith("'"))) {
                    right = right.slice(1, -1);
                }
                switch(op) {
                    case '==': return left == right;
                    case '!=': return left != right;
                    case '>': return Number(left) > Number(right);
                    case '<': return Number(left) < Number(right);
                    case '>=': return Number(left) >= Number(right);
                    case '<=': return Number(left) <= Number(right);
                }
            }
        }
        // Просто проверка на истинность
        return !!this.getValue(condition);
    }
}

// Данные магазина по умолчанию
const defaultStoreData = {
    shop: {
        name: 'Murano Apparel',
        url: 'https://murano-apparel.com'
    },
    template: 'index',
    settings: {
        type_sidebar: 'normal',
        fixed_sidebar_border: ''
    },
    collections: [
        { id: 1, title: 'Новая коллекция', handle: 'new-collection', products: [1, 2] },
        { id: 2, title: 'Хиты продаж', handle: 'bestsellers', products: [3] }
    ],
    products: [
        { id: 1, title: 'Хлопковая футболка', price: '1990 ₽', image: 'tshirt.jpg', available: true },
        { id: 2, title: 'Джинсы skinny', price: '3990 ₽', image: 'jeans.jpg', available: true },
        { id: 3, title: 'Кеды белые', price: '2990 ₽', image: 'shoes.jpg', available: false }
    ],
    widget_lists: {
        'header-list': { widgets: ['header-banner'] },
        'footer-list': { widgets: [] },
        'index-list': { widgets: ['promo-slider', 'product-grid'] },
        'bottom-panel-list': { widgets: [] },
        'outside-list': { widgets: [] }
    },
    widget_settings: {}
};

// Загрузка сохранённых данных из localStorage
function loadStoreData() {
    const saved = localStorage.getItem('insales_clone_store');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            return { ...defaultStoreData, ...data };
        } catch(e) {
            console.error('Ошибка загрузки данных', e);
            return defaultStoreData;
        }
    }
    return defaultStoreData;
}

function saveStoreData(data) {
    localStorage.setItem('insales_clone_store', JSON.stringify(data));
}

// Инициализация движка
const storeData = loadStoreData();
const liquidEngine = new LiquidEngine(storeData);

// Регистрация системных partial
liquidEngine.registerPartial('system_v4_required_styles', `
    :root {
        --color-primary: #0066cc;
        --color-text: #333;
        --color-background: #fff;
    }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
`);

// Регистрация виджетов
liquidEngine.registerWidget('promo-slider', (data) => {
    const settings = data.widget_settings?.promo_slider || {};
    const autoplay = settings.autoplay ? `data-autoplay="true" data-autoplay-delay="${settings.autoplay_delay || 5}"` : '';
    return `
        <div class="promo-slider-widget" ${autoplay} style="margin: 20px 0;">
            <div class="splide" data-widget-id="promo-slider">
                <div class="splide__track">
                    <div class="splide__list">
                        <div class="splide__slide">
                            <img src="${settings.image1 || 'https://via.placeholder.com/1200x400/0066cc/white?text=Summer+Sale'}" alt="Слайд 1" style="width:100%; border-radius: 16px;">
                            ${settings.title1 ? `<div class="slide-caption"><h2>${settings.title1}</h2><p>${settings.subtitle1 || ''}</p></div>` : ''}
                        </div>
                        <div class="splide__slide">
                            <img src="${settings.image2 || 'https://via.placeholder.com/1200x400/ff6600/white?text=New+Collection'}" alt="Слайд 2" style="width:100%; border-radius: 16px;">
                            ${settings.title2 ? `<div class="slide-caption"><h2>${settings.title2}</h2><p>${settings.subtitle2 || ''}</p></div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="slider-controls" style="text-align:center; margin-top: 12px;">
                <button class="slider-prev" style="background:#333; color:white; border:none; padding:8px 16px; border-radius:8px;">◀ Назад</button>
                <button class="slider-next" style="background:#333; color:white; border:none; padding:8px 16px; border-radius:8px;">Вперед ▶</button>
            </div>
        </div>
    `;
});

liquidEngine.registerWidget('product-grid', (data) => {
    const products = data.products || [];
    return `
        <div class="product-grid-widget" style="padding: 20px;" data-widget-id="product-grid">
            <h2 style="text-align:center; margin-bottom: 24px;">${data.widget_settings?.product_grid?.title || 'Наши товары'}</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 24px;">
                ${products.map(product => `
                    <div class="product-card" style="border:1px solid #eee; border-radius: 16px; padding: 16px; text-align:center; transition: transform 0.2s;">
                        <div style="background:#f5f5f5; height:200px; border-radius:12px; margin-bottom:16px; display:flex; align-items:center; justify-content:center;">
                            🛍️ Товар
                        </div>
                        <h3 style="font-size:18px; margin:12px 0 8px;">${product.title}</h3>
                        <div style="color:#0066cc; font-weight:bold; font-size:20px;">${product.price}</div>
                        <button class="add-to-cart" data-product-id="${product.id}" style="background:#0066cc; color:white; border:none; padding:10px 20px; border-radius:30px; margin-top:16px; cursor:pointer; transition:background 0.2s;">В корзину</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
});

liquidEngine.registerWidget('header-banner', (data) => {
    return `
        <div class="header-banner-widget" style="background: #f8f9fa; padding: 12px; text-align: center; border-bottom: 1px solid #eee;" data-widget-id="header-banner">
            🔥 ${data.widget_settings?.header_banner?.text || 'Бесплатная доставка при заказе от 3000 ₽'} 🔥
        </div>
    `;
});

window.LiquidEngine = LiquidEngine;
window.liquidEngine = liquidEngine;
window.storeData = storeData;
window.saveStoreData = saveStoreData;
