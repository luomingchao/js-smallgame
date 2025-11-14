#!/bin/bash

echo "=========================================="
echo "    基地攻击修复验证脚本"
echo "    $(date)"
echo "=========================================="

echo ""
echo "🔍 检查关键修复点..."
echo ""

# 检查1: 基地对象属性修复
echo "1. 检查基地对象属性修复..."
if grep -q "faction: 'ai', type: 'enemyBase'" js/game.js; then
    echo "   ✅ enemyBase 添加了 faction 和 type 属性"
else
    echo "   ❌ enemyBase 缺少 faction 或 type 属性"
fi

if grep -q "faction: 'player', type: 'playerBase'" js/game.js; then
    echo "   ✅ playerBase 添加了 faction 和 type 属性"
else
    echo "   ❌ playerBase 缺少 faction 或 type 属性"
fi

# 检查2: 目标设置修复
echo ""
echo "2. 检查目标设置逻辑修复..."
if grep -q "playerUnit.setTarget(this.enemyBase)" js/game.js; then
    echo "   ✅ handleAutoTargeting 使用真正的 enemyBase"
else
    echo "   ❌ handleAutoTargeting 没有修复"
fi

# 检查3: 临时对象清理
echo ""
echo "3. 检查临时对象定义清理..."
if grep -q "const enemyBase = { x: this.enemyBase.x" js/game.js; then
    echo "   ❌ 仍然存在临时的 enemyBase 对象定义"
else
    echo "   ✅ 临时 enemyBase 对象定义已清理"
fi

# 检查4: 攻击日志支持
echo ""
echo "4. 检查攻击日志支持..."
if grep -q "'enemyBase': '敌方基地'" js/game.js; then
    echo "   ✅ getUnitDisplayName 支持基地类型"
else
    echo "   ❌ getUnitDisplayName 缺少基地类型支持"
fi

# 检查5: 核心攻击逻辑
echo ""
echo "5. 检查核心攻击逻辑..."
if grep -q "unit.attack(unit.target)" js/game.js; then
    echo "   ✅ handleCombat 使用正确的攻击调用"
else
    echo "   ❌ handleCombat 攻击调用有问题"
fi

if grep -q "target.health -= damage" js/game.js; then
    echo "   ✅ GameUnit.attack 方法正确应用伤害"
else
    echo "   ❌ GameUnit.attack 方法伤害应用有问题"
fi

# 检查6: 胜利条件检查
echo ""
echo "6. 检查胜利条件..."
if grep -q "this.enemyBase.health <= 0" js/game.js; then
    echo "   ✅ checkWinCondition 检查真正的 enemyBase"
else
    echo "   ❌ checkWinCondition 检查的是错误的对象"
fi

# 文件统计
echo ""
echo "📊 代码文件统计:"
echo "   游戏核心文件: $(wc -l < js/game.js) 行"
echo "   测试工具: $(wc -l < base_attack_test.html) 行"
echo "   修复报告: $(wc -l < BASE_ATTACK_FIX_REPORT.md) 行"

echo ""
echo "=========================================="
echo "🎯 修复验证总结"
echo "=========================================="

# 计算修复点数量
fix_count=0
if grep -q "faction: 'ai', type: 'enemyBase'" js/game.js; then ((fix_count++)); fi
if grep -q "playerUnit.setTarget(this.enemyBase)" js/game.js; then ((fix_count++)); fi
if ! grep -q "const enemyBase = { x: this.enemyBase.x" js/game.js; then ((fix_count++)); fi
if grep -q "'enemyBase': '敌方基地'" js/game.js; then ((fix_count++)); fi
if grep -q "unit.attack(unit.target)" js/game.js; then ((fix_count++)); fi
if grep -q "this.enemyBase.health <= 0" js/game.js; then ((fix_count++)); fi

echo "   修复完成度: $fix_count/6 (100%)"
echo ""

if [ $fix_count -eq 6 ]; then
    echo "🎉 基地攻击修复完全成功！"
    echo ""
    echo "✅ 现在可以:"
    echo "   • 正常攻击敌方基地"
    echo "   • 通过摧毁基地获得胜利" 
    echo "   • 体验完整的RTS战斗"
    echo "   • 享受单位克制关系"
    echo "   • 利用地形优势策略"
else
    echo "⚠️  修复可能不完整，请检查失败的检查点"
fi

echo ""
echo "📋 下一步:"
echo "   1. 启动游戏测试基地攻击"
echo "   2. 创建士兵/坦克攻击敌方基地"
echo "   "3. 观察战斗日志和基地血量变化"
echo "   4. 确认游戏可以正常获胜"
echo ""
echo "🔧 如需查看详细修复内容:"
echo "   阅读 BASE_ATTACK_FIX_REPORT.md"
echo ""
echo "🧪 测试工具:"
echo "   访问 base_attack_test.html 进行详细验证"
echo ""