# AI指挥官：智能战线 - 部署与使用指南

## 🚀 快速部署

### 方法一：GitHub Pages部署 (推荐)
```bash
# 1. 创建GitHub仓库
# 2. 上传项目文件到仓库
git init
git add .
git commit -m "Initial commit: AI Commander Game"
git branch -M main
git remote add origin https://github.com/yourusername/ai-commander.git
git push -u origin main

# 3. 在GitHub设置中启用Pages
# Settings -> Pages -> Source: Deploy from a branch -> main branch
```

### 方法二：Netlify部署
```bash
# 1. 访问 netlify.com
# 2. 拖拽项目文件夹到部署区域
# 3. 自动获得免费域名，如：ai-commander.netlify.app
```

### 方法三：Vercel部署
```bash
# 1. 访问 vercel.com
# 2. 连接GitHub仓库或直接上传文件
# 3. 自动部署并获得域名
```

### 方法四：本地开发服务器
```bash
# Python方式
cd ai_game_project/prototype
python -m http.server 8080

# Node.js方式
npx serve . -p 8080

# PHP方式
php -S localhost:8080
```

## 🎮 游戏使用说明

### 基本操作
1. **开始游戏**
   - 打开游戏页面
   - 点击"开始战斗"按钮
   - 阅读游戏规则弹窗

2. **创建单位**
   - 点击左侧面板的单位按钮
   - 士兵 (100金) - 基础作战单位
   - 坦克 (300金) - 重型攻击单位
   - 工人 (50金) - 资源采集单位

3. **控制单位**
   - 左键点击单位: 选择单位
   - Shift+左键: 多选单位
   - 左键点击地图: 移动选中单位
   - 右键点击目标: 攻击敌人或敌方建筑

4. **AI交互**
   - 底部输入框: 与雅典娜AI对话
   - AI会自动提供战术建议
   - 观察AI状态变化

### 高级功能
1. **键盘快捷键**
   - `1` `2` `3`: 快速创建单位
   - `空格`: 暂停/继续游戏
   - `ESC`: 取消所有选择
   - `Ctrl+R`: 重置游戏

2. **AI分析功能**
   - 右侧面板显示AI战术分析
   - 实时威胁评估
   - 资源控制建议
   - 策略优化提示

3. **学习系统**
   - AI会学习你的游戏风格
   - 自动调整难度
   - 个性化游戏体验

### 胜利条件
- **摧毁敌方基地**: 消灭敌方主基地
- **消灭所有敌军**: 清除所有敌方单位
- **控制资源点**: 占领更多资源点获得优势

## 🛠️ 开发者指南

### 本地开发环境
```bash
# 克隆项目
git clone https://github.com/yourusername/ai-commander.git
cd ai-commander

# 启动开发服务器
npm install -g live-server
live-server prototype/ --port=8080
```

### 代码结构
```
prototype/
├── index.html          # 主入口文件
├── css/
│   └── style.css      # 主样式文件
├── js/
│   ├── game.js        # 游戏核心逻辑
│   ├── ai.js          # AI决策系统
│   └── ui.js          # 用户界面管理
└── assets/            # 游戏资源
```

### 自定义修改

#### 1. 修改游戏参数
```javascript
// 在 js/game.js 中修改单位属性
const UNIT_TYPES = {
    soldier: {
        health: 150,        // 增加血量
        attack: 25,         // 增加攻击力
        cost: 120,          // 增加成本
        // ...
    }
};
```

#### 2. 调整AI难度
```javascript
// 在 js/ai.js 中修改AI参数
class AIEnemy {
    constructor() {
        this.level = 'hard';           // 设置为困难模式
        this.decisionInterval = 1000;  // 调整决策频率
        this.aggressionLevel = 0.8;    // 调整攻击性
    }
}
```

#### 3. 自定义UI主题
```css
/* 在 css/style.css 中修改颜色方案 */
:root {
    --primary-color: #ff6b6b;      /* 红色主题 */
    --secondary-color: #4ecdc4;    /* 青色辅助 */
    --accent-color: #45b7d1;       /* 蓝色强调 */
}
```

### 性能优化建议

#### 1. 图片资源优化
```bash
# 压缩图片文件
# 使用WebP格式替代PNG/JPG
# 预加载关键资源
```

#### 2. 代码优化
```javascript
// 使用requestAnimationFrame优化动画
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastFrameTime;
    gameEngine.update(deltaTime);
    gameEngine.render();
    requestAnimationFrame(gameLoop);
}

// 对象池优化
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.createFn();
    }
    
    release(obj) {
        this.resetFn(obj);
        this.pool.push(obj);
    }
}
```

## 🔧 故障排除

### 常见问题

#### 1. 游戏无法加载
**症状**: 页面空白或显示加载错误
**解决方案**:
```javascript
// 检查控制台错误
console.log('Checking browser compatibility...');

// 检查Canvas支持
if (!document.createElement('canvas').getContext) {
    alert('您的浏览器不支持HTML5 Canvas，请升级浏览器');
}

// 检查WebSocket支持
if (!window.WebSocket) {
    console.warn('WebSocket不支持，部分功能可能受限');
}
```

#### 2. AI反应缓慢
**症状**: AI决策延迟过长
**解决方案**:
```javascript
// 减少AI计算复杂度
class AIEnemy {
    constructor() {
        this.decisionDepth = 3;        // 减少搜索深度
        this.simulationCount = 500;    // 减少模拟次数
    }
    
    // 启用性能模式
    enablePerformanceMode() {
        this.adaptiveComplexity = true;
        this.maxComputationTime = 10;  // 10ms计算预算
    }
}
```

#### 3. 移动端体验问题
**症状**: 触摸操作不响应
**解决方案**:
```css
/* 在 css/style.css 中添加 */
@media (max-width: 768px) {
    .game-map {
        touch-action: manipulation;
    }
    
    .unit-btn {
        min-height: 44px; /* 符合触摸标准 */
        min-width: 44px;
    }
}
```

#### 4. 内存泄漏
**症状**: 长时间游戏后变卡
**解决方案**:
```javascript
// 及时清理事件监听器
class GameEngine {
    cleanup() {
        this.canvas.removeEventListener('click', this.clickHandler);
        this.canvas.removeEventListener('contextmenu', this.contextMenuHandler);
        
        // 清理AI数据
        this.aiEnemy.cleanup();
        
        // 清理UI元素
        this.uiManager.cleanup();
    }
}
```

### 调试模式
```javascript
// 启用调试模式
window.DEBUG_MODE = true;

// 在游戏中启用调试功能
if (window.DEBUG_MODE) {
    // 显示FPS
    gameEngine.showFPS = true;
    
    // 显示单位路径
    gameEngine.showPaths = true;
    
    // AI决策日志
    gameEngine.aiEnemy.enableLogging = true;
    
    // 性能监控
    gameEngine.enableProfiling = true;
}
```

## 📱 移动端适配

### 响应式设计
```css
/* 移动端优化 */
@media (max-width: 768px) {
    .game-container {
        padding: 5px;
        font-size: 14px;
    }
    
    .game-main {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr auto;
    }
    
    .left-panel, .right-panel {
        max-height: 200px;
        overflow-y: auto;
    }
    
    .unit-buttons {
        flex-direction: row;
        flex-wrap: wrap;
    }
    
    .unit-btn {
        flex: 1;
        min-width: 80px;
    }
}
```

### 触摸优化
```javascript
// 触摸事件处理
class TouchHandler {
    constructor() {
        this.setupTouchEvents();
    }
    
    setupTouchEvents() {
        const canvas = document.getElementById('gameCanvas');
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouchStart(e);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleTouchMove(e);
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleTouchEnd(e);
        });
    }
    
    handleTouchStart(e) {
        const touch = e.touches[0];
        const rect = e.target.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // 转换为游戏坐标
        this.processInput(x, y, 'touch');
    }
}
```

## 🔒 安全考虑

### 输入验证
```javascript
// 验证用户输入
class InputValidator {
    static validatePosition(x, y) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        
        return (
            typeof x === 'number' &&
            typeof y === 'number' &&
            x >= 0 && x <= rect.width &&
            y >= 0 && y <= rect.height
        );
    }
    
    static validateUnitType(type) {
        const validTypes = ['soldier', 'tank', 'worker'];
        return validTypes.includes(type);
    }
}
```

### 数据保护
```javascript
// 避免XSS攻击
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// 使用HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

## 📊 性能监控

### 性能指标
```javascript
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            memoryUsage: 0,
            aiDecisionTime: 0,
            renderTime: 0
        };
        this.startMonitoring();
    }
    
    startMonitoring() {
        setInterval(() => {
            this.updateFPS();
            this.checkMemoryUsage();
            this.reportMetrics();
        }, 1000);
    }
    
    updateFPS() {
        const now = performance.now();
        if (this.lastFrame) {
            this.metrics.fps = 1000 / (now - this.lastFrame);
        }
        this.lastFrame = now;
    }
    
    checkMemoryUsage() {
        if (performance.memory) {
            this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
        }
    }
}
```

### 错误处理
```javascript
class ErrorHandler {
    static handleError(error, context) {
        console.error(`Game Error in ${context}:`, error);
        
        // 上报错误 (生产环境)
        if (window.location.hostname !== 'localhost') {
            this.reportError(error, context);
        }
        
        // 优雅降级
        if (context === 'ai') {
            this.enableFallbackAI();
        }
    }
    
    static enableFallbackAI() {
        // 启用简单AI逻辑
        gameEngine.aiEnemy = new SimpleAI();
    }
}
```

---

**部署版本**: v1.0  
**更新日期**: 2025-11-14  
**兼容性**: 现代浏览器 (Chrome 80+, Firefox 75+, Safari 13+)  
**技术支持**: [项目文档地址]