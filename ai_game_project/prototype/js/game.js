// AI指挥官：智能战线 - 主游戏逻辑
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'waiting'; // waiting, playing, paused, gameOver
        this.units = [];
        this.selectedUnits = [];
        this.resources = { money: 1000, energy: 500 };
        this.gameTime = 0;
        this.enemyBase = { x: 650, y: 300, health: 1000 };
        this.playerBase = { x: 50, y: 300, health: 1000 };
        this.aiEnemy = new AIEnemy();
        this.workerUnits = [];
        this.lastFrameTime = 0;
        this.battleLog = [];
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.updateUI();
        this.startGameLoop();
        
        // 显示游戏规则弹窗
        setTimeout(() => {
            document.getElementById('rulesModal').style.display = 'block';
        }, 1000);
    }

    setupCanvas() {
        // 设置设备像素比以提高清晰度
        const devicePixelRatio = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * devicePixelRatio;
        this.canvas.height = rect.height * devicePixelRatio;
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    setupEventListeners() {
        // 单位按钮点击事件
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const unitType = e.currentTarget.dataset.unit;
                const cost = parseInt(e.currentTarget.dataset.cost);
                this.createUnit(unitType, cost);
            });
        });

        // 游戏控制按钮
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('pauseGame').addEventListener('click', () => this.pauseGame());
        document.getElementById('resetGame').addEventListener('click', () => this.resetGame());

        // 规则弹窗
        document.getElementById('closeRules').addEventListener('click', () => {
            document.getElementById('rulesModal').style.display = 'none';
            this.startGame();
        });

        // 画布点击事件
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });

        // AI对话输入
        const playerInput = document.getElementById('playerInput');
        playerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAIChat(e.target.value);
                e.target.value = '';
            }
        });
    }

    createUnit(type, cost) {
        if (this.resources.money >= cost && this.gameState === 'playing') {
            const unit = new GameUnit(type, this.playerBase.x + 50, this.playerBase.y, 'player');
            this.units.push(unit);
            
            if (type === 'worker') {
                this.workerUnits.push(unit);
            }
            
            this.resources.money -= cost;
            this.updateResourceBar();
            this.addBattleLog(`创建了 ${this.getUnitDisplayName(type)}`);
            
            // 更新AI状态
            this.updateAIMood('思考中');
            setTimeout(() => this.updateAIMood('准备就绪'), 1000);
            
            return true;
        }
        return false;
    }

    getUnitDisplayName(type) {
        const names = {
            'soldier': '士兵',
            'tank': '坦克',
            'worker': '工人'
        };
        return names[type] || type;
    }

    handleCanvasClick(e) {
        if (this.gameState !== 'playing') return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 检查是否点击了单位
        let clickedUnit = null;
        for (let unit of this.units) {
            const distance = Math.sqrt(
                Math.pow(x - unit.x, 2) + Math.pow(y - unit.y, 2)
            );
            if (distance < 20) {
                clickedUnit = unit;
                break;
            }
        }

        if (clickedUnit) {
            // 选择单位
            if (e.shiftKey) {
                // 多选
                if (this.selectedUnits.includes(clickedUnit)) {
                    this.selectedUnits = this.selectedUnits.filter(u => u !== clickedUnit);
                } else {
                    this.selectedUnits.push(clickedUnit);
                }
            } else {
                // 单选
                this.selectedUnits = [clickedUnit];
            }
            this.highlightSelectedUnits();
        } else {
            // 移动选中的单位
            if (this.selectedUnits.length > 0) {
                this.moveUnitsTo(x, y);
            }
        }
    }

    handleRightClick(e) {
        if (this.gameState !== 'playing') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 攻击目标或移动单位
        if (this.selectedUnits.length > 0) {
            const target = this.findTargetAt(x, y);
            if (target) {
                this.attackTarget(target);
            } else {
                this.moveUnitsTo(x, y);
            }
        }
    }

    moveUnitsTo(x, y) {
        this.selectedUnits.forEach((unit, index) => {
            const offset = (index - this.selectedUnits.length / 2) * 30;
            unit.moveTo(x + offset, y + offset);
        });
        
        this.addBattleLog(`移动 ${this.selectedUnits.length} 个单位到 (${Math.round(x)}, ${Math.round(y)})`);
    }

    findTargetAt(x, y) {
        // 检查敌方单位
        for (let unit of this.units) {
            const distance = Math.sqrt(
                Math.pow(x - unit.x, 2) + Math.pow(y - unit.y, 2)
            );
            if (distance < 20 && unit.faction !== 'player') {
                return unit;
            }
        }
        
        // 检查敌方基地
        const baseDistance = Math.sqrt(
            Math.pow(x - this.enemyBase.x, 2) + Math.pow(y - this.enemyBase.y, 2)
        );
        if (baseDistance < 30) {
            return this.enemyBase;
        }
        
        return null;
    }

    attackTarget(target) {
        this.selectedUnits.forEach(unit => {
            if (unit.canAttack()) {
                unit.setTarget(target);
            }
        });
        
        const targetName = target.type ? this.getUnitDisplayName(target.type) : '敌方基地';
        this.addBattleLog(`攻击 ${targetName}`);
    }

    highlightSelectedUnits() {
        // 清除之前的高亮
        this.units.forEach(unit => unit.selected = false);
        
        // 高亮选中的单位
        this.selectedUnits.forEach(unit => {
            unit.selected = true;
        });
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        // 更新游戏时间
        this.gameTime += deltaTime / 1000;
        this.updateTimeDisplay();

        // 更新所有单位
        this.units.forEach(unit => unit.update(deltaTime, this));

        // 移除死亡单位
        this.units = this.units.filter(unit => unit.health > 0);

        // 检查战斗冲突
        this.handleCombat();

        // 生成资源
        this.generateResources(deltaTime);

        // AI决策
        this.aiEnemy.update(deltaTime, this);

        // 检查胜利条件
        this.checkWinCondition();

        // 更新UI
        this.updateUI();
    }

    handleCombat() {
        for (let unit of this.units) {
            if (unit.target && unit.target.health > 0) {
                const distance = Math.sqrt(
                    Math.pow(unit.x - unit.target.x, 2) + 
                    Math.pow(unit.y - unit.target.y, 2)
                );
                
                if (distance <= unit.attackRange) {
                    unit.attack(this.target);
                }
            }
        }
    }

    generateResources(deltaTime) {
        // 工人自动采集资源
        this.workerUnits.forEach(worker => {
            if (worker.isNearResource()) {
                this.resources.money += worker.collectRate * deltaTime / 1000;
            }
        });
    }

    checkWinCondition() {
        // 检查玩家胜利
        if (this.enemyBase.health <= 0) {
            this.gameState = 'gameOver';
            this.addBattleLog('🎉 恭喜！您获得了胜利！');
            this.updateAIMood('失败');
            return 'player';
        }
        
        // 检查AI胜利
        if (this.playerBase.health <= 0) {
            this.gameState = 'gameOver';
            this.addBattleLog('💀 败北！AI获得胜利！');
            this.updateAIMood('胜利');
            return 'ai';
        }
        
        return null;
    }

    updateResourceBar() {
        document.getElementById('money').textContent = Math.floor(this.resources.money);
        document.getElementById('energy').textContent = Math.floor(this.resources.energy);
    }

    updateTimeDisplay() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        document.getElementById('gameTime').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateAIMood(mood) {
        document.getElementById('aiMood').textContent = mood;
        
        // 更新AI聊天消息
        const messages = document.getElementById('aiMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'ai-message';
        messageElement.textContent = this.getAIResponse(mood);
        messages.appendChild(messageElement);
        messages.scrollTop = messages.scrollHeight;
    }

    getAIResponse(mood) {
        const responses = {
            '准备就绪': '指挥官，战术分析完成，可以开始行动！',
            '思考中': '让我分析当前的战场态势...',
            '胜利': '恭喜指挥官！我们的策略大获成功！',
            '失败': '不要灰心，让我们分析一下失误的原因。',
            '警告': '注意！敌军似乎在集结，准备发动攻击！',
            '建议': '建议您加强左侧防线，敌方可能会从那里进攻。'
        };
        
        return responses[mood] || 'AI状态更新中...';
    }

    addBattleLog(message) {
        this.battleLog.push({
            time: this.getCurrentTime(),
            message: message
        });
        
        // 只保留最近10条日志
        if (this.battleLog.length > 10) {
            this.battleLog = this.battleLog.slice(-10);
        }
        
        this.updateBattleLog();
    }

    updateBattleLog() {
        const logElement = document.getElementById('battleLog');
        logElement.innerHTML = this.battleLog.map(entry => 
            `<div class="log-entry">[${entry.time}] ${entry.message}</div>`
        ).join('');
        logElement.scrollTop = logElement.scrollHeight;
    }

    getCurrentTime() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateUI() {
        // 更新单位数量
        document.getElementById('unitCount').textContent = this.units.length;
        
        // 更新胜利进度
        const enemyHealthPercent = Math.max(0, this.enemyBase.health / 1000 * 100);
        document.getElementById('winProgress').style.width = `${100 - enemyHealthPercent}%`;
        
        // 更新AI建议数
        document.getElementById('aiSuggestionCount').textContent = this.battleLog.length;
        
        // 检查资源是否足够创建单位
        document.querySelectorAll('.unit-btn').forEach(btn => {
            const cost = parseInt(btn.dataset.cost);
            btn.disabled = this.resources.money < cost || this.gameState !== 'playing';
        });
    }

    handleAIChat(message) {
        // 简单的AI对话响应
        const responses = [
            '建议您部署更多坦克来突破敌方防线。',
            '注意资源管理，工人是经济的基础。',
            '当前战场态势对您有利，继续保持攻击势头。',
            '建议您分散攻击，避免集中在一个点。',
            'AI正在分析最佳战略，请稍候。'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // 显示玩家消息
        const messages = document.getElementById('aiMessages');
        const playerMessage = document.createElement('div');
        playerMessage.className = 'ai-message';
        playerMessage.style.color = '#ffff88';
        playerMessage.textContent = `玩家: ${message}`;
        messages.appendChild(playerMessage);
        
        // 显示AI回复
        setTimeout(() => {
            const aiMessage = document.createElement('div');
            aiMessage.className = 'ai-message';
            aiMessage.textContent = `雅典娜: ${randomResponse}`;
            messages.appendChild(aiMessage);
            messages.scrollTop = messages.scrollHeight;
        }, 1000);
    }

    startGame() {
        this.gameState = 'playing';
        this.updateAIMood('准备就绪');
        this.addBattleLog('游戏开始！与AI敌人战斗！');
        document.getElementById('startGame').textContent = '继续游戏';
    }

    pauseGame() {
        this.gameState = this.gameState === 'playing' ? 'paused' : 'playing';
        document.getElementById('pauseGame').textContent = 
            this.gameState === 'playing' ? '暂停' : '继续';
    }

    resetGame() {
        this.gameState = 'waiting';
        this.units = [];
        this.selectedUnits = [];
        this.resources = { money: 1000, energy: 500 };
        this.gameTime = 0;
        this.enemyBase = { x: 650, y: 300, health: 1000 };
        this.playerBase = { x: 50, y: 300, health: 1000 };
        this.workerUnits = [];
        this.battleLog = [];
        
        this.updateResourceBar();
        this.updateTimeDisplay();
        this.updateBattleLog();
        this.updateAIMood('准备就绪');
        document.getElementById('startGame').textContent = '开始战斗';
        document.getElementById('pauseGame').textContent = '暂停';
        
        // 显示规则弹窗
        document.getElementById('rulesModal').style.display = 'block';
    }

    startGameLoop() {
        const gameLoop = (currentTime) => {
            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            
            this.render();
            this.update(deltaTime);
            
            requestAnimationFrame(gameLoop);
        };
        
        requestAnimationFrame(gameLoop);
    }

    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制基地
        this.drawBase(this.playerBase, '#44ff44', 'P');
        this.drawBase(this.enemyBase, '#ff4444', 'E');
        
        // 绘制资源点
        this.drawResourcePoints();
        
        // 绘制单位
        this.units.forEach(unit => unit.draw(this.ctx));
        
        // 绘制选择框
        this.drawSelectionBox();
        
        // 绘制路径
        this.units.forEach(unit => {
            if (unit.selected && unit.path.length > 1) {
                this.drawPath(unit.path);
            }
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawBase(base, color, label) {
        // 绘制基地圆圈
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(base.x, base.y, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制基地边框
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 绘制标签
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, base.x, base.y + 5);
        
        // 绘制血量条
        const healthPercent = base.health / 1000;
        const barWidth = 50;
        const barHeight = 6;
        
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(base.x - barWidth/2, base.y + 35, barWidth, barHeight);
        
        this.ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffaa00' : '#ff4444';
        this.ctx.fillRect(base.x - barWidth/2, base.y + 35, barWidth * healthPercent, barHeight);
    }

    drawResourcePoints() {
        const resources = [
            { x: 200, y: 150, type: 'gold' },
            { x: 400, y: 450, type: 'gold' },
            { x: 600, y: 100, type: 'energy' }
        ];
        
        resources.forEach(resource => {
            this.ctx.fillStyle = resource.type === 'gold' ? '#ffff44' : '#44ffff';
            this.ctx.beginPath();
            this.ctx.arc(resource.x, resource.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#000';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(resource.type === 'gold' ? '💰' : '⚡', resource.x, resource.y + 4);
        });
    }

    drawSelectionBox() {
        if (this.selectedUnits.length > 0) {
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = '#ffff00';
            
            this.selectedUnits.forEach(unit => {
                this.ctx.beginPath();
                this.ctx.arc(unit.x, unit.y, 22, 0, Math.PI * 2);
                this.ctx.stroke();
            });
            
            this.ctx.shadowBlur = 0;
        }
    }

    drawPath(path) {
        if (path.length < 2) return;
        
        this.ctx.strokeStyle = '#00aaff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
}

// 游戏单位类
class GameUnit {
    constructor(type, x, y, faction) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.faction = faction;
        this.selected = false;
        this.path = [];
        this.target = null;
        
        // 单位属性
        switch(type) {
            case 'soldier':
                this.health = 100;
                this.maxHealth = 100;
                this.speed = 2;
                this.attackRange = 30;
                this.attackDamage = 20;
                this.attackCooldown = 1000;
                this.lastAttackTime = 0;
                break;
            case 'tank':
                this.health = 300;
                this.maxHealth = 300;
                this.speed = 1;
                this.attackRange = 50;
                this.attackDamage = 50;
                this.attackCooldown = 1500;
                this.lastAttackTime = 0;
                break;
            case 'worker':
                this.health = 50;
                this.maxHealth = 50;
                this.speed = 3;
                this.attackRange = 0;
                this.attackDamage = 0;
                this.collectRate = 2;
                break;
        }
    }

    update(deltaTime, game) {
        if (this.target && this.target.health > 0) {
            this.moveTowardsTarget();
        } else if (this.path.length > 0) {
            this.followPath();
        } else if (this.type === 'worker' && this.faction === 'player') {
            this.autoCollect(game);
        }
    }

    moveTo(x, y) {
        this.path = [{ x, y }];
        this.target = null;
    }

    setTarget(target) {
        this.target = target;
        this.path = [];
    }

    followPath() {
        if (this.path.length === 0) return;
        
        const target = this.path[0];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.speed) {
            this.x = target.x;
            this.y = target.y;
            this.path.shift();
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    moveTowardsTarget() {
        if (!this.target) return;
        
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > this.attackRange && distance > this.speed) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    autoCollect(game) {
        // 简单的自动资源收集逻辑
        const resources = [
            { x: 200, y: 150, type: 'gold' },
            { x: 400, y: 450, type: 'gold' },
            { x: 600, y: 100, type: 'energy' }
        ];
        
        let nearestResource = null;
        let nearestDistance = Infinity;
        
        resources.forEach(resource => {
            const distance = Math.sqrt(
                Math.pow(this.x - resource.x, 2) + 
                Math.pow(this.y - resource.y, 2)
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestResource = resource;
            }
        });
        
        if (nearestResource && nearestDistance > 50) {
            this.moveTo(nearestResource.x, nearestResource.y);
        }
    }

    isNearResource() {
        const resources = [
            { x: 200, y: 150 },
            { x: 400, y: 450 },
            { x: 600, y: 100 }
        ];
        
        return resources.some(resource => {
            const distance = Math.sqrt(
                Math.pow(this.x - resource.x, 2) + 
                Math.pow(this.y - resource.y, 2)
            );
            return distance < 50;
        });
    }

    canAttack() {
        return this.attackDamage > 0;
    }

    attack(target) {
        const now = Date.now();
        if (now - this.lastAttackTime >= this.attackCooldown) {
            target.health -= this.attackDamage;
            this.lastAttackTime = now;
        }
    }

    draw(ctx) {
        // 确定单位颜色
        const color = this.faction === 'player' ? '#44ff44' : '#ff4444';
        
        // 绘制单位主体
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制单位边框
        ctx.strokeStyle = this.selected ? '#ffff00' : '#ffffff';
        ctx.lineWidth = this.selected ? 3 : 1;
        ctx.stroke();
        
        // 绘制单位符号
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        const symbol = this.getSymbol();
        ctx.fillText(symbol, this.x, this.y + 4);
        
        // 绘制血量条
        this.drawHealthBar(ctx);
    }

    getSymbol() {
        const symbols = {
            'soldier': '⚔️',
            'tank': '🚗',
            'worker': '👷'
        };
        return symbols[this.type] || '?';
    }

    drawHealthBar(ctx) {
        if (this.health < this.maxHealth) {
            const barWidth = 30;
            const barHeight = 4;
            const healthPercent = this.health / this.maxHealth;
            
            ctx.fillStyle = '#333333';
            ctx.fillRect(this.x - barWidth/2, this.y - 25, barWidth, barHeight);
            
            ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : 
                          healthPercent > 0.25 ? '#ffaa00' : '#ff4444';
            ctx.fillRect(this.x - barWidth/2, this.y - 25, barWidth * healthPercent, barHeight);
        }
    }
}

// 当页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.gameEngine = new GameEngine();
});