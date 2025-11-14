# 🚀 GitHub Pages 部署指南

## 快速部署（5分钟完成）

### 步骤1：创建GitHub仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角的"+"按钮，选择"New repository"
3. 仓库名称建议：`ai-commander-game`
4. 勾选"Add a README file"
5. 选择"MIT License"
6. 选择"Public"（GitHub Pages需要公开仓库）
7. 点击"Create repository"

### 步骤2：上传游戏文件

#### 方法A：使用GitHub Web界面（推荐）

1. 在新创建的仓库页面，点击"uploading an existing file"
2. 将`gh-pages`目录下的所有文件拖拽到上传区域：
   - `index.html`
   - `css/style.css`
   - `js/game.js`
   - `js/ai.js`
   - `js/ui.js`
   - `README.md`
   - `LICENSE`
   - `.github/workflows/deploy.yml`

3. 在底部添加提交信息：`Initial commit: Add AI Commander game`
4. 点击"Commit changes"

#### 方法B：使用Git命令

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/ai-commander-game.git
cd ai-commander-game

# 复制文件到仓库
cp -r gh-pages/* .

# 提交和推送
git add .
git commit -m "Initial commit: Add AI Commander game"
git push origin main
```

### 步骤3：配置GitHub Pages

1. 在仓库页面，点击"Settings"标签
2. 在左侧菜单中找到"Pages"
3. 在"Source"部分：
   - 选择"GitHub Actions"
4. 点击"Save"

### 步骤4：自动部署

GitHub Actions会自动触发部署流程：

1. 每次推送到`main`分支时自动部署
2. 部署完成后，您将看到绿色的勾选标记
3. 通常需要2-5分钟完成首次部署

### 步骤5：访问您的游戏

部署成功后，您的游戏将通过以下地址访问：

`https://YOUR_USERNAME.github.io/ai-commander-game/`

## 🔧 高级配置

### 自定义域名（可选）

如果您有自己的域名：

1. 在仓库根目录创建一个`CNAME`文件
2. 文件内容：yourdomain.com
3. 配置您的DNS设置指向GitHub Pages

### 环境变量

如果需要添加环境变量（如API密钥）：

1. 进入仓库Settings > Secrets and variables > Actions
2. 点击"New repository secret"
3. 添加您的密钥

### 手动触发部署

如果需要手动触发部署：

1. 进入仓库的Actions标签
2. 选择"Deploy to GitHub Pages"工作流
3. 点击"Run workflow"

## 📋 故障排除

### 常见问题

**Q: 游戏无法访问，显示404错误**
A: 检查文件是否在正确位置，确保`index.html`在仓库根目录

**Q: CSS或JS文件加载失败**
A: 检查文件路径，确保相对路径正确

**Q: 部署失败**
A: 查看Actions标签的部署日志，通常是文件路径问题

**Q: 游戏运行缓慢**
A: 检查浏览器控制台是否有JavaScript错误

### 检查清单

- [ ] `index.html`在根目录
- [ ] `css/style.css`文件存在
- [ ] `js/`目录包含所有JS文件
- [ ] GitHub Pages已启用
- [ ] 仓库设置为Public
- [ ] Actions工作流正常运行

## 🛠️ 本地测试

在部署前，您可以在本地测试：

```bash
# 使用Python启动本地服务器
python -m http.server 8000

# 或使用Node.js
npx serve .

# 访问 http://localhost:8000
```

## 📊 监控和分析

### GitHub Pages统计

1. 进入仓库Settings > Pages
2. 查看页面访问统计
3. 可以集成Google Analytics进行详细分析

### 性能监控

建议监控的关键指标：
- 页面加载时间
- JavaScript错误率
- 用户交互响应时间

## 🔒 安全注意事项

1. **不要在客户端代码中存储敏感信息**
2. **定期更新依赖项**
3. **使用HTTPS**（GitHub Pages默认提供）
4. **启用内容安全策略**

## 🎮 游戏更新

更新游戏时，只需：

1. 修改本地文件
2. 重新上传到仓库
3. GitHub Pages会自动更新（通常在几分钟内）

## 📞 支持

如有问题，请：

1. 检查本部署指南
2. 查看GitHub文档
3. 提交Issue到项目仓库

---

**🎉 恭喜！您的AI指挥官游戏现已部署到GitHub Pages！**

立即访问您的游戏链接开始体验吧！ 🚀