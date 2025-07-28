#!/bin/bash

echo "🚀 Setting up Personica AI Friend App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file from example
if [ ! -f .env ]; then
    echo "🔧 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update the .env file with your ChatGLM API key"
else
    echo "✅ .env file already exists"
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI..."
    npm install -g @expo/cli
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your ChatGLM API key"
echo "2. Run 'npm start' to start the development server"
echo "3. Run 'npm run ios' to launch on iOS simulator"
echo ""
echo "For more information, see README.md" 