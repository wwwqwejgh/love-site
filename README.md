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
