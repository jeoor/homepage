# 字体压缩脚本

这些脚本可以帮助你在本地快速压缩字体文件，支持简体中文和自定义字符两种模式。

## 使用方法

### Windows 系统

在项目根目录下，使用命令提示符或 PowerShell 运行：

```batch
# 简体中文模式（默认）
scripts\compress-font.bat Pacifico-Regular.ttf

# 自定义字符模式（只保留指定的字符，体积最小）
scripts\compress-font.bat Pacifico-Regular.ttf "kayro.cn"
```

### Linux / macOS 系统

在项目根目录下，首先给脚本添加执行权限：

```bash
chmod +x scripts/compress-font.sh
```

然后运行：

```bash
# 简体中文模式（默认）
./scripts/compress-font.sh Pacifico-Regular.ttf

# 自定义字符模式（只保留指定的字符，体积最小）
./scripts/compress-font.sh Pacifico-Regular.ttf "kayro.cn"
```

## 字符集模式

### 1. 简体中文模式（默认）

保留所有简体中文字符，适合需要显示中文内容的场景。

```bash
./scripts/compress-font.sh Pacifico-Regular.ttf
```

### 2. 自定义字符模式（推荐用于 Logo）

**只保留你指定的字符**，文件体积最小。非常适合只需要显示固定文本的场景，比如网站 Logo。

```bash
# 示例：只保留 "kayro.cn" 这几个字符
./scripts/compress-font.sh Pacifico-Regular.ttf "kayro.cn"
```

对于你的 Logo "kayro.cn"，只需要保留这 8 个字符（k, a, y, r, o, ., c, n），文件大小可以从几百 KB 压缩到**几 KB**！

## 前置要求

### 必须安装

- **Python 3.7+**
  - Windows: https://www.python.org/downloads/
  - Linux: `sudo apt-get install python3 python3-pip`
  - macOS: `brew install python3`

### 脚本会自动安装

- `fonttools` - 字体处理工具
- `brotli` - 压缩算法（用于生成 woff2）

## 输出文件

运行脚本后，会在 `public/font/` 目录下生成以下文件：

- `{字体名}_sc.ttf/woff2` - 简体中文字体
- `{字体名}_custom.ttf/woff2` - 自定义字符字体（只包含你指定的字符）

## 示例

### 示例 1: 压缩 Logo 字体（推荐）

```bash
# Windows
scripts\compress-font.bat Pacifico-Regular.ttf "kayro.cn"

# Linux/macOS
./scripts/compress-font.sh Pacifico-Regular.ttf "kayro.cn"
```

输出：
```
🚀 开始压缩字体: Pacifico-Regular.ttf (自定义字符: kayro.cn)

📦 检查依赖...
📝 生成自定义字符集...
✅ 字符集生成完成: 8 个字符

🔧 压缩字体...
✅ 生成 TTF: Pacifico-Regular_custom.ttf

🗜️  生成 WOFF2 格式...
✅ 生成 WOFF2: Pacifico-Regular_custom.woff2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 压缩完成！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

模式: 自定义字符
字符: kayro.cn

原始文件: Pacifico-Regular.ttf
  💾 大小: 123.5 KiB

TTF 字体: Pacifico-Regular_custom.ttf
  💾 大小: 3.2 KiB (2.6%)

WOFF2 字体: Pacifico-Regular_custom.woff2
  💾 大小: 2.1 KiB (1.7%)

✨ 所有文件已保存到 public/font 目录
```

### 示例 2: 压缩为简体中文

```bash
# Windows
scripts\compress-font.bat Pacifico-Regular.ttf

# Linux/macOS
./scripts/compress-font.sh Pacifico-Regular.ttf
```

## 在项目中使用压缩后的字体

在 CSS 文件中引入压缩后的字体：

```css
@font-face {
  font-family: "Pacifico-Regular";
  font-display: swap;
  /* 优先使用 woff2，体积更小 */
  src: url("/font/Pacifico-Regular_custom.woff2") format("woff2"),
       /* TTF 作为后备，兼容性更好 */
       url("/font/Pacifico-Regular_custom.ttf") format("truetype");
}

/* 在 Logo 中使用 */
.logo {
  font-family: "Pacifico-Regular", sans-serif;
}
```

## 压缩效果对比

以 Pacifico-Regular.ttf (123.5 KiB) 为例：

| 模式 | 文件格式 | 大小 | 压缩比 | 适用场景 |
|------|---------|------|--------|---------|
| 原始 | TTF | 123.5 KiB | 100% | - |
| 简体中文 | TTF | 87.2 KiB | 70.6% | 需要显示中文内容 |
| 简体中文 | WOFF2 | 45.8 KiB | 37.1% | 网页显示中文 |
| **自定义 (kayro.cn)** | **TTF** | **3.2 KiB** | **2.6%** | **Logo 固定文本** |
| **自定义 (kayro.cn)** | **WOFF2** | **2.1 KiB** | **1.7%** | **Logo 固定文本（推荐）** |

💡 **建议**: 对于只显示固定文本的场景（如 Logo），使用自定义字符模式可以获得**最佳压缩效果**！

## 使用 GitHub Actions 自动压缩

如果不想在本地运行脚本，可以使用 GitHub Actions：

1. 前往仓库的 **Actions** 页面
2. 选择 **Compress Font** 工作流
3. 点击 **Run workflow**
4. 选择字符集模式：
   - **simplified_chinese**: 简体中文
   - **custom**: 自定义字符（需要输入字符）
   - **full**: 保留全部字符
5. 如果选择 custom 模式，在 "自定义字符" 框中输入 `kayro.cn`
6. 勾选 "是否创建 GitHub Release" 即可自动创建 Release 并打包成 ZIP
7. 完成后在 Releases 页面下载压缩包

详见：[../.github/workflows/README.md](../.github/workflows/README.md)

## 故障排除

### 问题：找不到 Python

**解决方案**：安装 Python 3.7 或更高版本
- Windows: https://www.python.org/downloads/
- 安装时勾选 "Add Python to PATH"

### 问题：pip install 失败

**解决方案**：手动安装依赖
```bash
pip install fonttools brotli
# 或使用国内镜像
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple fonttools brotli
```

### 问题：Linux 下脚本无法执行

**解决方案**：添加执行权限
```bash
chmod +x scripts/compress-font.sh
```

### 问题：下载 sc_unicode.txt 失败

**解决方案**：手动下载文件
- 访问：https://gist.githubusercontent.com/imaegoo/d64e5088b723c2e02c40985f55ff12db/raw/5ebd2ce49418c73459a9dfe050483409306a6c1d/sc_unicode.txt
- 保存为 `sc_unicode.txt` 到项目根目录

## 技术说明

### 去除繁体字

使用 `fonttools` 的 `pyftsubset` 工具，根据简体中文 Unicode 范围提取需要的字符，可以显著减小字体文件大小。

### WOFF2 压缩

WOFF2 是专为网页优化的字体格式，使用 Brotli 压缩算法，相比 TTF 格式可以减小 60-70% 的体积。

## 参考

- [fonttools 文档](https://fonttools.readthedocs.io/)
- [WOFF2 规范](https://www.w3.org/TR/WOFF2/)
- [虹墨空间站 - 中文字体压缩](https://www.imaegoo.com/2020/chinese-font-compress/)
