@echo off
setlocal EnableExtensions

cd /d "%~dp0"
set "ROOT=%CD%"
set "REPOS_FILE=%ROOT%\repos.txt"
set "TEMP_DIR=%ROOT%\_repo_sync_tmp"
set "COMMIT_MSG=chore: sync repos"
set "CLONE_RETRIES=3"
set "RETRY_WAIT_SECONDS=5"
set "GIT_TERMINAL_PROMPT=0"

if not exist "%REPOS_FILE%" (
    echo [ERROR] repos.txt not found: "%REPOS_FILE%"
    exit /b 1
)

where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] git not found in PATH
    exit /b 1
)

git -C "%ROOT%" rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
    echo [ERROR] current directory is not a git repo root: "%ROOT%"
    exit /b 1
)

if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%" >nul 2>nul

echo [INFO] syncing repositories from repos.txt

for /f "usebackq tokens=* delims=" %%R in ("%REPOS_FILE%") do (
    call :process_repo "%%R"
    if errorlevel 1 goto :fail
)

echo [INFO] cleaning temp directory
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"

echo [INFO] committing and pushing root repository
git -C "%ROOT%" add -A
if errorlevel 1 (
    echo [ERROR] git add failed
    goto :fail
)

git -C "%ROOT%" diff --cached --quiet
if errorlevel 1 (
    git -C "%ROOT%" commit -m "%COMMIT_MSG%"
    if errorlevel 1 (
        echo [ERROR] git commit failed
        goto :fail
    )
) else (
    echo [INFO] no staged changes to commit
)

git -C "%ROOT%" push origin HEAD
if errorlevel 1 (
    echo [ERROR] git push failed
    goto :fail
)

echo [INFO] done
exit /b 0

:process_repo
set "RAW_URL=%~1"
if "%RAW_URL%"=="" exit /b 0

set "REPO_URL=%RAW_URL%"
for %%N in ("%REPO_URL%") do set "REPO_NAME=%%~nN"
if /i "%REPO_NAME:~-4%"==".git" set "REPO_NAME=%REPO_NAME:~0,-4%"

set "CLONE_DIR=%TEMP_DIR%\%REPO_NAME%"
set "TARGET_DIR=%ROOT%\%REPO_NAME%"
set "TARGET_PREFIX=%TARGET_DIR:\=/%/"

call :clone_with_retry "%REPO_URL%" "%CLONE_DIR%"
if errorlevel 1 exit /b 1

echo [INFO] replacing %TARGET_DIR%
if exist "%TARGET_DIR%" rmdir /s /q "%TARGET_DIR%"
mkdir "%TARGET_DIR%" >nul 2>nul

echo [INFO] exporting tracked files to %TARGET_DIR%
git -C "%CLONE_DIR%" checkout-index -a -f --prefix="%TARGET_PREFIX%/"
if errorlevel 1 (
    echo [ERROR] export failed: %REPO_NAME%
    exit /b 1
)

set "RAW_URL="
set "REPO_URL="
set "REPO_NAME="
set "CLONE_DIR="
set "TARGET_DIR="
set "TARGET_PREFIX="
exit /b 0

:clone_with_retry
set "TRY_URL=%~1"
set "TRY_DIR=%~2"
set /a TRY_COUNT=1

:clone_retry_loop
if exist "%TRY_DIR%" rmdir /s /q "%TRY_DIR%"
echo [INFO] clone attempt %TRY_COUNT%/%CLONE_RETRIES%: %TRY_URL%
git clone --depth 1 "%TRY_URL%" "%TRY_DIR%" <nul
if not errorlevel 1 (
    set "TRY_URL="
    set "TRY_DIR="
    set "TRY_COUNT="
    exit /b 0
)

if %TRY_COUNT% GEQ %CLONE_RETRIES% (
    echo [ERROR] clone failed after %CLONE_RETRIES% attempts: %TRY_URL%
    set "TRY_URL="
    set "TRY_DIR="
    set "TRY_COUNT="
    exit /b 1
)

echo [WARN] clone failed, retrying in %RETRY_WAIT_SECONDS%s...
timeout /t %RETRY_WAIT_SECONDS% /nobreak >nul
set /a TRY_COUNT+=1
goto :clone_retry_loop

:fail
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
exit /b 1
