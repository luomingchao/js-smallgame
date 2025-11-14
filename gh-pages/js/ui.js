// AI指挥官：智能战线 - UI交互系统

class UIManager {
    constructor() {
        this.setupEventListeners();
        this.setupAnimations();
        this.setupTooltips();
        this.currentTheme = 'default';
        this.notificationQueue = [];
    }

    setupEventListeners() {
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // 窗口调整大小
        window.addEventListener('resize', () => this.handleResize());
        
        // 鼠标悬停效果
        this.setupHoverEffects();
        
        // 触摸设备支持
        this.setupTouchSupport();
    }

    setupAnimations() {
        // 页面加载动画
        this.fadeInElements();
        
        // 实时更新动画
        this.setupRealtimeAnimations();
    }

    fadeInElements() {
        const elements = document.querySelectorAll('.game-container > *');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    setupRealtimeAnimations() {
        // 资源条动画
        this.animateResourceBars();
        
        // AI状态指示器动画
        this.animateAIStatus();
        
        // 胜利进度条动画
        this.animateProgressBars();
    }

    animateResourceBars() {
        const moneyElement = document.getElementById('money');
        const energyElement = document.getElementById('energy');
        
        let lastMoney = parseInt(moneyElement.textContent) || 1000;
        let lastEnergy = parseInt(energyElement.textContent) || 500;
        
        setInterval(() => {
            const currentMoney = parseInt(moneyElement.textContent) || lastMoney;
            const currentEnergy = parseInt(energyElement.textContent) || lastEnergy;
            
            if (currentMoney !== lastMoney) {
                this.animateValueChange(moneyElement, lastMoney, currentMoney, '#ffff00');
                lastMoney = currentMoney;
            }
            
            if (currentEnergy !== lastEnergy) {
                this.animateValueChange(energyElement, lastEnergy, currentEnergy, '#00ffff');
                lastEnergy = currentEnergy;
            }
        }, 500);
    }

    animateValueChange(element, oldValue, newValue, color) {
        element.style.transition = 'color 0.3s ease';
        element.style.color = color;
        
        setTimeout(() => {
            element.style.color = '#ffffff';
        }, 300);
    }

    animateAIStatus() {
        const aiMoodElement = document.getElementById('aiMood');
        
        // AI状态循环变色
        let hue = 0;
        setInterval(() => {
            hue = (hue + 2) % 360;
            aiMoodElement.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
        }, 100);
    }

    animateProgressBars() {
        const progressElement = document.getElementById('winProgress');
        
        // 胜利进度条闪烁效果
        setInterval(() => {
            if (gameEngine && gameEngine.gameState === 'playing') {
                progressElement.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
                setTimeout(() => {
                    progressElement.style.boxShadow = 'none';
                }, 200);
            }
        }, 2000);
    }

    setupTooltips() {
        // 为单位按钮添加工具提示
        document.querySelectorAll('.unit-btn').forEach(btn => {
            const unitType = btn.dataset.unit;
            const tooltip = this.generateTooltip(unitType);
            this.addTooltip(btn, tooltip);
        });
        
        // 为AI状态添加工具提示
        this.addTooltip(document.querySelector('.ai-assistant'), 
            '雅典娜AI副官 - 您的智能战术顾问');
    }

    generateTooltip(unitType) {
        const tooltips = {
            'soldier': {
                name: '士兵',
                description: '基础作战单位，拥有良好的攻击力和移动速度',
                stats: '生命: 100 | 攻击: 20 | 射程: 30 | 速度: 2'
            },
            'tank': {
                name: '坦克',
                description: '重型攻击单位，拥有强大的火力和防御力',
                stats: '生命: 300 | 攻击: 50 | 射程: 50 | 速度: 1'
            },
            'worker': {
                name: '工人',
                description: '经济单位，自动采集资源并建造设施',
                stats: '生命: 50 | 采集: 2/秒 | 移动: 3'
            }
        };
        
        const tooltip = tooltips[unitType];
        return `<strong>${tooltip.name}</strong><br>${tooltip.description}<br><small>${tooltip.stats}</small>`;
    }

    addTooltip(element, text) {
        element.addEventListener('mouseenter', (e) => {
            this.showTooltip(e, text);
        });
        
        element.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        element.addEventListener('mousemove', (e) => {
            this.updateTooltipPosition(e);
        });
    }

    showTooltip(event, text) {
        const tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.innerHTML = text;
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            max-width: 200px;
            z-index: 1000;
            pointer-events: none;
            border: 1px solid #00aaff;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        `;
        
        document.body.appendChild(tooltip);
        this.updateTooltipPosition(event);
    }

    updateTooltipPosition(event) {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            const x = event.clientX + 10;
            const y = event.clientY - 10;
            
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
            
            // 确保工具提示不会超出屏幕
            const rect = tooltip.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                tooltip.style.left = (window.innerWidth - rect.width - 10) + 'px';
            }
            if (rect.top < 0) {
                tooltip.style.top = '10px';
            }
        }
    }

    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    setupHoverEffects() {
        // 按钮悬停效果
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 4px 15px rgba(0, 170, 255, 0.3)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            });
        });
        
        // 单位按钮特殊效果
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (!btn.disabled) {
                    btn.style.background = 'linear-gradient(135deg, #555, #777)';
                    btn.style.borderColor = '#00aaff';
                }
            });
            
            btn.addEventListener('mouseleave', () => {
                if (!btn.disabled) {
                    btn.style.background = 'linear-gradient(135deg, #333, #555)';
                    btn.style.borderColor = '#666';
                }
            });
        });
    }

    setupTouchSupport() {
        // 触摸设备优化
        if ('ontouchstart' in window) {
            // 禁用右键菜单
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
            
            // 添加触摸手势支持
            let touchStartX = 0;
            let touchStartY = 0;
            
            document.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            });
            
            document.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                const deltaX = Math.abs(touchEndX - touchStartX);
                const deltaY = Math.abs(touchEndY - touchStartY);
                
                // 简单的滑动检测
                if (deltaX > 50 || deltaY > 50) {
                    this.handleSwipeGesture(touchStartX, touchStartY, touchEndX, touchEndY);
                }
            });
        }
    }

    handleSwipeGesture(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                // 向右滑动 - 可能用于切换面板
                this.showNotification('向右滑动 - 面板切换');
            } else {
                // 向左滑动
                this.showNotification('向左滑动 - 面板切换');
            }
        } else {
            if (deltaY > 0) {
                // 向下滑动 - 暂停游戏
                if (gameEngine) {
                    gameEngine.pauseGame();
                    this.showNotification('游戏已暂停');
                }
            } else {
                // 向上滑动 - 恢复游戏
                if (gameEngine && gameEngine.gameState === 'paused') {
                    gameEngine.startGame();
                    this.showNotification('游戏继续');
                }
            }
        }
    }

    handleKeyboardShortcuts(event) {
        if (!gameEngine) return;
        
        switch(event.key) {
            case 'Escape':
                // ESC键 - 取消选择
                gameEngine.selectedUnits = [];
                gameEngine.highlightSelectedUnits();
                this.showNotification('已取消所有选择');
                break;
                
            case '1':
            case '2':
            case '3':
                // 数字键1-3 - 快速创建单位
                event.preventDefault();
                const unitTypes = ['worker', 'soldier', 'tank'];
                const unitIndex = parseInt(event.key) - 1;
                if (unitTypes[unitIndex]) {
                    const cost = gameEngine.getUnitCost ? gameEngine.getUnitCost(unitTypes[unitIndex]) : 
                                (unitTypes[unitIndex] === 'worker' ? 50 : 
                                 unitTypes[unitIndex] === 'soldier' ? 100 : 300);
                    gameEngine.createUnit(unitTypes[unitIndex], cost);
                }
                break;
                
            case ' ':
                // 空格键 - 暂停/继续
                event.preventDefault();
                gameEngine.pauseGame();
                break;
                
            case 'r':
            case 'R':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    // Ctrl+R - 重置游戏
                    gameEngine.resetGame();
                }
                break;
                
            case 'h':
            case 'H':
                // H键 - 显示/隐藏帮助
                this.toggleHelp();
                break;
        }
    }

    toggleHelp() {
        const modal = document.getElementById('rulesModal');
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'block';
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // 根据类型设置样式
        const colors = {
            'info': '#00aaff',
            'success': '#00ff88',
            'warning': '#ffaa00',
            'error': '#ff4444'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 1001;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // 滑入动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 自动移除
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        return notification;
    }

    updateGameStats() {
        if (!gameEngine) return;
        
        // 更新实时统计信息
        const stats = {
            units: gameEngine.units.length,
            playerUnits: gameEngine.units.filter(u => u.faction === 'player').length,
            aiUnits: gameEngine.units.filter(u => u.faction === 'ai').length,
            resources: Math.floor(gameEngine.resources.money),
            energy: Math.floor(gameEngine.resources.energy),
            gameTime: gameEngine.getCurrentTime()
        };
        
        // 添加统计更新动画
        this.animateStatsUpdate(stats);
    }

    animateStatsUpdate(stats) {
        // 简单的统计更新动画效果
        const elements = {
            unitCount: document.getElementById('unitCount'),
            gameTime: document.getElementById('gameTime'),
            money: document.getElementById('money'),
            energy: document.getElementById('energy')
        };
        
        if (elements.unitCount) {
            elements.unitCount.style.transition = 'color 0.3s ease';
            elements.unitCount.style.color = '#00ff88';
            setTimeout(() => {
                elements.unitCount.style.color = '#ffffff';
            }, 300);
        }
    }
    
    // 新增：更新关卡UI
    updateLevelUI(level, difficulty, isNewbieMode) {
        const levelElement = document.getElementById('currentLevel');
        const difficultyElement = document.getElementById('levelDifficulty');
        const newbieElement = document.getElementById('newbieMode');
        
        if (levelElement) {
            levelElement.textContent = level;
            // 添加数字滚动效果
            this.animateNumber(levelElement);
        }
        
        if (difficultyElement) {
            difficultyElement.textContent = this.getDifficultyLabel(difficulty);
            difficultyElement.className = `level-difficulty ${difficulty}`;
        }
        
        if (newbieElement) {
            if (isNewbieMode && level === 1) {
                newbieElement.style.display = 'block';
                newbieElement.style.animation = 'glow 2s infinite';
            } else {
                newbieElement.style.display = 'none';
            }
        }
    }
    
    getDifficultyLabel(level) {
        const labels = {
            easy: '简单',
            medium: '中等',
            hard: '困难',
            expert: '专家'
        };
        return labels[level] || '简单';
    }
    
    animateNumber(element) {
        element.style.transform = 'scale(1.2)';
        element.style.color = '#00ffff';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '#ffffff';
        }, 200);
    }
    
    // 新增：显示教学提示
    showTutorialStep(step, totalSteps) {
        const messagesContainer = document.getElementById('aiMessages');
        if (!messagesContainer) return;
        
        const tutorialMessage = document.createElement('div');
        tutorialMessage.className = 'ai-message tutorial-step';
        tutorialMessage.innerHTML = `
            <span class="tutorial-icon">🎓</span>
            <span class="tutorial-text">教学步骤 ${step}/${totalSteps}</span>
        `;
        
        messagesContainer.appendChild(tutorialMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // 添加教学步骤的样式
        const style = document.createElement('style');
        style.textContent = `
            .tutorial-step {
                background: linear-gradient(45deg, #ff00ff, #00ffff);
                color: #000;
                font-weight: bold;
                border-radius: 10px;
                padding: 8px;
                margin: 5px 0;
            }
            .tutorial-step .tutorial-icon {
                font-size: 1.2em;
                margin-right: 8px;
            }
            .ai-message.tutorial-message {
                background: rgba(255, 255, 255, 0.1);
                border-left: 4px solid #00ffff;
                font-style: italic;
                animation: fadeInUp 0.5s ease;
            }
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 新增：显示关卡完成提示
    showLevelComplete(level) {
        this.showNotification(`🎉 关卡 ${level} 完成！准备进入下一关...`, 'success', 3000);
        
        // 添加特殊效果
        const levelElement = document.getElementById('currentLevel');
        if (levelElement) {
            levelElement.style.animation = 'pulse 0.5s ease-in-out 3';
        }
    }
    
    // 新增：显示通关信息
    showGameComplete() {
        const modal = document.getElementById('rulesModal');
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="text-align: center; padding: 40px;">
                <h1 style="color: #00ff88; margin-bottom: 20px;">🏆 恭喜通关！</h1>
                <p style="font-size: 1.5em; margin-bottom: 20px;">你是真正的AI指挥官大师！</p>
                <div style="margin: 20px 0;">
                    <span style="background: linear-gradient(45deg, #ff00ff, #00ffff); padding: 10px 20px; border-radius: 25px; color: #000; font-weight: bold;">
                        🎆 所有关卡已解锁！
                    </span>
                </div>
                <button id="restartGame" style="margin-top: 20px; padding: 12px 30px; background: #00ff88; color: #000; border: none; border-radius: 25px; font-weight: bold; cursor: pointer;">
                    重新开始挑战
                </button>
            </div>
        `;
        
        // 为重新开始按钮添加事件监听器
        document.getElementById('restartGame')?.addEventListener('click', () => {
            modal.style.display = 'none';
            if (window.gameEngine) {
                window.gameEngine.level = 1;
                window.gameEngine.newbieMode = true;
                window.gameEngine.resetGame();
            }
        });
    }

    createCustomTheme(themeName, colors) {
        const style = document.createElement('style');
        style.id = `theme-${themeName}`;
        style.textContent = `
            .theme-${themeName} {
                --primary-color: ${colors.primary};
                --secondary-color: ${colors.secondary};
                --accent-color: ${colors.accent};
                --background-color: ${colors.background};
                --text-color: ${colors.text};
            }
        `;
        
        document.head.appendChild(style);
    }

    applyTheme(themeName) {
        this.currentTheme = themeName;
        document.body.className = `theme-${themeName}`;
    }

    setupPerformanceMonitoring() {
        // 监控游戏性能
        if (window.performance && window.performance.memory) {
            setInterval(() => {
                const memory = window.performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
                    this.showNotification('内存使用率过高，可能影响游戏性能', 'warning');
                }
            }, 10000);
        }
    }

    handleResize() {
        // 响应式设计处理
        const isMobile = window.innerWidth < 768;
        const gameContainer = document.querySelector('.game-container');
        
        if (gameContainer) {
            if (isMobile) {
                gameContainer.style.padding = '5px';
                document.body.classList.add('mobile-view');
            } else {
                gameContainer.style.padding = '10px';
                document.body.classList.remove('mobile-view');
            }
        }
    }

    // 导出/导入游戏状态
    exportGameState() {
        if (!gameEngine) return null;
        
        const gameState = {
            units: gameEngine.units.map(unit => ({
                type: unit.type,
                x: unit.x,
                y: unit.y,
                faction: unit.faction,
                health: unit.health,
                maxHealth: unit.maxHealth
            })),
            resources: gameEngine.resources,
            gameTime: gameEngine.gameTime,
            playerBase: gameEngine.playerBase,
            enemyBase: gameEngine.enemyBase,
            timestamp: Date.now()
        };
        
        return JSON.stringify(gameState, null, 2);
    }

    importGameState(stateString) {
        try {
            const gameState = JSON.parse(stateString);
            
            if (gameEngine && gameState.units) {
                // 恢复游戏状态
                gameEngine.units = gameState.units.map(unitData => {
                    const unit = new GameUnit(unitData.type, unitData.x, unitData.y, unitData.faction);
                    unit.health = unitData.health;
                    unit.maxHealth = unitData.maxHealth;
                    return unit;
                });
                
                gameEngine.resources = gameState.resources;
                gameEngine.gameTime = gameState.gameTime;
                gameEngine.playerBase = gameState.playerBase;
                gameEngine.enemyBase = gameState.enemyBase;
                
                this.showNotification('游戏状态已恢复', 'success');
                return true;
            }
        } catch (error) {
            this.showNotification('导入游戏状态失败', 'error');
            return false;
        }
    }

    // 音效系统
    playSound(soundType) {
        const sounds = {
            'click': this.createClickSound(),
            'unitCreated': this.createUnitCreatedSound(),
            'attack': this.createAttackSound(),
            'victory': this.createVictorySound(),
            'defeat': this.createDefeatSound()
        };
        
        const sound = sounds[soundType];
        if (sound) {
            const audio = new Audio(sound);
            audio.volume = 0.3;
            audio.play().catch(() => {
                // 静默处理音频播放失败
            });
        }
    }

    createClickSound() {
        // 使用Web Audio API生成简单音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        
        return null; // 简化版本，不返回音频对象
    }

    createUnitCreatedSound() { return null; }
    createAttackSound() { return null; }
    createVictorySound() { return null; }
    createDefeatSound() { return null; }
}

// 创建全局UI管理器实例
window.uiManager = new UIManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 添加页面加载完成动画
    document.body.classList.add('loaded');
    
    // 设置全局引用
    window.uiManager = uiManager;
    
    // 显示欢迎消息
    setTimeout(() => {
        uiManager.showNotification('欢迎来到AI指挥官：智能战线！', 'success');
    }, 2000);
    
    // 设置性能监控
    uiManager.setupPerformanceMonitoring();
    
    // 添加键盘快捷键提示
    setTimeout(() => {
        uiManager.showNotification('快捷键：1/2/3创建单位，空格暂停，ESC取消选择', 'info', 5000);
    }, 5000);
    
    // 添加新手模式提示
    setTimeout(() => {
        uiManager.showNotification('新手模式开启：AI会放慢速度帮助你学习！', 'info', 4000);
    }, 7000);
});

// 导出UI管理器供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}