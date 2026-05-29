// ===== ЛОГИКА СТРАНИЦЫ ТОВАРОВ =====
(function() {
    console.log('🟢 Инициализация страницы товаров');

    let products = [];
    let categories = [];
    let editingId = null;
    
    const sidebar = document.getElementById('productSidebar');
    const overlay = document.getElementById('productOverlay');
    const sidebarTitle = document.getElementById('sidebarTitle');
    
    function openSidebar() { 
        sidebar?.classList.add('open'); 
        overlay?.classList.add('active'); 
    }
    
    function closeSidebar() { 
        sidebar?.classList.remove('open'); 
        overlay?.classList.remove('active'); 
        editingId = null; 
        document.getElementById('productForm')?.reset(); 
        if(sidebarTitle) sidebarTitle.innerText = 'Добавить товар'; 
    }
    
    function loadData() {
        const saved = localStorage.getItem('crm_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                products = data.products || [];
                categories = data.categories || [];
            } catch(e) { console.error(e); }
        }
        if (products.length === 0) {
            products = [
                { id: 1, title: 'Хлопковая футболка', price: 1990, discount_price: null, sizes: ['S', 'M', 'L'], category_id: null },
                { id: 2, title: 'Джинсы skinny', price: 3990, discount_price: 2990, sizes: ['30', '32', '34'], category_id: null }
            ];
        }
        if (categories.length === 0) {
            categories = [
                { id: 1, title: 'Одежда' },
                { id: 2, title: 'Обувь' }
            ];
        }
        renderCategories();
        renderProducts();
    }
    
    function saveToCRM() {
        let crmData = localStorage.getItem('crm_data');
        if (crmData) {
            const data = JSON.parse(crmData);
            data.products = products;
            data.categories = categories;
            localStorage.setItem('crm_data', JSON.stringify(data));
        } else {
            localStorage.setItem('crm_data', JSON.stringify({ 
                products, categories, leads: [], messages: {}, settings: {} 
            }));
        }
        showToast('✅ Данные сохранены');
    }
    
    function renderProducts() {
        const searchTerm = document.getElementById('searchProducts')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
        
        let filtered = [...products];
        if (searchTerm) filtered = filtered.filter(p => p.title.toLowerCase().includes(searchTerm));
        if (categoryFilter !== 'all') filtered = filtered.filter(p => p.category_id == categoryFilter);
        
        const container = document.getElementById('productsGrid');
        if (!container) return;
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state">📭 Нет товаров. Добавьте первый!</div>';
            return;
        }
        
        container.innerHTML = filtered.map(p => {
            const category = categories.find(c => c.id == p.category_id);
            const hasDiscount = p.discount_price && p.discount_price < p.price;
            const sizesText = p.sizes ? p.sizes.join(', ') : '—';
            
            return `
                <div class="product-card">
                    <div class="product-image">${getIcon(p.id)}</div>
                    <div class="product-info">
                        <div class="product-title">${escapeHtml(p.title)}</div>
                        <div class="product-category">${category ? escapeHtml(category.title) : 'Без категории'}</div>
                        <div class="product-sizes">📏 Размеры: ${sizesText}</div>
                        <div class="product-price">
                            ${hasDiscount ? 
                                `<span>${p.discount_price.toLocaleString()} ₽</span>
                                 <span class="old">${p.price.toLocaleString()} ₽</span>` :
                                `<span>${p.price.toLocaleString()} ₽</span>`
                            }
                        </div>
                        <div class="product-actions">
                            <button class="edit-product" data-id="${p.id}">✏️ Редактировать</button>
                            <button class="delete-product" data-id="${p.id}">🗑️ Удалить</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', () => editProduct(parseInt(btn.dataset.id)));
        });
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', () => deleteProduct(parseInt(btn.dataset.id)));
        });
    }
    
    function getIcon(id) {
        const icons = ['👕', '👖', '👟', '👔', '🧥', '👗', '🧢', '👞'];
        return icons[(id - 1) % icons.length];
    }
    
    function renderCategories() {
        const filterSelect = document.getElementById('categoryFilter');
        const catSelect = document.getElementById('productCategory');
        const options = categories.map(c => `<option value="${c.id}">${escapeHtml(c.title)}</option>`).join('');
        
        if (filterSelect) filterSelect.innerHTML = '<option value="all">Все категории</option>' + options;
        if (catSelect) catSelect.innerHTML = '<option value="">Без категории</option>' + options;
    }
    
    function editProduct(id) {
        const product = products.find(p => p.id === id);
        if (!product) return;
        
        editingId = id;
        if(sidebarTitle) sidebarTitle.innerText = 'Редактировать товар';
        document.getElementById('productTitle').value = product.title || '';
        document.getElementById('productCategory').value = product.category_id || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productDiscount').value = product.discount_price || '';
        document.getElementById('productSizes').value = product.sizes ? product.sizes.join(', ') : '';
        openSidebar();
    }
    
    function deleteProduct(id) {
        if (confirm('Удалить товар?')) {
            products = products.filter(p => p.id !== id);
            saveToCRM();
            renderProducts();
            showToast('🗑️ Товар удалён');
        }
    }
    
    function saveProduct(e) {
        e.preventDefault();
        
        const title = document.getElementById('productTitle').value.trim();
        if (!title) {
            showToast('⚠️ Введите название товара');
            return;
        }
        
        const category_id = parseInt(document.getElementById('productCategory').value) || null;
        const price = parseInt(document.getElementById('productPrice').value) || 0;
        const discount_price = parseInt(document.getElementById('productDiscount').value) || null;
        const sizes = document.getElementById('productSizes').value.split(',').map(s => s.trim()).filter(s => s);
        
        if (editingId) {
            const index = products.findIndex(p => p.id === editingId);
            if (index !== -1) {
                products[index] = { 
                    ...products[index], 
                    title, category_id, price, 
                    discount_price: discount_price && discount_price < price ? discount_price : null, 
                    sizes 
                };
                showToast('✏️ Товар обновлён');
            }
        } else {
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({ 
                id: newId, title, category_id, price, 
                discount_price: discount_price && discount_price < price ? discount_price : null, 
                sizes, 
                created_at: new Date().toISOString() 
            });
            showToast('✅ Товар добавлен');
        }
        
        saveToCRM();
        closeSidebar();
        renderProducts();
    }
    
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'products-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    // Навешиваем обработчики
    document.getElementById('addProductBtn')?.addEventListener('click', () => {
        editingId = null;
        document.getElementById('productForm')?.reset();
        if(sidebarTitle) sidebarTitle.innerText = 'Добавить товар';
        openSidebar();
    });
    
    document.getElementById('closeSidebarBtn')?.addEventListener('click', closeSidebar);
    overlay?.addEventListener('click', closeSidebar);
    document.getElementById('productForm')?.addEventListener('submit', saveProduct);
    document.getElementById('searchProducts')?.addEventListener('input', () => renderProducts());
    document.getElementById('categoryFilter')?.addEventListener('change', () => renderProducts());
    
    loadData();
})();
