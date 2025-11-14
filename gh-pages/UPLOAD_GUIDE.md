# 🚀 GitHub上传指南 - AI指挥官游戏

## 📋 上传步骤

### 步骤1: 创建GitHub仓库
1. 登录您的GitHub账户 (https://github.com)
2. 点击右上角的 "+" 号，选择 "New repository"
3. 仓库名称输入: `ai-commander-game`
4. 描述输入: `AI Commander: 智能战线 - 实时策略游戏`
5. 选择 "Public" (公开仓库)
6. **重要**: 勾选 "Add a README file"
7. 点击 "Create repository"

### 步骤2: 上传游戏文件
1. 进入您刚创建的 `ai-commander-game` 仓库
2. 删除默认的README.md文件 (如果存在)
3. 点击 "uploading an existing file" 链接或点击 "Add file" > "Upload files"
4. **批量上传所有文件**:
   - 打开您的 `gh-pages` 文件夹
   - 全选所有文件 (Ctrl+A 或 Cmd+A)
   - 拖拽到GitHub上传区域
   - 或者逐个上传以下文件和文件夹:
     ```
     📄 index.html
     📁 css/
       📄 style.css
     📁 js/
       📄 game.js
       📄 ai.js
       📄 ui.js
     📁 .github/
       📁 workflows/
         📄 deploy.yml
     📄 README.md
     📄 DEPLOYMENT.md
     📄 IMPROVEMENTS.md
     📄 LICENSE
     📄 UPLOAD_GUIDE.md
     ```

### 步骤3: 启用GitHub Pages
1. 在仓库页面，点击 "Settings" 标签
2. 在左侧菜单找到 "Pages"
3. 在 "Source" 部分:
   - 选择 "Deploy from a branch"
   - Branch选择: "main"
   - Folder选择: "/ (root)"
4. 点击 "Save"
5. 等待1-2分钟，页面会显示您的网站链接

### 步骤4: 获取访问链接
启用Pages后，GitHub会提供类似这样的链接:
```
https://您的用户名.github.io/ai-commander-game/
```

## 🎯 快速验证

上传完成后，您可以：
1. 访问上面的链接测试游戏
2. 检查关卡系统是否正常工作
3. 测试新手模式和教学系统
4. 验证滚动条功能

## 🔧 故障排除

如果遇到问题:
1. **页面空白**: 检查所有文件是否正确上传
2. **功能不工作**: 确保JavaScript文件路径正确
3. **样式错误**: 确保css/style.css文件存在
4. **404错误**: 确认GitHub Pages设置正确

## 📱 兼容性
- 桌面浏览器: Chrome, Firefox, Safari, Edge
- 移动设备: 支持触摸操作
- 分辨率: 自适应，从1024x768开始

## 🎮 游戏特色
- ✅ 5个渐进难度关卡
- ✅ 新手教学模式
- ✅ 智能AI对手
- ✅ 实时资源管理
- ✅ 响应式设计
- ✅ 滚动条优化

---
**注意**: 整个上传过程通常需要5-10分钟完成。