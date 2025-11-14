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
        this.enemyBase = { x: 650, y: 300, health: 1000, faction: 'ai', type: 'enemyBase' };
        this.playerBase = { x: 50, y: 300, health: 1000, faction: 'player', type: 'playerBase' };
        this.aiEnemy = new AIEnemy('easy'); // 从简单难度开始
        this.workerUnits = [];
        this.lastFrameTime = 0;
        this.battleLog = [];
        
        // 新增：关卡系统
        this.level = 1;
        this.maxLevel = 5;
        this.levelConfig = {
            1: { aiLevel: 'easy', timeLimit: 300, resources: 1500, baseHealth: 1200, tutorial: true },
            2: { aiLevel: 'easy', timeLimit: 240, resources: 1200, baseHealth: 1000, tutorial: false },
            3: { aiLevel: 'medium', timeLimit: 180, resources: 1000, baseHealth: 1000, tutorial: false },
            4: { aiLevel: 'hard', timeLimit: 120, resources: 800, baseHealth: 800, tutorial: false },
            5: { aiLevel: 'expert', timeLimit: 90, resources: 600, baseHealth: 600, tutorial: false }
        };
        
        // 新增：新手模式
        this.newbieMode = true;
        this.tutorialStep = 0;
        this.tutorialMessages = [
            "欢迎来到AI指挥官训练！让我们先学习基本操作。",
            "点击左侧的'士兵'按钮，招募一个士兵试试！",
            "很好！现在点击地图上的任意位置来移动士兵。",
            "让我与雅典娜AI对话，看看她能给你什么建议。",
            "现在尝试招募一个工人，他们能帮你建造基地！",
            "恭喜！你已经掌握了基本操作。现在开始真正的战斗吧！"
        ];
        
        // 不要在构造函数中自动初始化，等待DOM加载完成
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.updateUI();
        this.startGameLoop();
        
        // 设置全局引用
        window.gameEngine = this;
        
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
        const startGameBtn = document.getElementById('startGame');
        const pauseGameBtn = document.getElementById('pauseGame');
        const resetGameBtn = document.getElementById('resetGame');
        
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                console.log('开始游戏按钮被点击'); // 调试信息
                this.startGame();
            });
        } else {
            console.error('找不到 startGame 按钮元素');
        }
        
        if (pauseGameBtn) {
            pauseGameBtn.addEventListener('click', () => {
                console.log('暂停按钮被点击'); // 调试信息
                this.pauseGame();
            });
        }
        
        if (resetGameBtn) {
            resetGameBtn.addEventListener('click', () => {
                console.log('重置按钮被点击'); // 调试信息
                this.resetGame();
            });
        }

        // 规则弹窗
        document.getElementById('closeRules').addEventListener('click', () => {
            document.getElementById('rulesModal').style.display = 'none';
            // 不自动开始游戏，让用户点击"开始战斗"按钮
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
        if (this.gameState !== 'playing') return false;
        
        let canCreate = false;
        let energyCost = 0;
        
        // 高级单位需要能量消耗
        if (type === 'tank') {
            energyCost = 20; // 坦克需要20能量
            canCreate = this.resources.money >= cost && this.resources.energy >= energyCost;
        } else {
            // 普通单位只需要金币
            canCreate = this.resources.money >= cost;
        }
        
        if (canCreate) {
            const unit = new GameUnit(type, this.playerBase.x + 50, this.playerBase.y, 'player');
            this.units.push(unit);
            
            if (type === 'worker') {
                this.workerUnits.push(unit);
            }
            
            // 扣除资源
            this.resources.money -= cost;
            if (energyCost > 0) {
                this.resources.energy -= energyCost;
                this.addBattleLog(`使用了 ${energyCost} 能量制造 ${this.getUnitDisplayName(type)}`);
            }
            
            this.updateResourceBar();
            this.addBattleLog(`创建了 ${this.getUnitDisplayName(type)}`);
            
            // 更新AI状态
            this.updateAIMood('思考中');
            setTimeout(() => this.updateAIMood('准备就绪'), 1000);
            
            return true;
        } else {
            // 资源不足提示
            let message = '';
            if (this.resources.money < cost) {
                message += `金币不足（需要 ${cost}）`;
            }
            if (energyCost > 0 && this.resources.energy < energyCost) {
                message += message ? '，' : '';
                message += `能量不足（需要 ${energyCost}）`;
            }
            
            if (message) {
                this.addBattleLog(`❌ ${message}`);
                // 更新AI情绪为困惑
                this.updateAIMood('困惑');
            }
            return false;
        }
    }

    getUnitDisplayName(type) {
        const names = {
            'soldier': '士兵',
            'tank': '坦克',
            'worker': '工人',
            'playerBase': '玩家基地',
            'enemyBase': '敌方基地'
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

        // 自动目标分配（玩家单位发现敌人时自动攻击）
        this.handleAutoTargeting();

        // 移除死亡单位
        this.units = this.units.filter(unit => unit.health > 0);

        // 检查战斗冲突
        this.handleCombat();

        // 基地防御机制
        this.handleBaseDefense();

        // 生成资源
        this.generateResources(deltaTime);

        // AI决策
        this.aiEnemy.update(deltaTime, this);

        // 检查胜利条件
        this.checkWinCondition();

        // 更新UI
        this.updateUI();
    }

    handleAutoTargeting() {
        // 为玩家单位自动分配目标
        this.units.forEach(playerUnit => {
            if (playerUnit.faction === 'player' && playerUnit.canAttack()) {
                // 如果单位没有目标或目标已死亡，自动寻找最近的敌方单位
                if (!playerUnit.target || playerUnit.target.health <= 0) {
                    const enemyUnits = this.units.filter(unit => unit.faction === 'ai');
                    
                    if (enemyUnits.length > 0) {
                        // 寻找最近的敌方单位
                        let nearestEnemy = null;
                        let nearestDistance = Infinity;
                        
                        enemyUnits.forEach(enemy => {
                            const distance = Math.sqrt(
                                Math.pow(playerUnit.x - enemy.x, 2) + 
                                Math.pow(playerUnit.y - enemy.y, 2)
                            );
                            
                            if (distance < nearestDistance && distance < 200) { // 只攻击视野范围内的敌人
                                nearestDistance = distance;
                                nearestEnemy = enemy;
                            }
                        });
                        
                        if (nearestEnemy) {
                            playerUnit.setTarget(nearestEnemy);
                        } else {
                            // 直接攻击真正的敌人基地
                            playerUnit.setTarget(this.enemyBase);
                        }
                    } else {
                        // 没有AI单位，直接攻击真正的敌人基地
                        playerUnit.setTarget(this.enemyBase);
                    }
                }
            }
        });
    }

    handleCombat() {
        for (let unit of this.units) {
            if (unit.target && unit.target.health > 0) {
                const distance = Math.sqrt(
                    Math.pow(unit.x - unit.target.x, 2) + 
                    Math.pow(unit.y - unit.target.y, 2)
                );
                
                if (distance <= unit.attackRange) {
                    unit.attack(unit.target);
                }
            }
        }
    }

    generateResources(deltaTime) {
        // 玩家基础资源收入（每秒10金币）
        this.resources.money += 10 * deltaTime / 1000;
        
        // 玩家基础能量收入（每秒5能量）
        this.resources.energy += 5 * deltaTime / 1000;
        
        // 工人自动采集资源
        this.workerUnits.forEach(worker => {
            if (worker.isNearResource()) {
                // 根据资源类型采集不同资源
                const resourceType = worker.getCurrentResourceType();
                if (resourceType === 'gold') {
                    this.resources.money += worker.collectRate * deltaTime / 1000;
                    // 每20金币消耗1能量进行生产
                    if (this.resources.energy > 0 && (worker._resourceAccumulation || 0) >= worker.collectRate) {
                        this.resources.energy = Math.max(0, this.resources.energy - 1);
                        worker._resourceAccumulation = 0;
                    } else {
                        worker._resourceAccumulation = (worker._resourceAccumulation || 0) + worker.collectRate * deltaTime / 1000;
                    }
                } else if (resourceType === 'energy') {
                    this.resources.energy += worker.collectRate * 0.5 * deltaTime / 1000; // 能量采集效率较低
                }
            } else {
                // 工人自动寻找最近资源点
                worker.autoCollect(this);
            }
        });
    }

    checkWinCondition() {
        // 检查玩家胜利
        if (this.enemyBase.health <= 0) {
            this.gameState = 'gameOver';
            this.addBattleLog(`\n🎉 恭喜！关卡 ${this.level} 完成！`);
            this.updateAIMood('失败');
            
            // 显示胜利提示
            if (window.uiManager) {
                window.uiManager.showLevelComplete(this.level);
            }
            
            // 延迟进入下一关
            setTimeout(() => {
                this.nextLevel();
            }, 3000);
            
            return 'player';
        }
        
        // 检查AI胜利
        if (this.playerBase.health <= 0) {
            this.gameState = 'gameOver';
            this.addBattleLog('\n💀 败北！AI获得胜利！');
            this.updateAIMood('胜利');
            
            // 游戏失败，可以重试当前关卡
            setTimeout(() => {
                this.addBattleLog('\n请点击“开始战斗”重试当前关卡');
                this.gameState = 'waiting';
            }, 2000);
            
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
        const config = this.levelConfig[this.level];
        const enemyHealthPercent = Math.max(0, this.enemyBase.health / config.baseHealth * 100);
        document.getElementById('winProgress').style.width = `${100 - enemyHealthPercent}%`;
        
        // 更新AI建议数
        document.getElementById('aiSuggestionCount').textContent = this.battleLog.length;
        
        // 更新关卡UI
        if (window.uiManager) {
            window.uiManager.updateLevelUI(this.level, config.aiLevel, this.newbieMode);
        }
        
        // 检查资源是否足够创建单位
        document.querySelectorAll('.unit-btn').forEach(btn => {
            const cost = parseInt(btn.dataset.cost);
            btn.disabled = this.resources.money < cost || this.gameState !== 'playing';
        });
        
        // 更新关卡难度颜色
        const difficultyElement = document.getElementById('levelDifficulty');
        if (difficultyElement) {
            difficultyElement.className = `level-difficulty ${config.aiLevel}`;
        }
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
        console.log('开始执行 startGame 方法, 当前关卡:', this.level); // 调试信息
        
        try {
            // 应用当前关卡设置
            const config = this.levelConfig[this.level];
            console.log('当前关卡配置:', config); // 调试信息
            
            // 设置游戏状态
            this.gameState = 'playing';
            console.log('游戏状态设置为: playing'); // 调试信息
            
            // 重置游戏数据（但保留关卡信息）
            this.units = [];
            this.selectedUnits = [];
            this.resources = { money: config.resources, energy: 500 };
            this.gameTime = 0;
            this.enemyBase = { x: 650, y: 300, health: config.baseHealth, faction: 'ai', type: 'enemyBase' };
            this.playerBase = { x: 50, y: 300, health: config.baseHealth, faction: 'player', type: 'playerBase' };
            this.workerUnits = [];
            this.battleLog = [];
            
            // 重新设置AI难度
            this.aiEnemy = new AIEnemy(config.aiLevel);
            console.log('AI难度设置为:', config.aiLevel); // 调试信息
            
            // 更新UI
            this.updateResourceBar();
            this.updateTimeDisplay();
            this.updateBattleLog();
            this.updateAIMood('准备就绪');
            
            // 新手模式：显示教学提示
            if (config.tutorial && this.newbieMode) {
                console.log('启动新手教学'); // 调试信息
                this.startTutorial();
            }
            
            // 更新开始按钮
            const startGameBtn = document.getElementById('startGame');
            const pauseGameBtn = document.getElementById('pauseGame');
            
            if (startGameBtn) {
                startGameBtn.textContent = `关卡 ${this.level} - 继续战斗`;
            }
            if (pauseGameBtn) {
                pauseGameBtn.textContent = '暂停';
            }
            
            // 添加关卡开始日志
            this.addBattleLog(`\n=== 关卡 ${this.level} 开始 ===`);
            this.addBattleLog(`AI难度: ${config.aiLevel.toUpperCase()}`);
            this.addBattleLog(`时间限制: ${config.timeLimit}秒`);
            this.addBattleLog(`资源: ${config.resources} 金币`);
            
            // 隐藏规则弹窗
            const rulesModal = document.getElementById('rulesModal');
            if (rulesModal) {
                rulesModal.style.display = 'none';
            }
            
            console.log('startGame 方法执行完成'); // 调试信息
        } catch (error) {
            console.error('startGame 方法出错:', error);
        }
    }

    pauseGame() {
        this.gameState = this.gameState === 'playing' ? 'paused' : 'playing';
        document.getElementById('pauseGame').textContent = 
            this.gameState === 'playing' ? '暂停' : '继续';
    }

    resetGame() {
        // 重置所有游戏状态，但保持当前关卡
        this.gameState = 'waiting';
        this.units = [];
        this.selectedUnits = [];
        this.resources = { money: this.levelConfig[this.level].resources, energy: 500 };
        this.gameTime = 0;
        this.enemyBase = { x: 650, y: 300, health: this.levelConfig[this.level].baseHealth, faction: 'ai', type: 'enemyBase' };
        this.playerBase = { x: 50, y: 300, health: this.levelConfig[this.level].baseHealth, faction: 'player', type: 'playerBase' };
        this.workerUnits = [];
        this.battleLog = [];
        
        // 重置AI
        this.aiEnemy = new AIEnemy(this.levelConfig[this.level].aiLevel);
        
        // 重置新手模式状态
        this.tutorialStep = 0;
        
        // 更新UI
        this.updateResourceBar();
        this.updateTimeDisplay();
        this.updateBattleLog();
        this.updateAIMood('准备就绪');
        
        // 更新按钮文本
        document.getElementById('startGame').textContent = `开始关卡 ${this.level}`;
        document.getElementById('pauseGame').textContent = '暂停';
        
        // 显示规则弹窗
        document.getElementById('rulesModal').style.display = 'block';
        
        this.addBattleLog(`已重置到关卡 ${this.level} - 准备开始！`);
    }
    
    // 新增：新手教学模式
    startTutorial() {
        this.showTutorialMessage();
    }
    
    showTutorialMessage() {
        const messagesContainer = document.getElementById('aiMessages');
        if (this.tutorialStep < this.tutorialMessages.length) {
            // 添加教学消息到AI聊天
            const message = document.createElement('div');
            message.className = 'ai-message tutorial-message';
            message.textContent = this.tutorialMessages[this.tutorialStep];
            messagesContainer.appendChild(message);
            
            // 滚动到底部
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            this.tutorialStep++;
        }
    }
    
    // 新增：进入下一关
    nextLevel() {
        if (this.level < this.maxLevel) {
            this.level++;
            
            // 如果是新手模式，完成后关闭新手模式
            if (this.level > 1 && this.newbieMode) {
                this.newbieMode = false;
                this.addBattleLog('\n🎆 恭喜！新手教学完成！欢迎进入真正的挑战！');
            }
            
            this.addBattleLog(`\n=== 进入关卡 ${this.level} ===`);
            this.startGame();
        } else {
            // 游戏通关
            this.gameState = 'gameOver';
            this.addBattleLog('\n🎆 恭喜通关所有关卡！你是真正的AI指挥官大师！');
            this.updateAIMood('非常优秀');
        }
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
            { x: 120, y: 250, type: 'gold', collectionRadius: 40 },
            { x: 140, y: 350, type: 'gold', collectionRadius: 40 },
            { x: 180, y: 200, type: 'energy', collectionRadius: 40 }
        ];
        
        resources.forEach(resource => {
            // 绘制采集范围圈
            this.ctx.strokeStyle = resource.type === 'gold' ? '#ffff44' : '#44ffff';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(resource.x, resource.y, resource.collectionRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // 绘制资源点本体
            this.ctx.fillStyle = resource.type === 'gold' ? '#ffff44' : '#44ffff';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = this.ctx.fillStyle;
            this.ctx.beginPath();
            this.ctx.arc(resource.x, resource.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // 绘制资源图标
            this.ctx.fillStyle = '#000';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(resource.type === 'gold' ? '💰' : '⚡', resource.x, resource.y + 6);
            
            // 绘制标签
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px Arial';
            this.ctx.fillText(resource.type === 'gold' ? '金币' : '能量', resource.x, resource.y + 35);
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

    handleBaseDefense() {
        // 检查玩家基地是否被攻击
        const enemyUnitsNearBase = this.units.filter(unit => 
            unit.faction === 'ai' && unit.canAttack() && 
            Math.sqrt(
                Math.pow(unit.x - this.playerBase.x, 2) + 
                Math.pow(unit.y - this.playerBase.y, 2)
            ) < 200
        );

        if (enemyUnitsNearBase.length > 0) {
            // 寻找附近的玩家单位去防御
            const nearbyPlayerUnits = this.units.filter(unit => 
                unit.faction === 'player' && unit.canAttack() && 
                Math.sqrt(
                    Math.pow(unit.x - this.playerBase.x, 2) + 
                    Math.pow(unit.y - this.playerBase.y, 2)
                ) < 100
            );

            // 派遣最近的单位回防
            if (nearbyPlayerUnits.length > 0) {
                nearbyPlayerUnits.forEach(unit => {
                    if (!unit.target || unit.target.health <= 0) {
                        // 设置敌人基地附近的单位为目标
                        const nearestEnemy = enemyUnitsNearBase[0];
                        unit.setTarget(nearestEnemy);
                    }
                });
            }
        }

        // 检查AI基地是否被攻击
        const playerUnitsNearBase = this.units.filter(unit => 
            unit.faction === 'player' && unit.canAttack() && 
            Math.sqrt(
                Math.pow(unit.x - this.enemyBase.x, 2) + 
                Math.pow(unit.y - this.enemyBase.y, 2)
            ) < 200
        );

        if (playerUnitsNearBase.length > 0) {
            // AI自动回防
            const nearbyAIUnits = this.units.filter(unit => 
                unit.faction === 'ai' && unit.canAttack() && 
                Math.sqrt(
                    Math.pow(unit.x - this.enemyBase.x, 2) + 
                    Math.pow(unit.y - this.enemyBase.y, 2)
                ) < 100
            );

            if (nearbyAIUnits.length > 0) {
                nearbyAIUnits.forEach(unit => {
                    if (!unit.target || unit.target.health <= 0) {
                        const nearestPlayer = playerUnitsNearBase[0];
                        unit.setTarget(nearestPlayer);
                    }
                });
            }
        }
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
        // 保存游戏引用用于其他方法
        this.game = game;
        
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
        // 更有效的自动资源收集逻辑 - 距离玩家基地更近的资源点
        const resources = [
            { x: 120, y: 250, type: 'gold', collectionRadius: 40 },
            { x: 140, y: 350, type: 'gold', collectionRadius: 40 },
            { x: 180, y: 200, type: 'energy', collectionRadius: 40 }
        ];
        
        // 如果不在采集状态，寻找最近资源点
        if (!this.isNearResource()) {
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
            
            if (nearestResource && nearestDistance > 30) {
                this.moveTo(nearestResource.x, nearestResource.y);
            }
        }
    }

    isNearResource() {
        const resources = [
            { x: 120, y: 250, type: 'gold', collectionRadius: 40 },
            { x: 140, y: 350, type: 'gold', collectionRadius: 40 },
            { x: 180, y: 200, type: 'energy', collectionRadius: 40 }
        ];
        
        return resources.some(resource => {
            const distance = Math.sqrt(
                Math.pow(this.x - resource.x, 2) + 
                Math.pow(this.y - resource.y, 2)
            );
            return distance < resource.collectionRadius;
        });
    }

    getCurrentResourceType() {
        const resources = [
            { x: 120, y: 250, type: 'gold', collectionRadius: 40 },
            { x: 140, y: 350, type: 'gold', collectionRadius: 40 },
            { x: 180, y: 200, type: 'energy', collectionRadius: 40 }
        ];
        
        for (const resource of resources) {
            const distance = Math.sqrt(
                Math.pow(this.x - resource.x, 2) + 
                Math.pow(this.y - resource.y, 2)
            );
            if (distance < resource.collectionRadius) {
                return resource.type;
            }
        }
        return null;
    }

    canAttack() {
        return this.attackDamage > 0;
    }

    calculateAttackDamage(target) {
        let actualDamage = this.attackDamage;
        
        // 添加单位克制关系
        if (this.faction && target.faction && this.faction !== target.faction) {
            // 计算克制关系
            const typeRelation = this.getTypeRelation(this.type, target.type);
            
            switch(typeRelation) {
                case 'counter':
                    actualDamage *= 1.5; // 克制攻击伤害增加50%
                    break;
                case 'vulnerable':
                    actualDamage *= 0.7; // 被克制伤害减少30%
                    break;
                case 'normal':
                default:
                    // 正常伤害
                    break;
            }
            
            // 地形优势（如果目标接近其基地）
            if (this.faction === 'player' && target.faction === 'ai') {
                const baseDistance = Math.sqrt(
                    Math.pow(target.x - this.game.enemyBase.x, 2) + 
                    Math.pow(target.y - this.game.enemyBase.y, 2)
                );
                if (baseDistance < 100) {
                    actualDamage *= 1.2; // 敌方基地附近攻击有20%防御加成
                }
            } else if (this.faction === 'ai' && target.faction === 'player') {
                const baseDistance = Math.sqrt(
                    Math.pow(target.x - this.game.playerBase.x, 2) + 
                    Math.pow(target.y - this.game.playerBase.y, 2)
                );
                if (baseDistance < 100) {
                    actualDamage *= 1.2; // 玩家基地附近攻击有20%防御加成
                }
            }
        }
        
        return Math.floor(actualDamage);
    }

    getTypeRelation(attackerType, targetType) {
        // 单位克制关系矩阵
        const relations = {
            // 攻击者类型: { 被攻击者类型: 关系类型 }
            'soldier': { 'tank': 'counter', 'soldier': 'normal', 'worker': 'vulnerable' },
            'tank': { 'worker': 'counter', 'soldier': 'vulnerable', 'tank': 'normal' },
            'worker': { 'soldier': 'counter', 'tank': 'vulnerable', 'worker': 'normal' }
        };
        
        return relations[attackerType]?.[targetType] || 'normal';
    }

    attack(target) {
        const now = Date.now();
        if (now - this.lastAttackTime >= this.attackCooldown) {
            const damage = this.calculateAttackDamage(target);
            target.health -= damage;
            
            // 记录攻击日志
            if (this.game && this.game.addBattleLog) {
                const attackerName = this.faction === 'player' ? '玩家' : 'AI';
                const targetName = target.type ? 
                    this.game.getUnitDisplayName(target.type) : '敌方基地';
                const relation = this.getTypeRelation(this.type, target.type);
                const damageInfo = relation === 'counter' ? ' (克制攻击!)' : 
                                 relation === 'vulnerable' ? ' (被克制...)' : '';
                
                this.game.addBattleLog(`${attackerName} ${this.game.getUnitDisplayName(this.type)} 攻击 ${targetName}，造成 ${damage} 伤害${damageInfo}`);
            }
            
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

// 当页面加载完成后初始化游戏（避免重复创建实例）
document.addEventListener('DOMContentLoaded', () => {
    // 确保只在没有游戏引擎实例时才创建
    if (!window.gameEngine) {
        window.gameEngine = new GameEngine();
        // 确保所有必要的DOM元素都已加载后再初始化
        setTimeout(() => {
            window.gameEngine.init();
        }, 100);
    }
});