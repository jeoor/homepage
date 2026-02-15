#!/bin/bash

# 字体压缩脚本
# 使用方法: ./compress-font.sh <字体文件名> [自定义字符]

set -e

# 检查参数
if [ -z "$1" ]; then
    echo "❌ 错误: 请提供字体文件名"
    echo "使用方法: ./compress-font.sh <字体文件名> [自定义字符]"
    echo ""
    echo "示例:"
    echo "  ./compress-font.sh Pacifico-Regular.ttf              # 简体中文"
    echo "  ./compress-font.sh Pacifico-Regular.ttf \"kayro.cn\"   # 自定义字符"
    exit 1
fi

FONT_FILE=$1
CUSTOM_CHARS=$2
FONT_DIR="public/font"
FONT_PATH="$FONT_DIR/$FONT_FILE"

# 检查字体文件是否存在
if [ ! -f "$FONT_PATH" ]; then
    echo "❌ 错误: 找不到字体文件 $FONT_PATH"
    exit 1
fi

# 获取文件名（不含扩展名）
BASENAME="${FONT_FILE%.ttf}"

if [ -n "$CUSTOM_CHARS" ]; then
    echo "🚀 开始压缩字体: $FONT_FILE (自定义字符: $CUSTOM_CHARS)"
    MODE="custom"
    SUFFIX="_custom"
else
    echo "🚀 开始压缩字体: $FONT_FILE (简体中文)"
    MODE="simplified_chinese"
    SUFFIX="_sc"
fi
echo ""

# 检查是否安装了 Python 和 pip
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ 错误: 未找到 Python，请先安装 Python 3"
    exit 1
fi

# 使用 python3 或 python
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

# 安装 fonttools（如果尚未安装）
echo "📦 检查依赖..."
$PYTHON_CMD -m pip install fonttools brotli -q 2>/dev/null || {
    echo "⚠️  无法自动安装 fonttools，请手动运行: pip install fonttools brotli"
}

# 准备字符集文件
if [ "$MODE" = "custom" ]; then
    # 生成自定义字符集
    echo "📝 生成自定义字符集..."
    $PYTHON_CMD << EOF
chars = "$CUSTOM_CHARS"
with open("custom_chars.txt", "w") as f:
    for char in chars:
        f.write(f"U+{ord(char):04X}\n")
print(f"✅ 字符集生成完成: {len(chars)} 个字符")
EOF
    CHARSET_FILE="custom_chars.txt"
else
    # 下载简体中文 Unicode 列表
    if [ ! -f "sc_unicode.txt" ]; then
        echo "📥 下载简体中文 Unicode 列表..."
        curl -s -o sc_unicode.txt https://gist.githubusercontent.com/imaegoo/d64e5088b723c2e02c40985f55ff12db/raw/5ebd2ce49418c73459a9dfe050483409306a6c1d/sc_unicode.txt
        if [ $? -ne 0 ]; then
            echo "❌ 下载失败，请检查网络连接"
            exit 1
        fi
        echo "✅ Unicode 列表下载完成"
    fi
    CHARSET_FILE="sc_unicode.txt"
fi

# 获取原始文件大小
ORIGINAL_SIZE=$(stat -f%z "$FONT_PATH" 2>/dev/null || stat -c%s "$FONT_PATH" 2>/dev/null || wc -c < "$FONT_PATH")

echo ""
echo "🔧 压缩字体..."
cd "$FONT_DIR"
$PYTHON_CMD -m fontTools.subset "$FONT_FILE" \
    --unicodes-file="../../$CHARSET_FILE" \
    --output-file="${BASENAME}${SUFFIX}.ttf"

if [ $? -eq 0 ]; then
    SC_SIZE=$(stat -f%z "${BASENAME}${SUFFIX}.ttf" 2>/dev/null || stat -c%s "${BASENAME}${SUFFIX}.ttf" 2>/dev/null || wc -c < "${BASENAME}${SUFFIX}.ttf")
    echo "✅ 生成 TTF: ${BASENAME}${SUFFIX}.ttf"
else
    echo "❌ 生成字体失败"
    cd ../..
    exit 1
fi

echo ""
echo "🗜️  生成 WOFF2 格式..."
$PYTHON_CMD -m fontTools.subset "$FONT_FILE" \
    --unicodes-file="../../$CHARSET_FILE" \
    --output-file="${BASENAME}${SUFFIX}.woff2" \
    --flavor=woff2

if [ $? -eq 0 ]; then
    WOFF2_SIZE=$(stat -f%z "${BASENAME}${SUFFIX}.woff2" 2>/dev/null || stat -c%s "${BASENAME}${SUFFIX}.woff2" 2>/dev/null || wc -c < "${BASENAME}${SUFFIX}.woff2")
    echo "✅ 生成 WOFF2: ${BASENAME}${SUFFIX}.woff2"
else
    echo "⚠️  生成 WOFF2 失败（可能需要安装 brotli）"
fi

cd ../..

# 显示结果
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 压缩完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ "$MODE" = "custom" ]; then
    echo "模式: 自定义字符"
    echo "字符: $CUSTOM_CHARS"
else
    echo "模式: 简体中文"
fi
echo ""
echo "原始文件:"
echo "  📄 $FONT_FILE"
echo "  💾 大小: $(numfmt --to=iec-i --suffix=B $ORIGINAL_SIZE 2>/dev/null || echo "$ORIGINAL_SIZE bytes")"
echo ""

if [ -f "$FONT_DIR/${BASENAME}${SUFFIX}.ttf" ]; then
    SC_RATIO=$(echo "scale=1; $SC_SIZE * 100 / $ORIGINAL_SIZE" | bc 2>/dev/null || echo "N/A")
    echo "TTF 字体:"
    echo "  📄 ${BASENAME}${SUFFIX}.ttf"
    echo "  💾 大小: $(numfmt --to=iec-i --suffix=B $SC_SIZE 2>/dev/null || echo "$SC_SIZE bytes") (${SC_RATIO}%)"
    echo ""
fi

if [ -f "$FONT_DIR/${BASENAME}${SUFFIX}.woff2" ]; then
    WOFF2_RATIO=$(echo "scale=1; $WOFF2_SIZE * 100 / $ORIGINAL_SIZE" | bc 2>/dev/null || echo "N/A")
    echo "WOFF2 字体:"
    echo "  📄 ${BASENAME}${SUFFIX}.woff2"
    echo "  💾 大小: $(numfmt --to=iec-i --suffix=B $WOFF2_SIZE 2>/dev/null || echo "$WOFF2_SIZE bytes") (${WOFF2_RATIO}%)"
    echo ""
fi

echo "✨ 所有文件已保存到 $FONT_DIR 目录"
echo ""
