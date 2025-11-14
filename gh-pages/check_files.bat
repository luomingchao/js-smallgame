@echo off
echo ========================================
echo AI Commander Game - 文件结构检查
echo ========================================
echo.

echo 📁 检查主要文件夹和文件:
echo.

if exist "index.html" (
    echo ✅ index.html - 游戏主页面
) else (
    echo ❌ index.html - 缺失
)

if exist "css" (
    echo ✅ css文件夹存在
    if exist "css\style.css" (
        echo    ✅ css\style.css - 样式文件
    ) else (
        echo    ❌ css\style.css - 缺失
    )
) else (
    echo ❌ css文件夹缺失
)

if exist "js" (
    echo ✅ js文件夹存在
    for %%f in (game.js ai.js ui.js utils.js) do (
        if exist "js\%%f" (
            echo    ✅ js\%%f
        ) else (
            echo    ❌ js\%%f - 缺失
        )
    )
) else (
    echo ❌ js文件夹缺失
)

if exist ".github" (
    echo ✅ .github文件夹存在 (GitHub Actions)
) else (
    echo ⚠️  .github文件夹缺失 (可选)
)

echo.
echo 📋 文档文件:
for %%f in (README.md DEPLOYMENT.md IMPROVEMENTS.md LICENSE) do (
    if exist "%%f" (
        echo ✅ %%f
    ) else (
        echo ❌ %%f - 缺失
    )
)

echo.
echo ========================================
echo 文件统计:
dir /b *.html *.css *.js *.md 2>nul | find /c /v "" > temp_count.txt
set /p file_count=<temp_count.txt
del temp_count.txt
echo 总共 %file_count% 个主要文件

echo.
echo ========================================
echo 🎯 准备状态检查完成！
echo 如果所有文件都有 ✅ 标记，说明可以上传到GitHub
echo ========================================
pause