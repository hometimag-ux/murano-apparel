// ===== ЯДРО РЕДАКТОРА САЙТА =====
const EditorCore = {
    currentTab: 'design',
    currentView: 'desktop',
    isSidebarCollapsed: false,
    
    init: function() {
        console.log('🟢 Редактор сайта инициализирован');
        this.setupEventListeners();
        this.loadTab('design');
        this.loadSiteData();
    },
    
    setupEventListeners: function() {
        // Навигация по табам
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.dataset.tab;
                this.loadTab(tab);
            });
        });
        
        // Переключение вида (десктоп/мобильный)
        document.getElementById('desktopViewBtn')?.addEventListener('click', () => {
            this.setView('desktop');
        });
        document.getElementById('mobileViewBtn')?.addEventListener('click', () => {
            this.setView('mobile');
        });
        
        // Сворачивание боковой панели
        document.getElementById('collapseSidebarBtn')?.addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // Кнопки сохранения и публикации
        document.getElementById('saveSiteBtn')?.addEventListener('click', () => {
            this.saveSite();
        });
        document.getElementById('publishSiteBtn')?.addEventListener('click', () => {
            this.publishSite();
        });
        
        // Возврат в админку
        document.getElementById('backToAdminBtn')?.addEventListener('click', () => {
            window.location.href = '/murano-apparel/editor.html';
        });
    },
    
    loadTab: function(tab) {
        this.currentTab = tab;
        
        // Обновляем активный пункт меню
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.tab === tab) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Загружаем контент в зависимости от вкладки
        const contentArea = document.getElementById('sidebarContent');
        
        switch(tab) {
            case 'design':
                if (window.EditorDesigner) EditorDesigner.render(contentArea);
                break;
            case 'data':
                if (window.EditorData) EditorData.render(contentArea);
                break;
            case 'docs':
                if (window.EditorDocs) EditorDocs.render(contentArea);
                break;
            case 'blog':
                if (window.EditorBlog) EditorBlog.render(contentArea);
                break;
            case 'domain':
                if (window.EditorDomain) EditorDomain.render(contentArea);
                break;
            case 'counters':
                if (window.EditorCounters) EditorCounters.render(contentArea);
                break;
            case 'blocks':
                if (window.EditorBlocks) EditorBlocks.render(contentArea);
                break;
            default:
                contentArea.innerHTML = '<div style="text-align:center; padding:40px; color:#999;">Раздел в разработке</div>';
        }
    },
    
    setView: function(view) {
        this.currentView = view;
        const previewFrame = document.getElementById('previewFrame');
        const iframe = document.getElementById('sitePreview');
        
        if (view === 'mobile') {
            previewFrame.classList.add('mobile');
            iframe.src = '/murano-apparel/site/templates/preview/mobile.html';
        } else {
            previewFrame.classList.remove('mobile');
            iframe.src = '/murano-apparel/site/templates/preview/desktop.html';
        }
        
        // Обновляем активную кнопку
        document.getElementById('desktopViewBtn')?.classList.toggle('active', view === 'desktop');
        document.getElementById('mobileViewBtn')?.classList.toggle('active', view === 'mobile');
    },
    
    toggleSidebar: function() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        const sidebar = document.getElementById('sidebarEditor');
        const btn = document.getElementById('collapseSidebarBtn');
        
        if (this.isSidebarCollapsed) {
            sidebar.classList.add('collapsed');
            btn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        } else {
            sidebar.classList.remove('collapsed');
            btn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        }
    },
    
    loadSiteData: function() {
        const saved = localStorage.getItem('site_data');
        if (saved) {
            try {
                this.siteData = JSON.parse(saved);
                console.log('📀 Данные сайта загружены');
            } catch(e) {}
        }
        
        if (!this.siteData) {
            this.siteData = {
                settings: {
                    site_name: 'Murano Apparel',
                    phone: '+7 (999) 123-45-67',
                    email: 'info@murano.ru',
                    inn: '',
                    ogrn: '',
                    address: '',
                    social: {
                        vk: '',
                        tg: '',
                        whatsapp: '',
                        instagram: ''
                    }
                },
                documents: {
                    offer: '',
                    privacy: '',
                    agreement: ''
                },
                counters: {
                    metrika: '',
                    vk_pixel: '',
                    google_analytics: ''
                },
                widgets: {
                    header: ['header-banner'],
                    main: ['promo-slider', 'product-grid'],
                    footer: ['footer-subscribe']
                }
            };
        }
    },
    
    saveSite: function() {
        localStorage.setItem('site_data', JSON.stringify(this.siteData));
        this.showToast('✅ Сайт сохранён');
    },
    
    publishSite: function() {
        // Здесь будет логика публикации на сервер
        this.showToast('🚀 Сайт опубликован!');
    },
    
    showToast: function(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    EditorCore.init();
    window.EditorCore = EditorCore;
});
