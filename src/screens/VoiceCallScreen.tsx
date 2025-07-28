import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
// Using text-based icons instead of Ionicons for consistency
import AudioService from '../services/audioService';
import LLMService, { LLMModel } from '../services/llmService';
import ModelSelector from '../components/ModelSelector';

interface Props {
  navigation: any;
}

const VoiceCallScreen: React.FC<Props> = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [currentModel, setCurrentModel] = useState<LLMModel>('glm-4');
  const [audioSettings, setAudioSettings] = useState({
    voice: 'en-US',
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
  });

  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize conversation with AI greeting
    const initialMessage = "Hi! I'm your AI friend. I'm here to listen and chat with you about anything on your mind. How are you feeling today?";
    setConversationHistory([{ role: 'assistant', content: initialMessage }]);
    
    // Speak the initial greeting
    handleSpeakText(initialMessage);

    return () => {
      AudioService.cleanup();
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      await AudioService.startSpeechToText();
      
      // Auto-stop recording after 30 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        handleStopRecording();
      }, 30000);
    } catch (error: any) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      
      // Add error as AI friend response instead of showing alert
      const errorMessage = "I'm having trouble starting the recording. Please check your microphone permissions and try again.";
      setConversationHistory(prev => [...prev, { role: 'assistant', content: errorMessage }]);
      await handleSpeakText(errorMessage);
    }
  };

  const handleStopRecording = async () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    if (!isRecording) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      // Get the recognized text from speech-to-text
      const userMessage = await AudioService.stopSpeechToText();
      
      if (!userMessage || userMessage.trim() === '') {
        const noSpeechMessage = "I didn't hear anything. Could you please try speaking again?";
        setConversationHistory(prev => [...prev, { role: 'assistant', content: noSpeechMessage }]);
        await handleSpeakText(noSpeechMessage);
        setIsProcessing(false);
        return;
      }
      
      // Add user message to conversation
      const updatedHistory = [...conversationHistory, { role: 'user', content: userMessage }];
      setConversationHistory(updatedHistory);
      
      // Get AI response (this will handle errors gracefully now)
      const aiResponse = await LLMService.sendMessage(userMessage);
      
      // Add AI response to conversation
      setConversationHistory([...updatedHistory, { role: 'assistant', content: aiResponse }]);
      
      // Speak the AI response
      await handleSpeakText(aiResponse);
      
    } catch (error: any) {
      console.error('Error in voice processing:', error);
      
      // Add error as AI friend response
      const errorMessage = "I'm having some technical difficulties right now. Let's try again in a moment.";
      setConversationHistory(prev => [...prev, { role: 'assistant', content: errorMessage }]);
      await handleSpeakText(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpeakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      await AudioService.speakText(text);
    } catch (error: any) {
      console.error('Error speaking text:', error);
      // Don't show alert, just log the error and continue
      // The text is already displayed in the chat, so user can read it
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleStopSpeaking = () => {
    AudioService.stopSpeaking();
    setIsSpeaking(false);
  };

  const updateAudioSettings = (key: string, value: number | string) => {
    const newSettings = { ...audioSettings, [key]: value };
    setAudioSettings(newSettings);
    AudioService.updateAudioSettings(newSettings);
  };

  const handleModelSelect = (model: LLMModel) => {
    console.log('VoiceCallScreen: Model selected:', model);
    setCurrentModel(model);
    // Clear conversation when switching models
    LLMService.clearConversation();
    const newGreeting = "Hi! I'm your AI friend. I'm here to listen and chat with you about anything on your mind. How are you feeling today?";
    setConversationHistory([{ role: 'assistant', content: newGreeting }]);
    handleSpeakText(newGreeting);
  };

  return (
    <View style={styles.container}>
      {/* Header with Model Selector */}
      <View style={styles.header}>
        <View style={styles.modelInfo}>
          <Text style={styles.modelLabel}>AI Model:</Text>
          <Text style={styles.modelName}>{LLMService.getModelDisplayName(currentModel)}</Text>
        </View>
        <TouchableOpacity
          style={styles.modelButton}
          onPress={() => {
            console.log('Switch button pressed, setting showModelSelector to true');
            setShowModelSelector(true);
          }}
        >
          <Text style={styles.modelButtonIcon}>🔄</Text>
          <Text style={styles.modelButtonText}>Switch</Text>
        </TouchableOpacity>
      </View>

      {/* Direct Model Selection Buttons - Temporary for debugging */}
      <View style={styles.directModelSelection}>
        <Text style={styles.directModelTitle}>Quick Model Switch:</Text>
        <View style={styles.directModelButtons}>
          <TouchableOpacity
            style={[
              styles.directModelButton,
              currentModel === 'glm-4' && styles.directModelButtonActive
            ]}
            onPress={() => handleModelSelect('glm-4')}
          >
            <Text style={[
              styles.directModelButtonText,
              currentModel === 'glm-4' && { color: '#ffffff' }
            ]}>🤖 ChatGLM-4</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.directModelButton,
              currentModel === 'deepseek-chat' && styles.directModelButtonActive
            ]}
            onPress={() => handleModelSelect('deepseek-chat')}
          >
            <Text style={[
              styles.directModelButtonText,
              currentModel === 'deepseek-chat' && { color: '#ffffff' }
            ]}>💻 Deepseek Chat</Text>
          </TouchableOpacity>
        </View>
        
        {/* Test Deepseek Connection Button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={async () => {
            console.log('Testing Deepseek connection...');
            const testResult = await LLMService.testDeepseekConnection();
            console.log('Test result:', testResult);
            // Add test result to conversation
            setConversationHistory(prev => [...prev, { role: 'assistant', content: testResult }]);
          }}
        >
          <Text style={styles.testButtonText}>🧪 Test Deepseek API</Text>
        </TouchableOpacity>
      </View>

      {/* Conversation History */}
      <ScrollView style={styles.conversationContainer} showsVerticalScrollIndicator={false}>
        {conversationHistory.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.role === 'user' ? styles.userMessage : styles.aiMessage,
            ]}
          >
            <Text style={styles.messageText}>{message.content}</Text>
          </View>
        ))}
        {isProcessing && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <Text style={styles.messageText}>Thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Recording Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordingButton,
            isProcessing && styles.disabledButton,
          ]}
          onPress={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isProcessing}
        >
          <Text style={styles.recordButtonIcon}>
            {isRecording ? '⏹️' : '🎤'}
          </Text>
        </TouchableOpacity>

        {isSpeaking && (
          <TouchableOpacity
            style={styles.stopSpeakingButton}
            onPress={handleStopSpeaking}
          >
            <Text style={styles.stopSpeakingIcon}>⏹️</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Audio Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Audio Settings</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Voice Speed</Text>
              <TextInput
                style={styles.settingInput}
                value={audioSettings.rate.toString()}
                onChangeText={(text) => updateAudioSettings('rate', parseFloat(text) || 0.9)}
                keyboardType="numeric"
                placeholder="0.9"
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Pitch</Text>
              <TextInput
                style={styles.settingInput}
                value={audioSettings.pitch.toString()}
                onChangeText={(text) => updateAudioSettings('pitch', parseFloat(text) || 1.0)}
                keyboardType="numeric"
                placeholder="1.0"
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Volume</Text>
              <TextInput
                style={styles.settingInput}
                value={audioSettings.volume.toString()}
                onChangeText={(text) => updateAudioSettings('volume', parseFloat(text) || 1.0)}
                keyboardType="numeric"
                placeholder="1.0"
              />
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Model Selector Modal */}
      <ModelSelector
        visible={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        onModelSelect={handleModelSelect}
        currentModel={currentModel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelLabel: {
    fontSize: 16,
    color: '#374151',
    marginRight: 5,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  modelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 5,
  },
  modelButtonIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  conversationContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  messageContainer: {
    marginBottom: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#667eea',
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 22,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  recordButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recordingButton: {
    backgroundColor: '#ef4444',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  recordButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  recordButtonIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  stopSpeakingButton: {
    padding: 8,
  },
  stopSpeakingIcon: {
    fontSize: 20,
    color: '#667eea',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  settingInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  closeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  directModelSelection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  directModelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  directModelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  directModelButton: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  directModelButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  directModelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  testButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
    alignSelf: 'center',
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default VoiceCallScreen; 