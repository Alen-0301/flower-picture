// 管理后台 JS

let adminPassword = '';
let flowers = [];

// ===== 登录 =====
async function login() {
    const pw = document.getElementById('passwordInput').value;
    const hint = document.getElementById('loginHint');

    try {
        const resp = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pw })
        });
        if (resp.ok) {
            adminPassword = pw;
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('adminContainer').style.display = 'block';
            loadFlowerList();
            loadShopInfo();
        } else {
            hint.textContent = '密码错误，请重试';
        }
    } catch (err) {
        hint.textContent = '连接失败，请检查服务器';
    }
}

document.getElementById('passwordInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') login();
});

function logout() {
    adminPassword = '';
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('adminContainer').style.display = 'none';
    document.getElementById('passwordInput').value = '';
    document.getElementById('loginHint').textContent = '';
}

// ===== 花卉列表 =====
async function loadFlowerList() {
    try {
        const resp = await fetch('/api/flowers');
        const data = await resp.json();
        flowers = data.flowers || [];
        renderFlowerList();
    } catch (err) {
        document.getElementById('flowerList').innerHTML = '<p class="loading">加载失败</p>';
    }
}

function renderFlowerList() {
    const container = document.getElementById('flowerList');
    if (flowers.length === 0) {
        container.innerHTML = '<p style="color:#8b7355;text-align:center;padding:30px">还没有花束，快来添加第一束吧 🌸</p>';
        return;
    }
    container.innerHTML = flowers.map((f, i) => `
        <div class="flower-list-item">
            ${f.image
                ? `<img src="/static/${f.image}" alt="${f.name}">`
                : `<span style="font-size:2.5em">🌸</span>`}
            <div class="info">
                <h4>${esc(f.name)}</h4>
                <p>${esc(f.description)}</p>
                ${f.price ? `<small style="color:#d4788f">${esc(f.price)}</small>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn btn-outline btn-small" onclick="editFlower(${f.id})">编辑</button>
                <button class="btn btn-danger btn-small" onclick="deleteFlower(${f.id})">删除</button>
            </div>
        </div>
    `).join('');
}

// ===== 添加花卉 =====
async function addFlower() {
    const nameEl = document.getElementById('newName');
    const descEl = document.getElementById('newDesc');
    const priceEl = document.getElementById('newPrice');
    const imageEl = document.getElementById('newImage');

    const name = nameEl.value.trim();
    const desc = descEl.value.trim();
    const price = priceEl.value.trim();

    if (!name || !desc) {
        alert('请填写花名和介绍语');
        return;
    }

    let imageUrl = '';
    // 先上传图片
    if (imageEl.files.length > 0) {
        const formData = new FormData();
        formData.append('file', imageEl.files[0]);
        formData.append('password', adminPassword);

        try {
            const uploadResp = await fetch('/api/upload', { method: 'POST', body: formData });
            if (uploadResp.ok) {
                const result = await uploadResp.json();
                imageUrl = result.url;
            } else {
                alert('图片上传失败');
                return;
            }
        } catch (err) {
            alert('图片上传失败');
            return;
        }
    }

    try {
        const resp = await fetch('/api/flowers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Password': adminPassword
            },
            body: JSON.stringify({ name, description: desc, price, image: imageUrl })
        });
        if (resp.ok) {
            nameEl.value = '';
            descEl.value = '';
            priceEl.value = '';
            imageEl.value = '';
            document.getElementById('newImagePreview').style.display = 'none';
            loadFlowerList();
            loadShopInfo();
        } else {
            alert('添加失败');
        }
    } catch (err) {
        alert('添加失败');
    }
}

// 图片预览
document.getElementById('newImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            document.getElementById('newImgPreview').src = ev.target.result;
            document.getElementById('newImagePreview').style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }
});

// ===== 编辑花卉 =====
function editFlower(id) {
    const flower = flowers.find(f => f.id === id);
    if (!flower) return;

    // 移除旧弹窗
    const oldModal = document.querySelector('.modal-overlay');
    if (oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal">
            <h3>✏️ 编辑「${esc(flower.name)}」</h3>
            <div class="form-group">
                <label>花名</label>
                <input type="text" id="editName" value="${esc(flower.name)}">
            </div>
            <div class="form-group">
                <label>价格</label>
                <input type="text" id="editPrice" value="${esc(flower.price || '')}">
            </div>
            <div class="form-group">
                <label>介绍语</label>
                <textarea id="editDesc" rows="3">${esc(flower.description)}</textarea>
            </div>
            <div class="form-group">
                <label>更换图片（可选）</label>
                <input type="file" id="editImage" accept="image/*">
                <small style="color:#8b7355">${flower.image ? '当前图片: ' + flower.image : '暂无图片'}</small>
            </div>
            <div class="modal-actions">
                <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">取消</button>
                <button class="btn btn-primary" id="saveEditBtn">💾 保存</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('saveEditBtn').addEventListener('click', async function() {
        const newName = document.getElementById('editName').value.trim();
        const newPrice = document.getElementById('editPrice').value.trim();
        const newDesc = document.getElementById('editDesc').value.trim();
        const newImageEl = document.getElementById('editImage');

        if (!newName || !newDesc) { alert('请填写花名和介绍语'); return; }

        let imageUrl = flower.image;
        if (newImageEl.files.length > 0) {
            const formData = new FormData();
            formData.append('file', newImageEl.files[0]);
            formData.append('password', adminPassword);
            try {
                const uploadResp = await fetch('/api/upload', { method: 'POST', body: formData });
                if (uploadResp.ok) {
                    const result = await uploadResp.json();
                    imageUrl = result.url;
                }
            } catch (err) { /* 保留原图 */ }
        }

        try {
            const resp = await fetch('/api/flowers/' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Password': adminPassword
                },
                body: JSON.stringify({ name: newName, description: newDesc, price: newPrice, image: imageUrl })
            });
            if (resp.ok) {
                overlay.remove();
                loadFlowerList();
            loadShopInfo();
            } else {
                alert('保存失败');
            }
        } catch (err) {
            alert('保存失败');
        }
    });

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.remove();
    });
}

// ===== 删除花卉 =====
async function deleteFlower(id) {
    const flower = flowers.find(f => f.id === id);
    if (!confirm(`确定要删除「${flower.name}」吗？此操作不可恢复。`)) return;

    try {
        const resp = await fetch('/api/flowers/' + id, {
            method: 'DELETE',
            headers: { 'X-Admin-Password': adminPassword }
        });
        if (resp.ok) {
            loadFlowerList();
            loadShopInfo();
        } else {
            alert('删除失败');
        }
    } catch (err) {
        alert('删除失败');
    }
}

function esc(s) {
    const div = document.createElement('div');
    div.textContent = s || '';
    return div.innerHTML;
}



// ===== 店铺信息 =====
async function loadShopInfo() {
    try {
        const resp = await fetch('/api/shopinfo');
        const info = await resp.json();
        document.getElementById('shopAddress').value = info.address || '';
        document.getElementById('shopPhone').value = info.phone || '';
        document.getElementById('shopFooterNote').value = info.footerNote || '';
    } catch (e) { /* 加载失败 */ }
}

async function saveShopInfo() {
    const address = document.getElementById('shopAddress').value.trim();
    const phone = document.getElementById('shopPhone').value.trim();
    const footerNote = document.getElementById('shopFooterNote').value.trim();
    const msg = document.getElementById('shopInfoMsg');
    try {
        const resp = await fetch('/api/shopinfo', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Password': adminPassword
            },
            body: JSON.stringify({ address, phone, footerNote })
        });
        if (resp.ok) {
            msg.textContent = '✅ 保存成功';
            setTimeout(() => msg.textContent = '', 2000);
        } else {
            msg.textContent = '❌ 保存失败';
        }
    } catch (e) {
        msg.textContent = '❌ 保存失败';
    }
}


function generateQR() {
    const url = document.getElementById('qrUrl').value.trim();
    if (!url) { alert('请输入前台网址'); return; }

    const resultDiv = document.getElementById('qrResult');
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    resultDiv.style.display = 'block';

    new QRCode(qrContainer, {
        text: url,
        width: 220,
        height: 220,
        colorDark: '#4a3728',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });
}