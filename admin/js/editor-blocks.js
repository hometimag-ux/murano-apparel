// ===== КОНСТРУКТОР БЛОКОВ =====
window.EditorBlocks = {
    availableBlocks: [
        { id: 'promo-slider', name: 'Промо-слайдер', icon: '🎠', description: 'Карусель изображений', category: 'hero' },
        { id: 'product-grid', name: 'Сетка товаров', icon: '📦', description: 'Вывод товаров каталога', category: 'products' },
        { id: 'header-banner', name: 'Баннер в шапке', icon: '🏷️', description: 'Информационная строка', category: 'header' },
        { id: 'category-list', name: 'Категории', icon: '📁', description: 'Список категорий товаров', category: 'catalog' },
        { id: 'blog-posts', name: 'Блог', icon: '📝', description: 'Последние статьи блога', category: 'content' },
        { id: 'contact-form', name: 'Форма связи', icon: '📧', description: 'Форма обратной связи', category: 'forms' },
        { id: 'social-links', name: 'Соцсети', icon: '🔗', description: 'Ссылки на социальные сети', category: 'footer' },
        { id: 'footer-subscribe', name: 'Подписка', icon: '✉️', description: 'Форма подписки на новости', category: 'footer' }
    ],
    
    zones: [
        { id: 'header', name: 'Шапка сайта', description: 'Блоки в верхней части' },
        { id: 'main', name: 'Основная область', description: 'Главный контент страницы' },
        { id: 'footer', name: 'Подвал', description: 'Нижняя часть сайта' }
    ],
    
    render: function(container) {
        const widgets = window.EditorCore.siteData.widgets || { header: [], main: [], footer: [] };
        
        container.innerHTML = `
            <div style="margin-bottom: 24px;">
                <h3 style="margin-bottom: 12px;"><i class="fas fa-puzzle-piece"></i> Доступные блоки</h3>
                <div class="blocks-grid" id="availableBlocks">
                    ${this.availableBlocks.map(block => `
                        <div class="block-card" draggable="true" data-block-id="${block.id}">
                            <div class="block-icon">${block.icon}</div>
                            <div class="block-title">${block.name}</div>
                            <div style="font-size: 10px; color: #999;">${block.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <h3 style="margin-bottom: 12px;"><i class="fas fa-layer-group"></i> Зоны сайта</h3>
            
            ${this.zones.map(zone => `
                <div style="margin-bottom: 20px; border: 1px solid #eee; border-radius: 16px; overflow: hidden;">
                    <div style="background: #f8f9fa; padding: 12px; font-weight: 600; border-bottom: 1px solid #eee;">
                        <i class="fas ${zone.id === 'header' ? 'fa-arrow-up' : zone.id === 'footer' ? 'fa-arrow-down' : 'fa-home'}"></i> ${zone.name}
                        <span style="font-size: 11px; font-weight: normal; color: #999;">${zone.description}</span>
                    </div>
                    <div class="zone-dropzone" data-zone="${zone.id}" style="min-height: 100px; padding: 12px; background: #fafafa;">
                        ${(widgets[zone.id] || []).map(widgetId => {
                            const block = this.availableBlocks.find(b => b.id === widgetId);
                            return `
                                <div class="zone-widget" data-widget="${widgetId}" style="background: white; border-radius: 12px; padding: 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e0e0e0;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span style="font-size: 20px;">${block?.icon || '📦'}</span>
                                        <span>${block?.name || widgetId}</span>
                                    </div>
                                    <button class="remove-widget" data-zone="${zone.id}" data-widget="${widgetId}" style="background: none; border: none; color: #f44336; cursor: pointer;">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `;
                        }).join('')}
                        ${(widgets[zone.id] || []).length === 0 ? '<div style="text-align: center; padding: 30px; color: #999;">Перетащите блок сюда</div>' : ''}
                    </div>
                </div>
            `).join('')}
            
            <button class="btn-primary" id="saveBlocksBtn" style="width:100%;">
                <i class="fas fa-save"></i> Сохранить структуру
            </button>
        `;
        
        this.setupDragAndDrop();
        this.setupRemoveButtons();
        document.getElementById('saveBlocksBtn')?.addEventListener('click', () => this.saveBlocks());
    },
    
    setupDragAndDrop: function() {
        const blocks = document.querySelectorAll('.block-card');
        const dropZones = document.querySelectorAll('.zone-dropzone');
        
        blocks.forEach(block => {
            block.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', block.dataset.blockId);
                block.style.opacity = '0.5';
            });
            block.addEventListener('dragend', (e) => {
                block.style.opacity = '1';
            });
        });
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.style.background = '#e3f2fd';
            });
            zone.addEventListener('dragleave', (e) => {
                zone.style.background = '#fafafa';
            });
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.style.background = '#fafafa';
                const blockId = e.dataTransfer.getData('text/plain');
                const zoneId = zone.dataset.zone;
                this.addWidgetToZone(zoneId, blockId);
            });
        });
    },
    
    setupRemoveButtons: function() {
        document.querySelectorAll('.remove-widget').forEach(btn => {
            btn.addEventListener('click', () => {
                const zone = btn.dataset.zone;
                const widget = btn.dataset.widget;
                this.removeWidgetFromZone(zone, widget);
            });
        });
    },
    
    addWidgetToZone: function(zoneId, widgetId) {
        const widgets = window.EditorCore.siteData.widgets;
        if (!widgets[zoneId]) widgets[zoneId] = [];
