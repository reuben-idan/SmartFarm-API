@echo off
echo Committing and pushing changes...

echo Checking git status...
git status

echo.
echo Adding all changes...
git add .

set /p commit_message="Enter commit message (or press Enter to use default): "
if "%commit_message%"=="" (
    set commit_message="chore: Update project files"
)

echo.
echo Committing changes with message: %commit_message%
git commit -m %commit_message%

if %ERRORLEVEL% NEQ 0 (
    echo Error committing changes. See above for details.
    pause
    exit /b 1
)

echo.
echo Pushing to remote repository...
git push

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Successfully pushed changes to remote repository.
) else (
    echo.
    echo Error pushing changes. Make sure you have the correct permissions.
)

pause
