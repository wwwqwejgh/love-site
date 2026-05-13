# 我们的恋爱小站

一个适合手机访问的静态恋爱网站。直接打开 `index.html` 就能看；如果想让手机访问，需要在同一个 Wi-Fi 下启动本地服务。

## 修改内容

主要文案都在 `script.js` 顶部的 `CONFIG` 里：

- `names`：两个人的名字
- `firstMeet`：第一次见面日期
- `loveDate`：恋爱纪念日
- `timeline`：时间线事件
- `defaultNotes`：默认便签
- `defaultGallery`：照片墙占位文案

页面里的“添加照片”和“保存便签”会保存在当前浏览器本地，不会上传到服务器。

## 手机访问：同一个 Wi-Fi

在项目目录运行：

```powershell
python -m http.server 4173 --bind 0.0.0.0
```

然后用手机访问电脑的局域网地址，例如：

```text
http://你的电脑IP:4173
```

## 手机访问：任意网络临时打开

运行：

```powershell
.\start-public-link.ps1
```

脚本会启动本地网站，并生成一个 `https://...loca.lt` 公网临时链接。手机用流量也能打开。

注意：

- 电脑必须保持开机联网，脚本启动的服务不能关。
- localtunnel 的免费链接是临时的，每次重新启动可能会变化。
- 手机首次访问如果出现 Tunnel Password 页面，输入脚本里显示的密码。

## 长期稳定访问

如果想要一个一直有效的链接，建议部署到静态托管平台：

- GitHub Pages：适合免费长期展示，需要 GitHub 账号。
- Vercel / Netlify：适合拖拽上传这个文件夹或连接 Git 仓库。
- Cloudflare Pages：适合长期稳定访问，也可以绑定自己的域名。

这个网站是纯静态页面，上传 `index.html`、`styles.css`、`script.js` 和 `assets` 文件夹就能运行。

## 云端同步照片和留言

现在网站已经支持 Supabase 云同步。配置完成后，你在电脑上传照片或留言，手机打开同一个 GitHub Pages 链接也能看到。

### 1. 创建 Supabase 项目

1. 打开 https://supabase.com 并登录。
2. 新建一个 Project。
3. 进入项目后，打开 `SQL Editor`。
4. 把本文件夹里的 `supabase-setup.sql` 全部复制进去并运行。

这会创建：

- `love_notes`：保存留言
- `love_photos`：保存照片记录
- `love-photos`：保存图片文件的公开 Storage bucket

### 2. 填写网站配置

在 Supabase 项目里打开 `Project Settings` -> `API`，复制：

- Project URL
- anon public key

然后编辑 `script.js` 顶部：

```js
const SUPABASE_CONFIG = {
  url: "PASTE_YOUR_SUPABASE_PROJECT_URL",
  anonKey: "PASTE_YOUR_SUPABASE_ANON_KEY",
  photoBucket: "love-photos",
};
```

把前两项替换成你自己的 Supabase 配置。

### 3. 重新上传 GitHub

把这些文件重新上传到 GitHub 仓库并提交：

- `index.html`
- `styles.css`
- `script.js`
- `supabase-setup.sql`
- `README.md`
- `assets`

几分钟后刷新 GitHub Pages，页面会显示“云同步已开启”。

注意：当前配置是“知道链接的人都能查看和新增照片/留言”。不要把网址发到公开平台。如果以后想加密码，我可以再帮你做登录版。
