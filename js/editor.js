// Editor JS - Drag & Drop редактор шаблонов
class TemplateEditor {
    constructor() {
        this.currentWidget = null;
        this.init();
    }

    init() {
        this.setupDragAndDrop();
        this.setupWidgetSelection();
        this.setupGlobalListeners();
        this.loadPreview();
    }

    setupDragAndDrop() {
        const widgets = document.querySelectorAll('.widget-item');
        
        widgets.forEach(widget => {
            widget.setAttribute('draggable', 'true');
            
            widget.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', widget.dataset.widgetType);
                e.dataTransfer.effectAllowed = 'copy';
                widget.classList.add('dragging');
            });
            
            widget.addEventListener('dragend', (e) => {
                widget.classList.remove('dragging');
            });
        });
    }

    setupWidgetSelection() {
        const iframe = document.getElementById('preview-frame');
        if (!iframe) return;
        
        iframe.addEventListener('load', () => {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // Добавляем возможность выбора виджетов в превью
            const style = iframeDoc.createElement('style');
            style.textContent = `
                [data-widget-id] {
                    cursor: pointer;
                    position: relative;
                    transition: outline 0.2s, box-shadow 0.2s;
                }
                [data-widget-id]:hover {
                    outline: 2px solid #0066cc;
                    box-shadow: 0 0 0 4px rgba(0,102,204,0.1);
                }
                [data-widget-id].selected {
                    outline: 3px solid #0066cc;
                    box-shadow: 0 0 0 4px rgba(0,102,204,0.3);
                }
            `;
            iframeDoc.head.appendChild(style);
            
            // Обработчики клика по виджетам
            const widgetsList = iframeDoc.querySelectorAll('[data-widget-id]');
            widgetsList.forEach(widget => {
                widget.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectWidget(widget.dataset.widgetId, iframeDoc);
                });
            });
        });
    }

    selectWidget(widgetId, iframeDoc) {
        // Убираем выделение со всех виджетов
        if (iframeDoc) {
            const allWidgets = iframeDoc.querySelectorAll('[data-widget-id]');
            allWidgets.forEach(w => w.classList.remove('selected'));
            
            const selected = iframeDoc.querySelector(`[data-widget-id="${widgetId}"]`);
            if (selected) selected.classList.add('selected');
        }
        
        this.currentWidget = widgetId;
        this.loadWidgetSettings(widgetId);
    }

    loadWidgetSettings(widgetId) {
        const settingsPanel = document.getElementById('settings-panel');
        if (!settingsPanel) return;
        
        const settings = window.storeData.widget_settings?.[widgetId] || {};
        
        let html = `<h3>⚙️ Настройки: ${widgetId}</h3>`;
        
        switch(widgetId) {
            case 'promo-slider':
                html += `
                    <div class="setting-field">
                        <label>🖼️ Изображение слайда 1 (URL)</label>
                        <input type="text" id="img1" value="${settings.image1 || ''}" placeholder="https://...">
                    </div>
                    <div class="setting-field">
                        <label>📝 Заголовок слайда 1</label>
                        <input type="text" id="title1" value="${settings.title1 || 'Летняя распродажа'}" placeholder="Заголовок">
                    </div>
                    <div class="setting-field">
                        <label>📄 Подзаголовок слайда 1</label>
                        <input type="text" id="subtitle1" value="${settings.subtitle1 || 'Скидки до 50%'}" placeholder="Подзаголовок">
                    </div>
                    <div class="setting-field">
                        <label>🖼️ Изображение слайда 2 (URL)</label>
                        <input type="text" id="img2" value="${settings.image2 || ''}" placeholder="https://...">
                    </div>
                    <div class="setting-field">
                        <label>📝 Заголовок слайда 2</label>
                        <input type="text" id="title2" value="${settings.title2 || 'Новая коллекция'}" placeholder="Заголовок">
                    </div>
                    <div class="setting-field">
                        <label>📄 Подзаголовок слайда 2</label>
                        <input type="text" id="subtitle2" value="${settings.subtitle2 || 'Успейте купить'}" placeholder="Подзаголовок">
                    </div>
                    <div class="setting-field">
                        <label>▶️ Автовоспроизведение</label>
                        <input type="checkbox" id="autoplay" ${settings.autoplay ? 'checked' : ''}>
                    </div>
                    <div class="setting-field">
                        <label>⏱️ Задержка (сек)</label>
                        <input type="number" id="autoplay_delay" value="${settings.autoplay_delay || 5}">
                    </div>
                `;
                break;
            case 'product-grid':
                html += `
                    <div class="setting-field">
                        <label>📌 Заголовок блока</label>
                        <input type="text" id="title" value="${settings.title || 'Наши товары'}">
                    </div>
                    <div class="setting-field">
                        <label>📦 Количество товаров</label>
                        <select id="product_count">
                            <option value="3" ${settings.product_count == 3 ? 'selected' : ''}>3 товара</option>
                            <option value="6" ${settings.product_count == 6 ? 'selected' : ''}>6 товаров</option>
                            <option value="9" ${settings.product_count == 9 ? 'selected' : ''}>9 товаров</option>
                        </select>
                    </div>
                `;
                break;
            case 'header-banner':
                html += `
                    <div class="setting-field">
                        <label>📢 Текст баннера</label>
                        <input type="text" id="text" value="${settings.text || 'Бесплатная доставка при заказе от 3000 ₽'}">
                    </div>
                    <div class="setting-field">
                        <label>🎨 Цвет фона</label>
                        <input type="color" id="bg_color" value="${settings.bg_color || '#f8f9fa'}">
                    </div>
                `;
                break;
            default:
                html += `<p style="color:#999;">Настройки для этого виджета не предусмотрены</p>`;
        }
        
        html += `<button class="save-btn" onclick="editor.saveWidgetSettings()">💾 Сохранить настройки</button>`;
        settingsPanel.innerHTML = html;
    }

    saveWidgetSettings() {
        if (!this.currentWidget) {
            alert('Выберите виджет на странице');
            return;
        }
        
        const settings = {};
        
        switch(this.currentWidget) {
            case 'promo-slider':
                settings.image1 = document.getElementById('img1')?.value || '';
                settings.title1 = document.getElementById('title1')?.value || '';
                settings.subtitle1 = document.getElementById('subtitle1')?.value || '';
                settings.image2 = document.getElementById('img2')?.value || '';
                settings.title2 = document.getElementById('title2')?.value || '';
                settings.subtitle2 = document.getElementById('subtitle2')?.value || '';
                settings.autoplay = document.getElementById('autoplay')?.checked || false;
                settings.autoplay_delay = document.getElementById('autoplay_delay')?.value || 5;
                break;
            case 'product-grid':
                settings.title = document.getElementById('title')?.value || 'Наши товары';
                settings.product_count = document.getElementById('product_count')?.value || 3;
                break;
            case 'header-banner':
                settings.text = document.getElementById('text')?.value || '';
                settings.bg_color = document.getElementById('bg_color')?.value || '#f8f9fa';
                break;
        }
        
        if (!window.storeData.widget_settings) {
            window.storeData.widget_settings = {};
        }
        window.storeData.widget_settings[this.currentWidget] = settings;
        
        window.saveStoreData(window.storeData);
        this.loadPreview();
        
        alert('✅ Настройки сохранены! Страница обновлена.');
    }

    setupGlobalListeners() {
        // Обработка drop в iframe
        const iframe = document.getElementById('preview-frame');
        if (!iframe) return;
        
        iframe.addEventListener('load', () => {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // Создаем зоны для дропа
            const zones = ['header-list', 'footer-list', 'index-list'];
            zones.forEach(zone => {
                const zoneElement = iframeDoc.querySelector(`[data-widget-zone="${zone}"]`);
                if (zoneElement) {
                    zoneElement.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        zoneElement.classList.add('drag-over');
                    });
                    zoneElement.addEventListener('dragleave', () => {
                        zoneElement.classList.remove('drag-over');
                    });
                    zoneElement.addEventListener('drop', (e) => {
                        e.preventDefault();
                        zoneElement.classList.remove('drag-over');
                        const widgetType = e.dataTransfer.getData('text/plain');
                        this.addWidgetToZone(zone, widgetType);
                    });
                }
            });
        });
    }

    addWidgetToZone(zone, widgetType) {
        if (!window.storeData.widget_lists[zone]) {
            window.storeData.widget_lists[zone] = { widgets: [] };
        }
        
        if (!window.storeData.widget_lists[zone].widgets.includes(widgetType)) {
            window.storeData.widget_lists[zone].widgets.push(widgetType);
            window.saveStoreData(window.storeData);
            this.loadPreview();
            console.log(`✅ Виджет ${widgetType} добавлен в зону ${zone}`);
        } else {
            alert('Этот виджет уже добавлен в данную зону');
        }
    }

    loadPreview() {
        const iframe = document.getElementById('preview-frame');
        if (!iframe) return;
        
        const template = this.generateTemplate();
        iframe.srcdoc = template;
    }

    generateTemplate() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${window.storeData.shop.name} — Превью</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: system-ui, -apple-system, sans-serif; background: #fff; }
                    .widget-zone { 
                        min-height: 80px; 
                        border: 2px dashed #ddd; 
                        margin: 12px; 
                        padding: 16px; 
                        border-radius: 12px; 
                        transition: all 0.2s;
                        background: rgba(0,0,0,0.02);
                    }
                    .widget-zone::before { 
                        content: "📌 " attr(data-widget-zone); 
                        display: block; 
                        font-size: 11px; 
                        color: #999; 
                        margin-bottom: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .widget-zone.drag-over {
                        border-color: #0066cc;
                        background: rgba(0,102,204,0.05);
                    }
                    [data-widget-id] { transition: all 0.2s; }
                    .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
                    .add-to-cart:hover { background: #0052a3 !important; }
                </style>
                <script>
                    // Базовая логика корзины для демо
                    document.addEventListener('click', function(e) {
                        if (e.target.classList.contains('add-to-cart')) {
                            alert('Товар добавлен в корзину (демо-режим)');
                        }
                    });
                    
                    // Простая логика слайдера
                    document.addEventListener('DOMContentLoaded', function() {
                        document.querySelectorAll('.slider-prev').forEach(btn => {
                            btn.addEventListener('click', function() {
                                const slider = this.closest('.promo-slider-widget');
                                const track = slider.querySelector('.splide__track');
                                if (track) track.scrollBy({ left: -400, behavior: 'smooth' });
                            });
                        });
                        document.querySelectorAll('.slider-next').forEach(btn => {
                            btn.addEventListener('click', function() {
                                const slider = this.closest('.promo-slider-widget');
                                const track = slider.querySelector('.splide__track');
                                if (track) track.scrollBy({ left: 400, behavior: 'smooth' });
                            });
                        });
                    });
                </script>
            </head>
            <body>
                <div class="widget-zone" data-widget-zone="header-list">
                    {% for widgetDrop in widget_lists.header-list.widgets %}
                        {% widget widgetDrop %}
                    {% endfor %}
                </div>
                
                <div class="widget-zone" data-widget-zone="index-list">
                    {% for widgetDrop in widget_lists.index-list.widgets %}
                        {% widget widgetDrop %}
                    {% endfor %}
                </div>
                
                <div class="widget-zone" data-widget-zone="footer-list">
                    {% for widgetDrop in widget_lists.footer-list.widgets %}
                        {% widget widgetDrop %}
                    {% endfor %}
                </div>
            </body>
            </html>
        `;
    }
}

// Запуск после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new TemplateEditor();
});
