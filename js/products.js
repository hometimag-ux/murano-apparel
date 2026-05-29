console.log('✅ products.js загружен!');
alert('Скрипт товаров работает!');

let products = [];
let categories = [];

function loadData() {
    const saved = localStorage.getItem('crm_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            products = data.products || [];
            categories = data.categories || [];
        } catch(e) {}
    }
    console.log('Товаров загружено:', products.length);
    console.log('Категорий:', categories);
}

loadData();
