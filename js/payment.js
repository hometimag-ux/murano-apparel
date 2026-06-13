function sendOrderToCRM(orderData) {
    console.log('📤 Отправка заказа в CRM:', orderData);
    
    const orderForCRM = {
        order_id: orderData.orderId,
        date: orderData.date,
        customer: {
            name: orderData.customer.name,
            phone: orderData.customer.phone,
            email: orderData.customer.email
        },
        delivery: {
            method: orderData.delivery.method,
            price: orderData.delivery.price,
            address: orderData.address
        },
        items: orderData.items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            article: item.article
        })),
        total: orderData.total,
        payment: orderData.payment,
        comment: orderData.comment,
        status: 'new'  // Статус по умолчанию
    };
    
    // Сохраняем заказ в localStorage (crm_data)
    let crmData = localStorage.getItem('crm_data');
    let orders = [];
    
    if (crmData) {
        try {
            const data = JSON.parse(crmData);
            orders = data.orders || [];
        } catch(e) {}
    }
    
    orders.unshift(orderForCRM); // Добавляем в начало
    const newCrmData = { orders, products: [], categories: [], leads: [], messages: {}, settings: {} };
    
    // Сохраняем
    localStorage.setItem('crm_data', JSON.stringify(newCrmData));
    console.log('✅ Заказ сохранён в CRM');
}
