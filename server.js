const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;

const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOAD_DIR = path.join(__dirname, 'static', 'uploads');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'flower2024';

// 确保上传目录存在
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 中间件
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

// Multer 配置
const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uuidv4() + ext);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
    }
});

// ===== 工具函数 =====
function loadData() {
    if (!fs.existsSync(DATA_FILE)) return { flowers: [] };
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
function checkPassword(req, res, next) {
    const pw = req.headers['x-admin-password'] || req.body?.password;
    if (pw !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: '密码错误' });
    }
    next();
}

// ===== 页面路由 =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'admin.html'));
});

// ===== API 路由 =====

// 获取所有花卉
app.get('/api/flowers', (req, res) => {
    res.json(loadData());
});

// 添加花卉
app.post('/api/flowers', checkPassword, (req, res) => {
    const data = loadData();
    const flower = req.body;
    flower.id = data.flowers.reduce((max, f) => Math.max(max, f.id), 0) + 1;
    data.flowers.push(flower);
    saveData(data);
    res.status(201).json(flower);
});

// 更新花卉
app.put('/api/flowers/:id', checkPassword, (req, res) => {
    const data = loadData();
    const id = parseInt(req.params.id);
    const idx = data.flowers.findIndex(f => f.id === id);
    if (idx === -1) return res.status(404).json({ error: '未找到该花卉' });
    data.flowers[idx] = { ...data.flowers[idx], ...req.body, id };
    saveData(data);
    res.json(data.flowers[idx]);
});

// 删除花卉
app.delete('/api/flowers/:id', checkPassword, (req, res) => {
    const data = loadData();
    const id = parseInt(req.params.id);
    const idx = data.flowers.findIndex(f => f.id === id);
    if (idx === -1) return res.status(404).json({ error: '未找到该花卉' });
    // 删除关联图片
    const img = data.flowers[idx].image;
    if (img) {
        const imgPath = path.join(__dirname, 'static', img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    data.flowers.splice(idx, 1);
    saveData(data);
    res.json({ success: true });
});

// 上传图片
app.post('/api/upload', upload.single('file'), (req, res) => {
    const pw = req.body.password;
    if (pw !== ADMIN_PASSWORD) return res.status(403).json({ error: '密码错误' });
    if (!req.file) return res.status(400).json({ error: '没有文件' });
    res.json({ url: 'uploads/' + req.file.filename });
});

// 验证密码
app.post('/api/verify', (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) {
        return res.json({ success: true });
    }
    res.status(403).json({ success: false });
});

// ===== 启动 =====
app.listen(PORT, () => {
    console.log(`🌸 花语小筑已启动！`);
    console.log(`   前台展示: http://localhost:${PORT}`);
    console.log(`   管理后台: http://localhost:${PORT}/admin`);
    console.log(`   管理密码: ${ADMIN_PASSWORD}`);
});
