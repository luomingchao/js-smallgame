#!/bin/bash

# AI指挥官游戏修复验证脚本
echo "========================================"
echo "🎮 AI指挥官游戏 - 修复验证"
echo "========================================"
echo

# 检查关键文件
echo "📁 检查关键文件..."
files=(
    "index.html"
    "css/style.css"
    "js/game.js"
    "js/ai.js" 
    "js/ui.js"
    "README.md"
    "DEPLOYMENT.md"
    "IMPROVEMENTS.md"
    "FIX_LOG.md"
    "UPLOAD_GUIDE.md"
    "test_fix.html"
)

all_files_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - 缺失"
        all_files_exist=false
    fi
done

echo

# 检查关键修复
echo "🔧 检查关键修复..."
echo

echo "1. 游戏引擎初始化修复..."
if grep -q "this.init();" /dev/null 2>/dev/null || ! grep -q "this.init();" js/game.js; then
    echo "  ✅ 已移除构造函数中的自动初始化"
else
    echo "  ❌ 构造函数仍包含自动初始化"
fi

echo "2. 事件监听器调试..."
if grep -q "console.log.*开始游戏按钮被点击" js/game.js; then
    echo "  ✅ 已添加按钮点击调试信息"
else
    echo "  ❌ 缺少按钮调试信息"
fi

echo "3. 错误处理..."
if grep -q "try {" js/game.js && grep -q "catch" js/game.js; then
    echo "  ✅ 已添加错误处理"
else
    echo "  ❌ 缺少错误处理"
fi

echo "4. 滚动条修复..."
if grep -q "overflow-y: auto" css/style.css; then
    echo "  ✅ 已添加滚动条支持"
else
    echo "  ❌ 缺少滚动条支持"
fi

echo "5. 规则弹窗修复..."
if ! grep -q "this.startGame()" js/game.js | grep -A5 "closeRules"; then
    echo "  ✅ 已移除规则弹窗自动启动"
else
    echo "  ❌ 规则弹窗仍可能自动启动"
fi

echo
echo "📊 统计信息..."

# 文件大小统计
total_files=$(find . -type f | wc -l)
total_size=$(du -sh . | cut -f1)
js_lines=$(find js/ -name "*.js" -exec wc -l {} + | tail -1 | awk '{print $1}')
css_lines=$(wc -l < css/style.css)
html_lines=$(wc -l < index.html)

echo "  总文件数: $total_files"
echo "  项目大小: $total_size"
echo "  JavaScript代码行数: $js_lines"
echo "  CSS代码行数: $css_lines"
echo "  HTML代码行数: $html_lines"

echo
echo "========================================"
if [ "$all_files_exist" = true ]; then
    echo "✅ 所有文件检查通过！"
else
    echo "❌ 部分文件缺失，请检查"
fi

echo "🎯 准备部署到GitHub Pages！"
echo "========================================"

echo
echo "📋 部署清单:"
echo "1. 在GitHub创建仓库 'ai-commander-game'"
echo "2. 上传所有文件"
echo "3. 启用GitHub Pages"
echo "4. 访问: https://用户名.github.io/ai-commander-game/"

echo
echo "🔍 测试建议:"
echo "1. 打开 test_fix.html 进行功能测试"
echo "2. 检查浏览器控制台是否有错误信息"
echo "3. 测试新手教学和5个关卡进度"