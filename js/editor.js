// Editor JS - полная рабочая версия
class TemplateEditor {
    constructor() {
        this.iframe = document.getElementById('preview-frame');
        if (!this.iframe) {
            console.error('❌ Iframe не найден!');
            return;
        }
        
        this.init();
    }
    
    init() {
        console.log('🟢 Редактор инициализирован');
        this.setupDragAndDrop();
        this.updatePreview();
        
        // Обновляем превью при загрузке iframe
        this.iframe.addEventListener('load', () => {
            console.log('🟢 Iframe загружен');
            this.setupIframeEvents();
        });
    }
    
    setupDragAndDrop() {
        const widgets = document.querySelectorAll('.widget-item');
        console.log(`🟢 Найдено виджетов для перетаскивания: ${widgets.length}`);
        
        widgets.forEach(widget => {
            widget.setAttribute('draggable', 'true');
            
            widget.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', widget.dataset.widgetType);
                e.dataTransfer.effectAllowed = 'copy';
                console.log(`🟢 Начато перетаскивание: ${widget.dataset.widgetType}`);
            });
            
            widget.addEventListener('dragend', (e) => {
                console.log('🟢 Перетаскивание завершено');
            });
        });
    }
    
    setupIframeEvents() {
        const iframeDoc = this.iframe.contentDocument;
        if (!iframeDoc) {
            console.error('❌ Не удалось получить документ iframe');
            return;
        }
        
        // Находим все зоны для дропа
        const zones = ['header-list', 'index-list', 'footer-list'];
        
        zones.forEach(zone => {
            const zoneElement = iframeDoc.querySelector(`[data-widget-zone="${zone}"]`);
            if (zoneElement) {
                console.log(`🟢 Зона найдена: ${zone}`);
                
                zoneElement.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    zoneElement.style.borderColor = '#0066cc';
                    zoneElement.style.background = 'rgba(0,102,204,0.05)';
                });
                
                zoneElement.addEventListener('dragleave', () => {
                    zoneElement.style.borderColor = '#ccc';
                    zoneElement.style.background = 'transparent';
                });
                
                zoneElement.addEventListener('drop', (e) => {
                    e.preventDefault();
                    zoneElement.style.borderColor = '#ccc';
                    zoneElement.style.background = 'transparent';
                    
                    const widgetType = e.dataTransfer.getData('text/plain');
                    console.log(`🟢 Drop в зону ${zone}, виджет: ${widgetType}`);
                    
                    if (!widgetType) return;
                    
                    // Добавляем виджет в данные
                    if (!window.storeData.widget_lists[zone]) {
                        window.storeData.widget_lists[zone] = { widgets: [] };
                    }
                    
                    if (!window.storeData.widget_lists[zone].widgets.includes(widgetType)) {
                        window.storeData.widget_lists[zone].widgets.push(widgetType);
                        window.saveStoreData(window.storeData);
                        this.updatePreview();
                        console.log(`✅ Виджет ${widgetType} добавлен в зону ${zone}`);
                    } else {
                        console.log(`⚠️ Виджет ${widgetType} уже есть в зоне ${zone}`);
                    }
                });
            } else {
                console.warn(`⚠️ Зона не найдена: ${zone}`);
            }
        });
        
        // Добавляем обработчики кликов на виджеты
        this.attachClickHandlers(iframeDoc);
    }
    
    attachClickHandlers(iframeDoc) {
        const widgets = iframeDoc.querySelectorAll('[data-widget-id]');
        console.log(`🟢 Найдено виджетов для клика: ${widgets.length}`);
        
        widgets.forEach(widget => {
            widget.style.cursor = 'pointer';
            widget.addEventListener('click', (e) => {
                e.stopPropagation();
                const widgetId = widget.dataset.widgetId;
                console.log(`🟢 Клик по виджету: ${widgetId}`);
                this.showWidgetSettings(widgetId);
                
                // Убираем выделение с других
                iframeDoc.querySelectorAll('[data-widget-id]').forEach(w => {
                    w.style.outline = 'none';
                });
                widget.style.outline = '3px solid #0066cc';
            });
        });
    }
    
    showWidgetSettings(widgetId) {
        const settingsPanel = document.getElementById('settings-panel');
        if (!settingsPanel) return;
        
        const settings = window.storeData.widget_settings?.[widgetId] || {};
        
        let html = `
            <div class="settings-header" style="padding: 20px; border-bottom: 1px solid #eee;">
                <h3 style="margin:0;">⚙️ ${widgetId}</h3>
            </div>
            <div class="settings-content" style="padding: 20px;">
        `;
        
        if (widgetId === 'promo-slider') {
            html += `
                <div class="setting-field">
                    <label>🎨 Цвет фона</label>
                    <input type="color" id="bg_color" value="${settings.bg_color || '#0066cc'}">
                </div>
                <div class="setting-field">
                    <label>📝 Текст на слайдере</label>
                    <input type="text" id="slide_text" value="${settings.slide_text || 'Распродажа!'}">
                </div>
                <div class="setting-field">
                    <label>▶️ Автовоспроизведение</label>
                    <input type="checkbox" id="autoplay" ${settings.autoplay ? 'checked' : ''}>
                </div>
            `;
        } else if (widgetId === 'product-grid') {
            html += `
                <div class="setting-field">
                    <label>📌 Заголовок блока</label>
                    <input type="text" id="title" value="${settings.title || 'Наши товары'}">
                </div>
                <div class="setting-field">
                    <label>📦 Количество товаров</label>
                    <select id="product_count">
                        <option value="3" ${settings.product_count == 3 ? 'selected' : ''}>3</option>
                        <option value="6" ${settings.product_count == 6 ? 'selected' : ''}>6</option>
                        <option value="9" ${settings.product_count == 9 ? 'selected' : ''}>9</option>
                    </select>
                </div>
            `;
        } else if (widgetId === 'header-banner') {
            html += `
                <div class="setting-field">
                    <label>📢 Текст баннера</label>
                    <input type="text" id="text" value="${settings.text || 'Бесплатная доставка!'}">
                </div>
                <div class="setting-field">
                    <label>🎨 Цвет фона</label>
                    <input type="color" id="bg_color" value="${settings.bg_color || '#f8f9fa'}">
                </div>
            `;
        }
        
        html += `
                <button class="save-btn" onclick="editor.saveSettings('${widgetId}')">💾 Сохранить</button>
            </div>
        `;
        
        settingsPanel.innerHTML = html;
    }
    
    saveSettings(widgetId) {
        console.log('💾 Сохранение настроек для:', widgetId);
    
    const settings = {};
    
    if (widgetId === 'promo-slider') {
        settings.bg_color = document.getElementById('bg_color')?.value || '#0066cc';
        settings.slide_text = document.getElementById('slide_text')?.value || '';
        settings.autoplay = document.getElementById('autoplay')?.checked || false;
        console.log('🎨 Настройки слайдера:', settings);
    } else if (widgetId === 'product-grid') {
        settings.title = document.getElementById('title')?.value || 'Наши товары';
        settings.product_count = document.getElementById('product_count')?.value || 3;
        console.log('🎨 Настройки сетки:', settings);
    } else if (widgetId === 'header-banner') {
        settings.text = document.getElementById('text')?.value || '';
        settings.bg_color = document.getElementById('bg_color')?.value || '#f8f9fa';
        console.log('🎨 Настройки баннера:', settings);
    }
        
      // Инициализируем widget_settings если его нет
    if (!window.storeData.widget_settings) {
        window.storeData.widget_settings = {};
    }
    
    // Сохраняем настройки
    window.storeData.widget_settings[widgetId] = settings;
    window.saveStoreData(window.storeData);
    
    // ★★★ КРИТИЧЕСКИ ВАЖНО: принудительно обновляем все виджеты ★★★
    // Перезаписываем данные в движке
    window.liquidEngine.data = window.storeData;
    
    // Обновляем превью
    this.updatePreview();
    
    // Показываем уведомление
    const msg = `✅ Настройки для ${widgetId} сохранены! Страница обновлена.`;
    console.log(msg);
    alert(msg);
        
        const template = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: system-ui, sans-serif; padding: 20px; background: #f5f5f5; }
                    .widget-zone {
                        border: 2px dashed #ccc;
                        border-radius: 12px;
                        padding: 16px;
                        margin-bottom: 20px;
                        background: white;
                        transition: all 0.2s;
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
                        background: rgba(0,102,204,0.03);
                    }
                    [data-widget-id] {
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    [data-widget-id]:hover {
                        opacity: 0.9;
                        transform: translateY(-2px);
                    }
                    .product-card {
                        transition: transform 0.2s;
                    }
                    .product-card:hover {
                        transform: translateY(-4px);
                    }
                </style>
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
        
        try {
            const html = window.liquidEngine.parse(template);
            this.iframe.srcdoc = html;
            console.log('🟢 Превью обновлено');
        } catch(e) {
            console.error('❌ Ошибка при парсинге:', e);
        }
    }
}

// Запуск после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new TemplateEditor();
});
