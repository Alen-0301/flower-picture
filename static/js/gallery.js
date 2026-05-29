// 花艺展示页 - 前台 JS

async function loadFlowers() {
    const gallery = document.getElementById('gallery');
    try {
        const resp = await fetch('/api/flowers');
        const data = await resp.json();
        const flowers = data.flowers || [];

        if (flowers.length === 0) {
            gallery.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🌷</div>
                    <p>花束正在准备中，敬请期待...</p>
                </div>`;
            return;
        }

        gallery.innerHTML = flowers.map(flower => `
            <div class="flower-card">
                <div class="img-wrapper">
                    ${flower.image
                        ? `<img src="/static/${flower.image}" alt="${flower.name}" loading="lazy">`
                        : `<span class="img-placeholder">🌸</span>`}
                </div>
                <div class="card-body">
                    <div class="card-header">
                        <h3>${escapeHtml(flower.name)}</h3>
                        ${flower.price ? `<span class="price">${escapeHtml(flower.price)}</span>` : ''}
                    </div>
                    <p class="desc">${escapeHtml(flower.description)}</p>
                </div>
            </div>
        `).join('');

    } catch (err) {
        gallery.innerHTML = '<div class="loading">加载失败，请稍后再试 🌸</div>';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => { loadFlowers(); loadShopInfo(); });

async function loadShopInfo() {
    try {
        const resp = await fetch('/api/shopinfo');
        const info = await resp.json();
        if (info.address) document.getElementById('footerAddress').textContent = info.address;
        if (info.phone) document.getElementById('footerPhone').textContent = info.phone;
        if (info.footerNote) document.getElementById('footerNote').textContent = info.footerNote;
    } catch (e) { /* 加载失败保持默认值 */ }
}
