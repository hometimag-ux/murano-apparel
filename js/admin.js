async function loadPage(page, saveToHistory = true) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    if (saveToHistory) localStorage.setItem('lastPage', page);
    if (pageTitle) pageTitle.textContent = titles[page] || 'Страница';
    
    if (page === 'widget-editor') {
        if (contentArea) {
            contentArea.innerHTML = `<iframe src="widget-editor.html" style="width:100%; height:100%; border:none;"></iframe>`;
        }
        return;
    }
    
    // Для всех остальных страниц — используем iframe
    let pageFile = page;
    if (page === 'products') pageFile = 'products';
    
    if (contentArea) {
        contentArea.innerHTML = `<iframe src="/murano-apparel/pages/${pageFile}.html" style="width:100%; height:100%; border:none; background: white;"></iframe>`;
    }
    
    if (window.innerWidth <= 768 && sidebar) sidebar.classList.remove('open');
}
