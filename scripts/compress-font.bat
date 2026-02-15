@echo off
REM Font compression script (Windows)
REM Usage: compress-font.bat <font file> [custom chars]

setlocal EnableExtensions DisableDelayedExpansion

if "%~1"=="" (
    echo ERROR: Font file is required.
    echo Usage: compress-font.bat ^<font file^> [custom chars]
    echo Example:
    echo   compress-font.bat Pacifico-Regular.ttf
    echo   compress-font.bat Pacifico-Regular.ttf "kayro.cn"
    exit /b 1
)

set "FONT_FILE=%~1"
set "CUSTOM_CHARS=%~2"
set "FONT_DIR=public\font"
set "FONT_PATH=%FONT_DIR%\%FONT_FILE%"

if not exist "%FONT_PATH%" (
    echo ERROR: Font file not found: %FONT_PATH%
    exit /b 1
)

REM Base name without extension
set "BASENAME=%~n1"

if not "%CUSTOM_CHARS%"=="" (
    echo Start compress: %FONT_FILE%
    echo Custom chars: %CUSTOM_CHARS%
    set "MODE=custom"
    set "SUFFIX=_custom"
) else (
    echo Start compress: %FONT_FILE%
    echo Charset: simplified chinese
    set "MODE=simplified_chinese"
    set "SUFFIX=_sc"
)
echo.

REM Check Python
where python >nul 2>nul
if errorlevel 1 (
    echo ERROR: Python not found. Install Python 3.
    echo https://www.python.org/downloads/
    exit /b 1
)

REM Install dependencies
echo Checking dependencies...
python -m pip install fonttools brotli -q >nul 2>nul
if errorlevel 1 (
    echo WARN: pip install failed. Run: pip install fonttools brotli
)

REM Prepare charset file
if /i "%MODE%"=="custom" (
    echo Generating custom charset...
    python -c "chars = r'%CUSTOM_CHARS%'; f = open('custom_chars.txt','w',encoding='utf-8'); [f.write(f'U+{ord(c):04X}\n') for c in chars]; f.close(); print(f'Charset size: {len(chars)}')"
    if errorlevel 1 (
        echo ERROR: Failed to generate custom charset.
        exit /b 1
    )
    set "CHARSET_FILE=custom_chars.txt"
) else (
    if not exist "sc_unicode.txt" (
        echo Downloading simplified Chinese unicode list...
        powershell -Command "Invoke-WebRequest -Uri 'https://gist.githubusercontent.com/imaegoo/d64e5088b723c2e02c40985f55ff12db/raw/5ebd2ce49418c73459a9dfe050483409306a6c1d/sc_unicode.txt' -OutFile 'sc_unicode.txt'"
        if errorlevel 1 (
            echo ERROR: Download failed.
            exit /b 1
        )
    )
    set "CHARSET_FILE=sc_unicode.txt"
)

echo.
echo Subsetting font...
cd "%FONT_DIR%"
python -m fontTools.subset "%FONT_FILE%" --unicodes-file=..\..\%CHARSET_FILE% --output-file="%BASENAME%%SUFFIX%.ttf"
if errorlevel 1 (
    echo ERROR: Failed to generate TTF.
    cd ..\..
    exit /b 1
) else (
    echo Generated: %BASENAME%%SUFFIX%.ttf
)

echo.
echo Generating WOFF2...
python -m fontTools.subset "%FONT_FILE%" --unicodes-file=..\..\%CHARSET_FILE% --output-file="%BASENAME%%SUFFIX%.woff2" --flavor=woff2
if errorlevel 1 (
    echo WARN: WOFF2 generation failed. Install brotli.
) else (
    echo Generated: %BASENAME%%SUFFIX%.woff2
)

cd ..\..

REM Result
echo.
echo ===== Result =====
if /i "%MODE%"=="custom" (
    echo Mode: custom
    echo Chars: %CUSTOM_CHARS%
) else (
    echo Mode: simplified_chinese
)
echo Source: %FONT_FILE%
if exist "%FONT_DIR%\%BASENAME%%SUFFIX%.ttf" echo TTF: %BASENAME%%SUFFIX%.ttf
if exist "%FONT_DIR%\%BASENAME%%SUFFIX%.woff2" echo WOFF2: %BASENAME%%SUFFIX%.woff2
echo Output dir: %FONT_DIR%
echo.

endlocal
