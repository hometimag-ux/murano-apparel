// ===== УПРАВЛЕНИЕ ДАННЫМИ САЙТА =====
window.EditorData = {
    render: function(container) {
        const data = window.EditorCore.siteData;
        
        container.innerHTML = `
            <h3 style="margin-bottom: 16px;"><i class="fas fa-building"></i> Реквизиты компании</h3>
            
            <div class="form-group">
                <label>Название магазина</label>
                <input type="text" id="siteName" value="${escapeHtml(data.settings.site_name || '')}">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>ИНН</label>
                    <input type="text" id="siteInn" value="${escapeHtml(data.settings.inn || '')}">
                </div>
                <div class="form-group">
                    <label>ОГРН</label>
                    <input type="text" id="siteOgrn" value="${escapeHtml(data.settings.ogrn || '')}">
                </div>
            </div>
            
            <div class="form-group">
                <label>Юридический адрес</label>
                <textarea id="siteAddress" rows="2">${escapeHtml(data.settings.address || '')}</textarea>
            </div>
            
            <div class="form-group">
                <label>Телефон</label>
                <input type="tel" id="sitePhone" value="${escapeHtml(data.settings.phone || '')}">
            </div>
            
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="siteEmail" value="${escapeHtml(data.settings.email || '')}">
            </div>
            
            <h3 style="margin: 20px 0 16px;"><i class="fas fa-share-alt"></i> Социальные сети</h3>
            
            <div class="form-group">
                <label><i class="fab fa-vk"></i> ВКонтакте</label>
                <input type="url" id="socialVk" value="${escapeHtml(data.settings.social?.vk || '')}" placeholder="https://vk.com/...">
            </div>
            
            <div class="form-group">
                <label><i class="fab fa-telegram"></i> Telegram</label>
                <input type="url" id="socialTg" value="${escapeHtml(data.settings.social?.tg || '')}" placeholder="https://t.me/...">
            </div>
            
            <div class="form-group">
                <label><i class="fab fa-whatsapp"></i> WhatsApp</label>
                <input type="url" id="socialWhatsapp" value="${escapeHtml(data.settings.social?.whatsapp || '')}" placeholder="https://wa.me/...">
            </div>
            
            <div class="form-group">
                <label><i class="fab fa-instagram"></i> Instagram</label>
                <input type="url" id="socialInstagram" value="${escapeHtml(data.settings.social?.instagram || '')}" placeholder="https://instagram.com/...">
            </div>
            
            <button class="btn-primary" id="saveDataBtn" style="width:100%; margin-top:16px;">
                <i class="fas fa-save"></i> Сохранить данные
            </button>
        `;
        
        document.getElementById('saveDataBtn')?.addEventListener('click', () => {
            window.EditorCore.siteData.settings = {
                site_name: document.getElementById('siteName')?.value || '',
                inn: document.getElementById('siteInn')?.value || '',
                ogrn: document.getElementById('siteOgrn')?.value || '',
                address: document.getElementById('siteAddress')?.value || '',
                phone: document.getElementById('sitePhone')?.value || '',
                email: document.getElementById('siteEmail')?.value || '',
                social: {
                    vk: document.getElementById('socialVk')?.value || '',
                    tg: document.getElementById('socialTg')?.value || '',
                    whatsapp: document.getElementById('socialWhatsapp')?.value || '',
                    instagram: document.getElementById('socialInstagram')?.value || ''
                }
            };
            window.EditorCore.saveSite();
        });
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}
