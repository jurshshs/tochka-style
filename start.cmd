@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "NODE_EXE="
where node.exe >nul 2>nul
if not errorlevel 1 set "NODE_EXE=node.exe"
if not defined NODE_EXE (
  for /d %%P in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_*") do (
    for /d %%D in ("%%~fP\node-v*-win-x64") do (
      if exist "%%~fD\node.exe" set "NODE_EXE=%%~fD\node.exe"
    )
  )
)
if not defined NODE_EXE (
  echo Node.js not found. Install Node.js LTS, then reopen this file.
  pause
  exit /b 1
)
if not exist "node_modules\next\dist\bin\next" (
  echo Run npm install first. See README.md.
  pause
  exit /b 1
)
if not exist ".next\BUILD_ID" (
  "%NODE_EXE%" node_modules\next\dist\bin\next build
  if errorlevel 1 exit /b 1
)
echo Open http://localhost:3000 in your browser. Ctrl+C stops the server.
"%NODE_EXE%" node_modules\next\dist\bin\next start
if errorlevel 1 pause
