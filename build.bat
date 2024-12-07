@echo off
setlocal enabledelayedexpansion

:: Чтение файла index.html и создание build.html
set "indexFile=index.html"
set "buildFile=build.html"
set "tempFile=temp.html"
set "logFile=build.log"

if exist %buildFile% del %buildFile%
if exist %tempFile% del %tempFile%
if exist %logFile% del %logFile%

:: Запись начала логирования
echo Build started at %date% %time% >> %logFile%
echo Reading %indexFile% >> %logFile%

:: Чтение index.html и запись во временный файл temp.html
(for /f "delims=" %%i in (%indexFile%) do (
    set "line=%%i"
    echo !line!>> %tempFile%
)) || (
    echo Error reading index.html >> %logFile%
    echo Error reading index.html
    pause
    exit /b 1
)

echo Finished reading %indexFile% >> %logFile%
echo Processing links to styles and scripts >> %logFile%

:: Обработка ссылок на стили и скрипты
(for /f "delims=" %%i in (%tempFile%) do (
    set "line=%%i"
    call :processLine
)) > %buildFile%

:: Удаление временного файла
del %tempFile%

echo Finished processing links >> %logFile%
echo -------------------------- >> %logFile%
echo Build complete. Output: %buildFile% >> %logFile%
echo -------------------------- >> %logFile%
echo Processed links to styles and scripts: >> %logFile%
type %logFile%

:: Пауза, чтобы окно не закрывалось автоматически
pause
exit /b 0

:processLine
setlocal enabledelayedexpansion

:: Пропуск закомментированных строк
echo !line! | findstr /r "^<!--" >nul
if not errorlevel 1 (
    echo Skipping commented line >> %logFile%
    echo !line! >> %buildFile%
    endlocal
    exit /b 0
)

:: Обработка ссылок на стили
echo !line! | findstr /r "<link[^>]*href=\"[^\"]*\"" >nul
if not errorlevel 1 (
    for /f "tokens=2 delims== " %%a in ("!line!") do (
        set "filePath=%%~a"
        set "filePath=!filePath:\"=!"
        echo Detected link to CSS: !filePath! >> %logFile%
        if exist !filePath! (
            echo Processing CSS file: !filePath! >> %logFile%
            echo <!-- Inline CSS from !filePath! --> >> %buildFile%
            for /f "delims=" %%b in (!filePath!) do (
                echo %%b >> %buildFile%
            )
        ) else (
            echo CSS file not found: !filePath! >> %logFile%
            echo !line! >> %buildFile%
        )
    )
    endlocal
    exit /b 0
)

:: Обработка ссылок на скрипты
echo !line! | findstr /r "<script[^>]*src=\"[^\"]*\"" >nul
if not errorlevel 1 (
    for /f "tokens=2 delims== " %%a in ("!line!") do (
        set "filePath=%%~a"
        set "filePath=!filePath:\"=!"
        echo Detected link to JavaScript: !filePath! >> %logFile%
        if exist !filePath! (
            echo Processing JavaScript file: !filePath! >> %logFile%
            echo <!-- Inline JavaScript from !filePath! --> >> %buildFile%
            for /f "delims=" %%b in (!filePath!) do (
                echo %%b >> %buildFile%
            )
        ) else (
            echo JavaScript file not found: !filePath! >> %logFile%
            echo !line! >> %buildFile%
        )
    )
    endlocal
    exit /b 0
)

:: Запись строки без изменений, если это не ссылка на стиль или скрипт
echo Writing line to build file >> %logFile%
echo !line! >> %buildFile%
endlocal
exit /b 0
