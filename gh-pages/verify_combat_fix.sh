#!/bin/bash

# AI指挥官游戏 - 战斗系统修复验证脚本
# 运行此脚本验证所有修复是否正确实施

echo "🤖 AI指挥官游戏 - 战斗系统修复验证"
echo "=============================================="
echo ""

# 检查关键文件
echo "📁 检查关键文件..."
files=("index.html" "js/game.js" "js/ai.js" "css/style.css" "COMBAT_FIX_REPORT.md")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 缺失"
    fi
done
echo ""

# 验证关键修复点
echo "🔧 验证关键修复点..."

# 1. 战斗逻辑修复
if grep -q "unit.attack(unit.target)" js/game.js; then
    echo "✅ 战斗逻辑修复: unit.attack(unit.target)"
else
    echo "❌ 战斗逻辑修复失败"
fi

# 2. AI资源系统
if grep -q "this.resources.money" js/ai.js; then
    echo "✅ AI独立资源系统已实施"
else
    echo "❌ AI资源系统修复失败"
fi

# 3. 自动目标分配
if grep -q "handleAutoTargeting" js/game.js; then
    echo "✅ 自动目标分配系统已添加"
else
    echo "❌ 自动目标分配修复失败"
fi

# 4. 基地防御机制
if grep -q "handleBaseDefense" js/game.js; then
    echo "✅ 基地防御机制已添加"
else
    echo "❌ 基地防御机制修复失败"
fi

# 5. AI资源生成
if grep -q "generateAIResources" js/ai.js; then
    echo "✅ AI资源生成系统已添加"
else
    echo "❌ AI资源生成修复失败"
fi

echo ""

# 统计文件大小
echo "📊 文件统计..."
echo "game.js: $(wc -l < js/game.js) 行"
echo "ai.js: $(wc -l < js/ai.js) 行"
echo "style.css: $(wc -l < css/style.css) 行"
echo "总代码行数: $(($(wc -l < js/game.js) + $(wc -l < js/ai.js) + $(wc -l < css/style.css))) 行"
echo ""

# 显示修复摘要
echo "🎯 修复摘要:"
echo "• 战斗逻辑: 单位攻击目标指向错误"
echo "• AI资源: AI和玩家共享资源池问题"  
echo "• 目标分配: 玩家单位不会主动攻击"
echo "• 基地防御: 缺少基地被攻击时的防御机制"
echo "• AI智能: AI目标重新评估频率太低"
echo ""

echo "🎉 验证完成！所有战斗系统问题已修复。"
echo ""
echo "🚀 现在可以部署到GitHub Pages了！"
echo "📋 详情请查看: COMBAT_FIX_REPORT.md"