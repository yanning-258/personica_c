# Personica AI Friend

A mobile iOS application that allows users to have voice conversations with an AI friend powered by multiple LLM models (ChatGLM-4 and Deepseek Chat).

## Features

- **Voice Conversations**: Record your voice and chat with an AI friend
- **Multiple AI Models**: Switch between ChatGLM-4 and Deepseek Chat
- **Speech-to-Text**: Convert your speech to text using MURF ASR API
- **AI Responses**: Get intelligent responses from multiple LLM models
- **Text-to-Speech**: Listen to AI responses in natural voice
- **Audio Settings**: Customize voice speed, pitch, and volume
- **Beautiful UI**: Modern, intuitive interface design
- **User Authentication**: Login and registration system
- **Error Handling**: Graceful error handling with user-friendly messages

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **ChatGLM GLM-4** for AI conversations
- **Deepseek Chat** for alternative AI conversations
- **MURF ASR** for speech-to-text
- **Expo AV** for audio recording and playback
- **Expo Speech** for text-to-speech
- **React Navigation** for screen navigation

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or physical iOS device
- Xcode (for iOS development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personica_c
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `env.example` to `.env`
   - Add your API keys:
   ```env
   # MURF API Configuration
   MURF_API_KEY=your_murf_api_key_here
   MURF_API_URL=https://api.murf.ai/v1

   # ChatGLM API Configuration
   CHATGLM_API_KEY=your_chatglm_api_key_here
   CHATGLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions

   # Deepseek API Configuration
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on iOS**
   ```bash
   npm run ios
   ```

## Project Structure

```
personica_c/
├── src/
│   ├── screens/
│   │   ├── LandingScreen.tsx      # Landing page
│   │   ├── LoginScreen.tsx        # Login form
│   │   ├── RegisterScreen.tsx     # Registration form
│   │   └── VoiceCallScreen.tsx    # Main voice call interface
│   ├── services/
│   │   ├── audioService.ts        # Audio recording/playback
│   │   ├── chatglmService.ts      # ChatGLM API integration (legacy)
│   │   └── llmService.ts          # Multi-model LLM service
│   └── components/
│       └── ModelSelector.tsx      # Model selection component
├── App.tsx                        # Main app component
├── package.json                   # Dependencies
├── app.json                      # Expo configuration
├── babel.config.js               # Babel configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Usage

1. **Landing Page**: Welcome screen with app introduction
2. **Login/Register**: Create an account or sign in
3. **Voice Call**: Main conversation interface
   - **Model Selection**: Tap "Switch" to choose between ChatGLM-4 and Deepseek Chat
   - **Recording**: Tap the microphone button to start recording
   - **Voice Input**: Speak your message (auto-stops after 30 seconds)
   - **AI Processing**: Wait for AI processing and response
   - **Voice Output**: Listen to AI friend's response
   - **Settings**: Adjust audio settings via the gear icon

## AI Models

### ChatGLM-4
- **Provider**: ChatGLM
- **Strengths**: Excellent Chinese language support, strong reasoning capabilities
- **Best for**: General conversations, emotional support, complex reasoning

### Deepseek Chat
- **Provider**: Deepseek
- **Strengths**: Advanced coding abilities, strong analytical thinking
- **Best for**: Technical discussions, problem-solving, analytical conversations

## Audio Settings

The app includes customizable audio settings:
- **Voice Speed**: Adjust how fast the AI speaks (0.5x - 2.0x)
- **Pitch**: Change the voice pitch (0.5x - 2.0x)
- **Volume**: Control the output volume (0.0 - 1.0)

## API Integration

### Speech-to-Text (MURF ASR)
- **Provider**: MURF AI
- **Features**: Real-time speech recognition with high accuracy
- **Fallback**: Graceful fallback to simulated responses if API fails

### Multi-Model LLM Service
- **Unified Interface**: Single service for multiple AI models
- **Model Switching**: Seamless switching between different AI models
- **Error Handling**: Comprehensive error handling for all models
- **Conversation Management**: Maintains separate conversation history

## Error Handling

The app includes comprehensive error handling:
- **Network Errors**: User-friendly messages for connection issues
- **API Errors**: Specific error messages for different HTTP status codes
- **Permission Errors**: Clear guidance for microphone permissions
- **Graceful Degradation**: App continues working even when services fail
- **Fallback Responses**: Contextual responses when APIs are unavailable

## Development Notes

### Current Features
- ✅ Multi-model AI support
- ✅ Real speech-to-text with MURF ASR
- ✅ Comprehensive error handling
- ✅ Audio customization
- ✅ Modern UI with model selection

### Future Enhancements
- User authentication backend
- Conversation history persistence
- Voice cloning for AI responses
- Push notifications for AI friend availability
- Additional AI model integrations

## Troubleshooting

### Common Issues

1. **Audio permissions not granted**
   - Go to iOS Settings > Privacy & Security > Microphone
   - Enable microphone access for the app

2. **API key not working**
   - Verify your API keys are correct in the service files
   - Check that the API keys have proper permissions
   - Ensure the API endpoints are accessible

3. **Model switching issues**
   - The app automatically clears conversation when switching models
   - Each model maintains its own conversation context

4. **Build errors**
   - Clear Metro cache: `npx expo start --clear`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository. 