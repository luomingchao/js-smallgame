// AI指挥官：智能战线 - AI系统实现

// AI敌方智能类
class AIEnemy {
    constructor(level = 'easy') {
        this.level = level; // easy, medium, hard, expert
        this.decisionTimer = 0;
        
        // AI自己的资源系统
        this.resources = {
            money: 0,
            energy: 0
        };
        
        // 根据难度设置决策间隔
        this.decisionIntervals = {
            easy: 4000,      // 4秒 - 给新手机会
            medium: 2500,    // 2.5秒
            hard: 2000,      // 2秒
            expert: 1500     // 1.5秒
        };
        
        this.decisionInterval = this.decisionIntervals[level];
        this.units = [];
        
        // 根据难度设置策略
        this.strategies = {
            easy: ['defensive', 'balanced'],
            medium: ['balanced', 'defensive'],
            hard: ['aggressive', 'balanced'],
            expert: ['aggressive', 'very_aggressive']
        };
        
        this.strategy = this.strategies[level][Math.floor(Math.random() * this.strategies[level].length)];
        this.memory = {
            playerPatterns: [],
            successfulAttacks: [],
            failedDefenses: []
        };
        
        // 根据难度设置初始资源
        this.resourceMultipliers = {
            easy: 0.7,       // 新手模式：较少资源
            medium: 1.0,
            hard: 1.2,
            expert: 1.5
        };
        
        this.initializeAI(level);
    }
    
    initializeAI(level) {
        // 初始化AI属性根据难度
        switch(level) {
            case 'easy':
                this.aggression = 0.3;    // 低攻击力
                this.defense = 0.8;       // 高防御
                this.learningRate = 0.1;  // 学习速度慢
                break;
            case 'medium':
                this.aggression = 0.5;
                this.defense = 0.6;
                this.learningRate = 0.3;
                break;
            case 'hard':
                this.aggression = 0.7;
                this.defense = 0.5;
                this.learningRate = 0.6;
                break;
            case 'expert':
                this.aggression = 0.9;    // 极高攻击力
                this.defense = 0.4;       // 低防御（依靠攻击）
                this.learningRate = 0.9;  // 快速学习
                break;
        }

        // 设置AI初始资源（根据难度和关卡）
        const baseMoney = 1500;
        const baseEnergy = 500;
        this.resources.money = baseMoney * this.resourceMultipliers[level];
        this.resources.energy = baseEnergy * this.resourceMultipliers[level];
    }

    update(deltaTime, game) {
        this.decisionTimer += deltaTime;
        
        if (this.decisionTimer >= this.decisionInterval) {
            this.makeDecision(game);
            this.decisionTimer = 0;
        }
        
        // 更新AI单位
        this.updateAIUnits(game);

        // AI资源生成
        this.generateAIResources(deltaTime, game);
    }

    generateAIResources(deltaTime, game) {
        // AI自动获得资源（每秒根据难度获得资源）
        const incomeRate = {
            easy: 10,        // 每秒10金币
            medium: 15,      // 每秒15金币
            hard: 20,        // 每秒20金币
            expert: 25       // 每秒25金币
        };

        this.resources.money += incomeRate[this.level] * deltaTime / 1000;
        this.resources.energy += 5 * deltaTime / 1000; // 能量每5秒增加
    }

    makeDecision(game) {
        // 分析当前战场态势
        const analysis = this.analyzeSituation(game);
        
        // 根据分析结果制定策略
        if (analysis.playerAdvantage > 0.3) {
            this.strategy = 'defensive';
            this.suggestDefense(game, analysis);
        } else if (analysis.aiAdvantage > 0.3) {
            this.strategy = 'aggressive';
            this.suggestAttack(game, analysis);
        } else {
            this.strategy = 'balanced';
            this.suggestBalanced(game, analysis);
        }
        
        // 创建AI单位
        this.createAIUnits(game, analysis);
        
        // 更新AI状态显示
        this.updateAIStatus(analysis);
    }

    analyzeSituation(game) {
        const analysis = {
            playerUnits: 0,
            aiUnits: 0,
            playerPower: 0,
            aiPower: 0,
            playerAdvantage: 0,
            aiAdvantage: 0,
            criticalThreats: [],
            opportunities: []
        };
        
        // 分析单位数量和战力
        game.units.forEach(unit => {
            if (unit.faction === 'player') {
                analysis.playerUnits++;
                analysis.playerPower += this.calculateUnitPower(unit);
            } else {
                analysis.aiUnits++;
                analysis.aiPower += this.calculateUnitPower(unit);
            }
        });
        
        // 计算优势
        const powerRatio = analysis.aiPower / (analysis.playerPower + 1);
        analysis.playerAdvantage = Math.max(0, 1 - powerRatio);
        analysis.aiAdvantage = Math.max(0, powerRatio - 1);
        
        // 检测威胁和机会
        this.detectThreatsAndOpportunities(analysis, game);
        
        return analysis;
    }

    calculateUnitPower(unit) {
        const powerWeights = {
            'soldier': 1,
            'tank': 3,
            'worker': 0.5
        };
        return powerWeights[unit.type] || 1;
    }

    detectThreatsAndOpportunities(analysis, game) {
        // 检测对AI基地的威胁
        game.units.forEach(unit => {
            if (unit.faction === 'player' && unit.canAttack()) {
                const distanceToAI = Math.sqrt(
                    Math.pow(unit.x - game.enemyBase.x, 2) + 
                    Math.pow(unit.y - game.enemyBase.y, 2)
                );
                
                if (distanceToAI < 100) {
                    analysis.criticalThreats.push({
                        type: 'base_threat',
                        unit: unit,
                        urgency: 1 - (distanceToAI / 100)
                    });
                }
            }
        });
        
        // 检测攻击机会
        game.units.forEach(unit => {
            if (unit.faction === 'player' && unit.health < unit.maxHealth * 0.5) {
                analysis.opportunities.push({
                    type: 'weak_unit',
                    unit: unit,
                    potential: unit.maxHealth - unit.health
                });
            }
        });
    }

    suggestDefense(game, analysis) {
        // 更新AI聊天，显示防守建议
        const defenseMessage = document.createElement('div');
        defenseMessage.className = 'ai-message';
        defenseMessage.textContent = '雅典娜: 检测到敌方攻势，建议加强防守并保护基地！';
        const messagesContainer = document.getElementById('aiMessages');
        messagesContainer.appendChild(defenseMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    suggestAttack(game, analysis) {
        // 显示攻击建议
        const attackMessage = document.createElement('div');
        attackMessage.className = 'ai-message';
        attackMessage.textContent = '雅典娜: 当前形势有利，建议主动出击夺取更多领土！';
        const messagesContainer = document.getElementById('aiMessages');
        messagesContainer.appendChild(attackMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    suggestBalanced(game, analysis) {
        // 显示平衡策略建议
        const balancedMessage = document.createElement('div');
        balancedMessage.className = 'ai-message';
        balancedMessage.textContent = '雅典娜: 战场态势均衡，建议稳扎稳打，寻找突破时机！';
        const messagesContainer = document.getElementById('aiMessages');
        messagesContainer.appendChild(balancedMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    createAIUnits(game, analysis) {
        // 根据策略创建不同类型的单位
        let unitType = 'soldier';
        
        if (this.strategy === 'aggressive') {
            unitType = Math.random() < 0.7 ? 'tank' : 'soldier';
        } else if (this.strategy === 'defensive') {
            unitType = Math.random() < 0.6 ? 'soldier' : 'tank';
        } else {
            const rand = Math.random();
            if (rand < 0.5) unitType = 'soldier';
            else if (rand < 0.8) unitType = 'tank';
            else unitType = 'worker';
        }
        
        const cost = this.getUnitCost(unitType);
        if (this.resources.money >= cost) {
            const aiUnit = new GameUnit(unitType, game.enemyBase.x - 50, game.enemyBase.y, 'ai');
            game.units.push(aiUnit);
            
            // 使用AI自己的资源
            this.resources.money -= cost;
            
            // 给AI单位设置智能目标
            this.setAITarget(aiUnit, game);
        }
    }

    getUnitCost(type) {
        const costs = {
            'soldier': 100,
            'tank': 300,
            'worker': 50
        };
        return costs[type] || 100;
    }

    setAITarget(unit, game) {
        if (unit.type === 'worker') {
            // 工人移动到资源点
            const resources = [
                { x: 200, y: 150 },
                { x: 400, y: 450 },
                { x: 600, y: 100 }
            ];
            const target = resources[Math.floor(Math.random() * resources.length)];
            unit.moveTo(target.x, target.y);
        } else {
            // 战斗单位寻找目标
            this.assignCombatTarget(unit, game);
        }
    }

    assignCombatTarget(unit, game) {
        // 改进的目标分配算法
        const playerUnits = game.units.filter(u => u.faction === 'player' && u.canAttack());
        const playerBase = game.playerBase;
        const playerBaseDistance = Math.sqrt(
            Math.pow(unit.x - playerBase.x, 2) + 
            Math.pow(unit.y - playerBase.y, 2)
        );
        
        // 根据AI aggressiveness 决定攻击策略
        const attackPlayerUnits = Math.random() < this.aggression;
        
        if (playerUnits.length > 0 && attackPlayerUnits) {
            // 优先攻击最近的敌方单位
            let nearestUnit = null;
            let nearestDistance = Infinity;
            
            playerUnits.forEach(playerUnit => {
                const distance = Math.sqrt(
                    Math.pow(unit.x - playerUnit.x, 2) + 
                    Math.pow(unit.y - playerUnit.y, 2)
                );
                
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestUnit = playerUnit;
                }
            });
            
            if (nearestUnit) {
                unit.setTarget(nearestUnit);
            }
        } else if (playerBaseDistance < 300 || !attackPlayerUnits) {
            // 如果基地很近或AI比较保守，攻击基地
            unit.setTarget(playerBase);
        } else {
            // 向前推进或等待
            const forwardPositions = [
                { x: playerBase.x - 200, y: playerBase.y - 100 },
                { x: playerBase.x - 200, y: playerBase.y + 100 },
                { x: playerBase.x - 150, y: playerBase.y }
            ];
            
            const targetPosition = forwardPositions[Math.floor(Math.random() * forwardPositions.length)];
            unit.moveTo(targetPosition.x, targetPosition.y);
        }
    }

    updateAIUnits(game) {
        // 更新所有AI单位的决策
        game.units.forEach(unit => {
            if (unit.faction === 'ai' && unit.canAttack()) {
                // 重新评估目标 - 如果没有目标或目标死亡，重新分配
                if (!unit.target || unit.target.health <= 0 || unit.target.type === 'enemyBase') {
                    this.assignCombatTarget(unit, game);
                } else if (Math.random() < 0.1) { // 10%概率重新评估以增加智能
                    this.assignCombatTarget(unit, game);
                }
            }
        });
    }

    updateAIStatus(analysis) {
        // 更新AI状态显示
        document.getElementById('aiComplexity').textContent = 
            this.level.charAt(0).toUpperCase() + this.level.slice(1);
        
        const quality = analysis.aiAdvantage > 0.3 ? '优秀' : 
                       analysis.playerAdvantage > 0.3 ? '一般' : '良好';
        document.getElementById('aiQuality').textContent = quality;
        
        const responseTime = (Math.random() * 0.2 + 0.1).toFixed(1) + 's';
        document.getElementById('aiResponse').textContent = responseTime;
    }
}

// AI战术分析类
class TacticsAnalyzer {
    constructor() {
        this.analysisHistory = [];
        this.recommendations = [];
    }

    analyzeBattlefield(game) {
        const analysis = {
            playerPosition: this.analyzePlayerPosition(game),
            aiPosition: this.analyzeAIPosition(game),
            resourceControl: this.analyzeResourceControl(game),
            tacticalRecommendations: []
        };
        
        // 生成战术建议
        this.generateRecommendations(analysis, game);
        
        // 更新分析历史
        this.analysisHistory.push({
            time: Date.now(),
            analysis: analysis
        });
        
        // 只保留最近5次分析
        if (this.analysisHistory.length > 5) {
            this.analysisHistory = this.analysisHistory.slice(-5);
        }
        
        return analysis;
    }

    analyzePlayerPosition(game) {
        const playerUnits = game.units.filter(u => u.faction === 'player');
        
        if (playerUnits.length === 0) {
            return { status: 'no_units', score: 0 };
        }
        
        // 计算平均位置
        const avgX = playerUnits.reduce((sum, unit) => sum + unit.x, 0) / playerUnits.length;
        const avgY = playerUnits.reduce((sum, unit) => sum + unit.y, 0) / playerUnits.length;
        
        // 计算凝聚力（单位间的距离）
        const cohesion = this.calculateCohesion(playerUnits);
        
        // 分析攻击力
        const totalAttackPower = playerUnits.reduce((sum, unit) => {
            return sum + (unit.canAttack() ? unit.attackDamage : 0);
        }, 0);
        
        return {
            status: cohesion > 0.7 ? 'organized' : 'scattered',
            cohesion: cohesion,
            attackPower: totalAttackPower,
            avgPosition: { x: avgX, y: avgY }
        };
    }

    analyzeAIPosition(game) {
        // AI位置分析逻辑类似玩家分析
        const aiUnits = game.units.filter(u => u.faction === 'ai');
        
        if (aiUnits.length === 0) {
            return { status: 'no_units', score: 0 };
        }
        
        const avgX = aiUnits.reduce((sum, unit) => sum + unit.x, 0) / aiUnits.length;
        const avgY = aiUnits.reduce((sum, unit) => sum + unit.y, 0) / aiUnits.length;
        
        const cohesion = this.calculateCohesion(aiUnits);
        const totalAttackPower = aiUnits.reduce((sum, unit) => {
            return sum + (unit.canAttack() ? unit.attackDamage : 0);
        }, 0);
        
        return {
            status: cohesion > 0.7 ? 'organized' : 'scattered',
            cohesion: cohesion,
            attackPower: totalAttackPower,
            avgPosition: { x: avgX, y: avgY }
        };
    }

    calculateCohesion(units) {
        if (units.length <= 1) return 1;
        
        let totalDistance = 0;
        let pairCount = 0;
        
        for (let i = 0; i < units.length; i++) {
            for (let j = i + 1; j < units.length; j++) {
                const distance = Math.sqrt(
                    Math.pow(units[i].x - units[j].x, 2) + 
                    Math.pow(units[i].y - units[j].y, 2)
                );
                totalDistance += distance;
                pairCount++;
            }
        }
        
        const avgDistance = totalDistance / pairCount;
        return Math.max(0, 1 - (avgDistance / 200)); // 标准化到0-1
    }

    analyzeResourceControl(game) {
        // 分析资源控制情况
        const resources = [
            { x: 200, y: 150, type: 'gold' },
            { x: 400, y: 450, type: 'gold' },
            { x: 600, y: 100, type: 'energy' }
        ];
        
        const control = resources.map(resource => {
            const nearestPlayer = this.findNearestPlayerUnit(game, resource);
            const nearestAI = this.findNearestAIUnit(game, resource);
            
            if (!nearestPlayer && !nearestAI) {
                return { resource, control: 'neutral', distance: Infinity };
            }
            
            const playerDistance = nearestPlayer ? 
                Math.sqrt(Math.pow(resource.x - nearestPlayer.x, 2) + Math.pow(resource.y - nearestPlayer.y, 2)) : 
                Infinity;
            const aiDistance = nearestAI ?
                Math.sqrt(Math.pow(resource.x - nearestAI.x, 2) + Math.pow(resource.y - nearestAI.y, 2)) :
                Infinity;
            
            let control = 'neutral';
            if (playerDistance < 80 && playerDistance < aiDistance) {
                control = 'player';
            } else if (aiDistance < 80 && aiDistance < playerDistance) {
                control = 'ai';
            }
            
            return {
                resource,
                control,
                playerDistance,
                aiDistance
            };
        });
        
        return control;
    }

    findNearestPlayerUnit(game, position) {
        const playerUnits = game.units.filter(u => u.faction === 'player');
        
        let nearest = null;
        let nearestDistance = Infinity;
        
        playerUnits.forEach(unit => {
            const distance = Math.sqrt(
                Math.pow(position.x - unit.x, 2) + Math.pow(position.y - unit.y, 2)
            );
            if (distance < nearestDistance) {
                nearest = unit;
                nearestDistance = distance;
            }
        });
        
        return nearest;
    }

    findNearestAIUnit(game, position) {
        const aiUnits = game.units.filter(u => u.faction === 'ai');
        
        let nearest = null;
        let nearestDistance = Infinity;
        
        aiUnits.forEach(unit => {
            const distance = Math.sqrt(
                Math.pow(position.x - unit.x, 2) + Math.pow(position.y - unit.y, 2)
            );
            if (distance < nearestDistance) {
                nearest = unit;
                nearestDistance = distance;
            }
        });
        
        return nearest;
    }

    generateRecommendations(analysis, game) {
        const recommendations = [];
        
        // 基于位置分析的建议
        if (analysis.playerPosition.cohesion < 0.5) {
            recommendations.push({
                type: 'formation',
                priority: 'high',
                message: '建议收紧阵型，提高单位间的协调性',
                target: 'player'
            });
        }
        
        // 基于资源控制的建议
        const playerResourceCount = analysis.resourceControl.filter(r => r.control === 'player').length;
        const totalResources = analysis.resourceControl.length;
        
        if (playerResourceCount < totalResources * 0.5) {
            recommendations.push({
                type: 'resource',
                priority: 'medium',
                message: '需要加强对资源点的控制，建议派遣更多单位',
                target: 'player'
            });
        }
        
        // 基于攻击力的建议
        if (analysis.playerPosition.attackPower < analysis.aiPosition.attackPower * 0.8) {
            recommendations.push({
                type: 'production',
                priority: 'high',
                message: '当前攻击力不足，建议生产更多攻击单位',
                target: 'player'
            });
        }
        
        this.recommendations = recommendations;
        
        // 更新UI显示
        this.updateRecommendationsUI(recommendations);
    }

    updateRecommendationsUI(recommendations) {
        const aiAnalysis = document.getElementById('aiAnalysis');
        
        if (recommendations.length === 0) {
            aiAnalysis.innerHTML = '当前战术状况良好，继续保持！';
        } else {
            const html = recommendations.map(rec => {
                const priorityColor = rec.priority === 'high' ? '#ff4444' : 
                                    rec.priority === 'medium' ? '#ffaa00' : '#44ff44';
                return `<div style="margin-bottom: 8px;">
                    <span style="color: ${priorityColor}; font-weight: bold;">[${rec.priority.toUpperCase()}]</span> 
                    ${rec.message}
                </div>`;
            }).join('');
            aiAnalysis.innerHTML = html;
        }
    }
}

// 智能学习系统
class LearningSystem {
    constructor() {
        this.learningData = {
            playerBehaviors: [],
            successfulStrategies: [],
            failedStrategies: []
        };
    }

    recordPlayerAction(game, action, outcome) {
        const actionRecord = {
            timestamp: Date.now(),
            action: action,
            gameState: this.captureGameState(game),
            outcome: outcome,
            effectiveness: this.evaluateEffectiveness(game, outcome)
        };
        
        this.learningData.playerBehaviors.push(actionRecord);
        
        // 只保留最近的100次记录
        if (this.learningData.playerBehaviors.length > 100) {
            this.learningData.playerBehaviors = this.learningData.playerBehaviors.slice(-100);
        }
    }

    captureGameState(game) {
        return {
            unitCount: game.units.length,
            resourceLevel: game.resources.money,
            timeElapsed: game.gameTime,
            aiUnits: game.units.filter(u => u.faction === 'ai').length,
            playerUnits: game.units.filter(u => u.faction === 'player').length
        };
    }

    evaluateEffectiveness(game, outcome) {
        // 简单的效果评估
        if (outcome === 'victory') return 1.0;
        if (outcome === 'defeat') return 0.0;
        
        // 基于资源变化评估
        const resourceChange = game.resources.money - 1000; // 假设初始资源1000
        return Math.max(0, Math.min(1, resourceChange / 500));
    }

    generateAdaptiveStrategy() {
        // 分析玩家行为模式
        const patterns = this.analyzePlayerPatterns();
        
        // 生成适应性策略
        if (patterns.aggressive) {
            return {
                strategy: 'defensive',
                reasoning: '玩家倾向于攻击，应该加强防守'
            };
        } else if (patterns.defensive) {
            return {
                strategy: 'aggressive',
                reasoning: '玩家偏重防守，可以发动突然袭击'
            };
        } else {
            return {
                strategy: 'balanced',
                reasoning: '玩家战术多样化，采用平衡策略'
            };
        }
    }

    analyzePlayerPatterns() {
        const recentActions = this.learningData.playerBehaviors.slice(-20);
        
        let aggressive = 0;
        let defensive = 0;
        
        recentActions.forEach(action => {
            if (action.action.type === 'attack') aggressive++;
            if (action.action.type === 'defend') defensive++;
        });
        
        return {
            aggressive: aggressive > defensive * 1.5,
            defensive: defensive > aggressive * 1.5,
            balanced: !aggressive && !defensive
        };
    }
}

// 创建全局AI分析器实例
window.tacticsAnalyzer = new TacticsAnalyzer();
window.learningSystem = new LearningSystem();