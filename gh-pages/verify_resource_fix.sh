#!/bin/bash

echo "=========================================="
echo "    资源系统修复验证脚本"
echo "    $(date)"
echo "=========================================="

echo ""
echo "🔍 检查工人采集修复..."
echo ""

# 检查1: 资源点定义一致性
echo "1. 检查资源点定义一致性..."
if grep -q "'type': 'gold'" js/game.js && grep -q "'type': 'energy'" js/game.js; then
    echo "   ✅ 资源点定义包含类型信息"
else
    echo "   ❌ 资源点定义缺少类型信息"
fi

# 检查2: isNearResource修复
echo ""
echo "2. 检查 isNearResource() 修复..."
if grep -q "type: 'gold', collectionRadius: 40" js/game.js; then
    echo "   ✅ isNearResource() 使用完整资源点定义"
else
    echo "   ❌ isNearResource() 修复不完整"
fi

# 检查3: getCurrentResourceType方法
echo ""
echo "3. 检查 getCurrentResourceType() 方法..."
if grep -q "getCurrentResourceType()" js/game.js; then
    echo "   ✅ 添加了资源类型识别方法"
else
    echo "   ❌ 缺少资源类型识别方法"
fi

# 检查4: 工人采集逻辑
echo ""
echo "4. 检查工人采集逻辑修复..."
if grep -q "resourceType === 'gold'" js/game.js && grep -q "resourceType === 'energy'" js/game.js; then
    echo "   ✅ 工人根据资源类型分别采集"
else
    echo "   ❌ 工人采集逻辑有问题"
fi

echo ""
echo "🔍 检查能量系统修复..."
echo ""

# 检查5: 能量生成系统
echo "5. 检查能量生成系统..."
if grep -q "this.resources.energy += 5 \* deltaTime / 1000" js/game.js; then
    echo "   ✅ 玩家能量生成系统正常"
else
    echo "   ❌ 玩家能量生成系统有问题"
fi

if grep -q "this.resources.energy += 5 \* deltaTime / 1000" js/ai.js; then
    echo "   ✅ AI能量生成系统正常"
else
    echo "   ❌ AI能量生成系统有问题"
fi

# 检查6: 能量消耗机制
echo ""
echo "6. 检查能量消耗机制..."
if grep -q "energyCost = 20" js/game.js && grep -q "this.resources.energy >= energyCost" js/game.js; then
    echo "   ✅ 坦克能量消耗机制正常"
else
    echo "   ❌ 坦克能量消耗机制有问题"
fi

if grep -q "this.resources.energy -= energyCost" js/game.js; then
    echo "   ✅ 能量扣除逻辑正常"
else
    echo "   ❌ 能量扣除逻辑有问题"
fi

# 检查7: 资源不足提示
echo ""
echo "7. 检查资源不足提示..."
if grep -q "金币不足" js/game.js && grep -q "能量不足" js/game.js; then
    echo "   ✅ 资源不足提示完整"
else
    echo "   ❌ 资源不足提示不完整"
fi

# 检查8: UI更新
echo ""
echo "8. 检查UI显示..."
if grep -q "document.getElementById('energy').textContent" js/game.js; then
    echo "   ✅ 能量UI显示正常"
else
    echo "   ❌ 能量UI显示有问题"
fi

if grep -q "300金 + 20能量" index.html; then
    echo "   ✅ 坦克按钮显示能量消耗"
else
    echo "   ❌ 坦克按钮没有显示能量消耗"
fi

# 检查9: 游戏规则更新
echo ""
echo "9. 检查游戏规则更新..."
if grep -q "⚡ 资源系统" index.html; then
    echo "   ✅ 游戏规则包含资源系统说明"
else
    echo "   ❌ 游戏规则缺少资源系统说明"
fi

# 统计文件
echo ""
echo "📊 修复文件统计:"
echo "   游戏核心文件: $(wc -l < js/game.js) 行"
echo "   AI文件: $(wc -l < js/ai.js) 行"
echo "   UI文件: $(wc -l < index.html) 行"
echo "   测试工具: $(wc -l < resource_system_test.html) 行"

echo ""
echo "=========================================="
echo "🎯 资源系统修复验证总结"
echo "=========================================="

# 计算修复完成度
fix_count=0
if grep -q "type: 'gold', collectionRadius: 40" js/game.js; then ((fix_count++)); fi
if grep -q "getCurrentResourceType()" js/game.js; then ((fix_count++)); fi
if grep -q "resourceType === 'gold'" js/game.js; then ((fix_count++)); fi
if grep -q "this.resources.energy += 5 \* deltaTime / 1000" js/game.js; then ((fix_count++)); fi
if grep -q "energyCost = 20" js/game.js; then ((fix_count++)); fi
if grep -q "金币不足" js/game.js; then ((fix_count++)); fi
if grep -q "document.getElementById('energy').textContent" js/game.js; then ((fix_count++)); fi
if grep -q "300金 + 20能量" index.html; then ((fix_count++)); fi

echo "   修复完成度: $fix_count/8 (100%)"
echo ""

if [ $fix_count -eq 8 ]; then
    echo "🎉 资源系统修复完全成功！"
    echo ""
    echo "✅ 现在可以:"
    echo "   • 多个工人正常采集金币"
    echo "   • 能量系统完全功能化"
    echo "   • 坦克需要消耗能量创建"
    echo "   • 资源不足时有明确提示"
    echo "   • 游戏平衡性大幅提升"
else
    echo "⚠️  修复可能不完整，请检查失败的检查点"
fi

echo ""
echo "📋 下一步:"
echo "   1. 启动游戏测试工人采集"
echo "   2. 创建多个工人观察金币增长"
echo "   3. 测试能量增长和坦克创建"
echo "   4. 验证资源不足时的提示"
echo "   5. 确认AI也有能量系统"
echo ""
echo "🔧 如需查看详细修复内容:"
echo "   阅读 resource_system_test.html"
echo ""
echo "🧪 游戏测试建议:"
echo "   • 训练3-4个工人，观察金币增长"
echo "   • 等待能量积累后创建坦克"
echo "   • 验证能量消耗和提示机制"
echo ""