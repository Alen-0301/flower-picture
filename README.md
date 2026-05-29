# 🌸 沐野鲜花 — Render 付费版完整部署教程

## 概览

本教程将带你完成从零到上线的全部步骤。部署完成后，你的客户得到一个永久网址 + 一个管理后台 + 一个二维码，可以随时自助更换花束图片和介绍语。

**总耗时**：约 30 分钟  
**总费用**：Render $7/月 + 域名约 ¥50/年（可选）

---

## 第一步：准备工作

### 你需要注册两个账号

| 平台 | 地址 | 用途 |
|------|------|------|
| GitHub | https://github.com | 存放代码，免费 |
| Render | https://render.com | 托管网站，$7/月 |

> 📌 两个平台都用同一邮箱注册，方便关联。

### 安装 Git

1. 打开 https://git-scm.com/download/win
2. 下载 Windows 版，一路点「Next」安装
3. 安装完成后，在桌面右键 → 选择「Open Git Bash here」
4. 输入以下命令配置你的名字和邮箱：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

---

## 第二步：把代码推上 GitHub

### 2.1 在 GitHub 创建仓库

1. 登录 GitHub，点右上角 **「+」→「New repository」**
2. 仓库名填：`flower-shop`（或你喜欢的名字）
3. 选 **Private**（私有，防止代码泄露）
4. **不要**勾选「Add a README file」
5. 点「Create repository」

### 2.2 推送代码

打开 PowerShell 或 Git Bash，依次执行：

```bash
# 进入项目目录
cd "C:\Users\32163\Documents\flower picture"

# 初始化并推送
git init
git add .
git commit -m "沐野鲜花 - 初始版本"

# 复制 GitHub 上显示的仓库地址，替换下面这行
git remote add origin https://github.com/你的用户名/flower-shop.git
git branch -M main
git push -u origin main
```

> 💡 如果弹窗让你登录 GitHub，选择「Sign in with your browser」即可。

推送成功后，刷新 GitHub 页面，能看到所有代码文件就对了。

---

## 第三步：部署到 Render

### 3.1 创建 Web Service

1. 登录 https://render.com，用 GitHub 账号登录
2. 点右上角 **「New +」→「Web Service」**
3. 点「Connect account」授权 Render 访问你的 GitHub
4. 在列表中找到 `flower-shop` 仓库，点「Connect」

### 3.2 配置服务

Render 会自动读取项目里的 `render.yaml`，大部分已预填好。确认以下设置：

| 配置项 | 值 |
|--------|-----|
| **Name** | flower-shop |
| **Region** | Singapore（亚洲访问最快）或 Oregon（美国） |
| **Branch** | main |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | **Starter（$7/月）** ⬅ 选这个才不休眠 |

往下滚动到 **Environment Variables**，确认：

| Key | Value |
|-----|-------|
| `ADMIN_PASSWORD` | `flower2024` ← **改成你自己的密码！** |
| `NODE_ENV` | `production` |

> 🔑 这个密码就是客户登录管理后台用的，设置一个别人猜不到的。

### 3.3 部署

点底部的 **「Create Web Service」**。

Render 会开始构建和部署，大约 2-3 分钟完成。你可以在页面上看到实时日志。

部署成功后，你会看到一行绿色文字：
```
Your service is live 🎉
```

上面会显示你的网址，类似：
```
https://flower-shop-abc123.onrender.com
```

**记下这个网址！**

---

## 第四步：验证部署

### 4.1 检查前台

浏览器打开 `https://你的网址.onrender.com`，应该能看到花艺展示页面。

> ⚠️ 第一次打开可能需要等 30 秒（冷启动），之后就会很快。

### 4.2 检查管理后台

打开 `https://你的网址.onrender.com/admin`，输入你设置的管理密码登录。

确认可以：
- ✅ 添加新花束
- ✅ 上传图片
- ✅ 编辑已有内容
- ✅ 删除花束

---

## 第五步：（可选）绑定自定义域名

如果觉得 `xxx.onrender.com` 不够好看，可以买一个域名。

### 5.1 买域名

推荐在 **阿里云万网**（https://wanwang.aliyun.com）或 **腾讯云** 购买，选 `.com` 或 `.cn` 后缀，约 ¥50-80/年。

例如：`你的花店名.com`

### 5.2 绑定到 Render

1. 在 Render 里进入你的 Web Service
2. 点左侧「Settings」→ 往下找到「Custom Domain」
3. 点「Add Custom Domain」，输入你的域名（如 `www.你的花店名.com`）
4. Render 会给你一串验证值，去域名服务商那里添加一条 CNAME 记录即可
5. 等待 DNS 生效（通常 5-30 分钟）

绑定成功后，`https://www.你的花店名.com` 就是客户的网址了。

---

## 第六步：生成二维码 & 交付客户

### 6.1 生成二维码

1. 打开管理后台 `https://你的网址.onrender.com/admin`
2. 登录后往下滚动，找到「📱 生成二维码」
3. 输入客户的前台网址
4. 点「生成二维码」
5. **右键二维码图片 → 另存为图片**

### 6.2 交付清单

发给客户以下内容：

| 交付物 | 内容 |
|--------|------|
| 🔗 管理后台地址 | `https://你的网址.onrender.com/admin` |
| 🔑 管理密码 | 你设的那个密码 |
| 📱 二维码图片 | 刚才保存的 PNG 图片 |
| 📖 使用说明 | 见下方 ↓ |

---

## 第七步：客户使用说明

你可以直接把下面这段发给客户：

---

### 🌸 沐野鲜花 - 使用指南

**1. 扫码看花**

二维码贴在店里，顾客用手机一扫就能看到所有花束。

**2. 换图片 / 改介绍**

用电脑或手机浏览器打开管理后台（网址和密码已发你），登录后可以：

- **➕ 添加新花束**：上传照片，写名字、介绍、价格
- **✏️ 修改已有花束**：点「编辑」换图或改文字
- **🗑️ 删除花束**：点「删除」下架

**3. 不需要换二维码**

无论你怎么换内容，二维码都不用换，永远有效。

**4. 注意事项**

- 上传的图片建议用手机拍好后发送到电脑，再用电脑上传
- 介绍语不要太长，3-5句话最合适
- 如果网站打不开，可能是服务器在重启，等30秒再试

---

## 维护指南（给你看的）

### 更新代码

如果以后你想改页面样式或加新功能：

```bash
cd "C:\Users\32163\Documents\flower picture"
git add .
git commit -m "更新了XXX功能"
git push
```

Render 会自动检测到推送并重新部署，约 2 分钟生效。

### 修改密码

1. 在 Render 后台进入你的 Web Service
2. 点左侧「Environment」
3. 修改 `ADMIN_PASSWORD` 的值
4. 点「Save Changes」，Render 会自动重启服务

### 查看访问日志

在 Render 后台点「Logs」标签，可以看到所有访问记录，了解有多少客户扫码看过。

### 成本

| 项目 | 费用 |
|------|------|
| Render Starter | **$7/月** |
| 域名（可选） | ¥50-80/**年** |

每月不到 60 元人民币。

---

## 常见问题

**Q：客户换了图片，网站多久更新？**  
A：实时更新。管理后台保存后，前台刷新即可看到。

**Q：如果有人知道管理后台地址怎么办？**  
A：不知道密码进不去。密码设复杂一点即可。

**Q：Render 宕机了怎么办？**  
A：Render 有 99.9% 的在线率保证，几乎不会出问题。真有故障他们会自动恢复。

**Q：能放多少张图片？**  
A：Render 免费提供 1GB 存储，足够放几百张高清花束图。

---

> 🎉 部署完成后，你只需要每年替客户续费域名（如果买了的话），其他一切自动运行。
