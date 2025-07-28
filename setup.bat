@echo off
echo 🚀 Setting up Personica AI Friend App...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Create .env file from example
if not exist .env (
    echo 🔧 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please update the .env file with your ChatGLM API key
) else (
    echo ✅ .env file already exists
)

REM Check if Expo CLI is installed
expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📱 Installing Expo CLI...
    npm install -g @expo/cli
)

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Update the .env file with your ChatGLM API key
echo 2. Run 'npm start' to start the development server
echo 3. Run 'npm run ios' to launch on iOS simulator
echo.
echo For more information, see README.md
pause 