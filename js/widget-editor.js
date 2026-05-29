// ========== РЕДАКТОР ВИДЖЕТОВ ==========
class WidgetEditor {
    constructor() {
        this.iframe = document.getElementById('preview-frame');
        this.settingsPanel = document.getElementById('settings-panel');
        this.currentWidget = null;
        
        if (!this.iframe) return;
        
        this.init();
    }
    
    init() {
        console.log('🟢 Редактор виджетов инициализирован');
        this.setupDragAndDrop();
        this.updatePreview();
        this.iframe.addEventListener('load', () => this.setupIframeEvents());
    }
    
    setupDragAndDrop() {
        const widgets = document.querySelectorAll('.widget-item');
        
        widgets.forEach(widget => {
            widget.setAttribute('draggable', 'true');
            
            widget.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', widget.dataset.widgetType);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });
    }
    
    setupIframeEvents() {
        const iframeDoc = this.iframe.contentDocument;
        if (!iframeDoc) return;
        
        // Обработка drop в iframe
        const zones = ['header', 'main', 'footer'];
        
        zones.forEach(zone => {
            const zoneElement = iframeDoc.querySelector(`[data-zone="${zone}"]`);
            if (zoneElement) {
                zoneElement.addEventListener('dragover', (e) => e.preventDefault());
                zoneElement.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const widgetType = e.dataTransfer.getData('text/plain');
                    this.addWidgetToZone(zone, widgetType);
                });
            }
        });
        
        // Обработка кликов по виджетам
        const widgetsList = iframeDoc.querySelectorAll('[data-widget]');
        widgetsList.forEach(widget => {
            widget.style.cursor = 'pointer';
            widget.addEventListener('click', (e) => {
                e.stopPropagation();
                const widgetName = widget.dataset.widget;
                this.showWidgetSettings(widgetName);
            });
        });
    }
    
    addWidgetToZone(zone, widgetType) {
        console.log(`✅ Виджет ${widgetType} добавлен в зону ${zone}`);
        // Здесь логика сохранения и обновления
        this.updatePreview();
    }
    
    showWidgetSettings(widgetName) {
        this.currentWidget = widgetName;
        
        let html = '';
        
        if (widgetName === 'header-banner') {
            html = `
                <div class="setting-field">
                    <label>📢 Текст баннера</label>
                    <input type="text" id="banner-text" value="Бесплатная доставка от 3000 ₽">
                </div>
                <div class="setting-field">
                    <label>🎨 Цвет фона</label>
                    <input type="color" id="banner-bg" value="#f8f9fa">
                </div>
                <button class="save-btn" onclick="widgetEditor.saveWidgetSettings()">💾 Сохранить</button>
            `;
        } else if (widgetName === 'promo-slider') {
            html = `
                <div class="setting-field">
                    <label>🖼️ Ссылка на изображение</label>
                    <input type="text" id="slide-image" value="https://via.placeholder.com/1200x400/0066cc/white">
                </div>
                <div class="setting-field">
                    <label>📝 Заголовок</label>
                    <input type="text" id="slide-title" value="Летняя распродажа">
                </div>
                <div class="setting-field">
                    <label>▶️ Автовоспроизведение</label>
                    <input type="checkbox" id="autoplay">
                </div>
                <button class="save-btn" onclick="widgetEditor.saveWidgetSettings()">💾 Сохранить</button>
            `;
        } else {
            html = `<div class="empty-settings">Настройки для ${widgetName} будут добавлены позже</div>`;
        }
        
        this.settingsPanel.innerHTML = html;
    }
    
    saveWidgetSettings() {
        const settings = {};
        
        if (this.currentWidget === 'header-banner') {
            settings.text = document.getElementById('banner-text')?.value || '';
            settings.bg_color = document.getElementById('banner-bg')?.value || '';
        } else if (this.currentWidget === 'promo-slider') {
            settings.image = document.getElementById('slide-image')?.value || '';
            settings.title = document.getElementById('slide-title')?.value || '';
            settings.autoplay = document.getElementById('autoplay')?.checked || false;
        }
        
        console.log('Сохранены настройки:', settings);
        this.updatePreview();
        alert('Настройки сохранены!');
    }
    
    updatePreview() {
        const template = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: system-ui, sans-serif; padding: 20px; }
                    .widget-zone { border: 2px dashed #ccc; padding: 16px; margin: 10px 0; border-radius: 12px; }
                    .widget-zone::before { content: "📌 " attr(data-zone); display: block; font-size: 12px; color: #999; margin-bottom: 8px; }
                    .header-banner { background: #f8f9fa; padding: 12px; text-align: center; border-radius: 8px; }
                    .promo-slider { background: #0066cc; color: white; padding: 40px; text-align: center; border-radius: 16px; }
                    .product-grid { border: 1px solid #eee; padding: 20px; border-radius: 16px; }
                </style>
            </head>
            <body>
                <div class="widget-zone" data-zone="header">
                    <div class="header-banner" data-widget="header-banner">🏷️ Бесплатная доставка от 3000 ₽</div>
                </div>
                <div class="widget-zone" data-zone="main">
                    <div class="promo-slider" data-widget="promo-slider">🎠 Промо-слайдер</div>
                    <div class="product-grid" data-widget="product-grid">📦 Сетка товаров</div>
                </div>
                <div class="widget-zone" data-zone="footer">
                    <div>© 2024 Murano Apparel</div>
                </div>
            </body>
            </html>
        `;
        
        this.iframe.srcdoc = template;
    }
}

// Запуск
let widgetEditor;
document.addEventListener('DOMContentLoaded', () => {
    widgetEditor = new WidgetEditor();
    window.widgetEditor = widgetEditor;
});
