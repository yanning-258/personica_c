import axios from 'axios';

// Deepseek API Configuration
const DEEPSEEK_API_KEY = 'sk-119a0923ecef486493a716d78adf2ff7';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export type LLMModel = 'deepseek-chat';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class LLMService {
  private currentModel: LLMModel = 'deepseek-chat';
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    // Initialize with a friendly AI personality
    this.conversationHistory.push({
      role: 'assistant',
      content: 'Hi! I\'m your AI friend. I\'m here to listen and chat with you about anything on your mind. How are you feeling today?'
    });
  }

  setModel(model: LLMModel): void {
    this.currentModel = model;
    console.log(`Switched to model: ${model}`);
  }

  getCurrentModel(): LLMModel {
    return this.currentModel;
  }

  getModelDisplayName(model: LLMModel): string {
    switch (model) {
      case 'deepseek-chat':
        return 'Deepseek Chat';
      default:
        return 'Unknown Model';
    }
  }

  async sendMessage(userMessage: string): Promise<string> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      console.log(`Sending to ${this.currentModel}:`, userMessage);

      const response = await this.sendToDeepseek(userMessage);

      // Add AI response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: response
      });

      // Keep conversation history manageable (last 10 messages)
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      return response;
    } catch (error: any) {
      console.error(`Error calling ${this.currentModel} API:`, error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      // Return user-friendly error messages based on the error type
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return "I'm taking a bit longer to think about your message. Could you try again?";
      } else if (error.response?.status === 401) {
        return "I'm having trouble with my authentication. Please check my API key.";
      } else if (error.response?.status === 402) {
        return "My account needs more balance. Please check your Deepseek account balance.";
      } else if (error.response?.status === 429) {
        return "I'm getting too many requests right now. Let's take a short break and try again.";
      } else if (error.response?.status >= 500) {
        return "My brain is having some technical difficulties. Let's try again in a moment.";
      } else if (error.message?.includes('Network Error')) {
        return "I'm having trouble connecting to the internet. Please check your connection and try again.";
      } else {
        // Include the actual error message for debugging
        const errorMsg = error.response?.data?.error?.message || error.message || 'Unknown error';
        return `I'm having some trouble: ${errorMsg}. Please try again!`;
      }
    }
  }

  private async sendToDeepseek(userMessage: string): Promise<string> {
    console.log('=== DEEPSEEK API DEBUG ===');
    console.log('API URL:', DEEPSEEK_API_URL);
    console.log('API Key (first 10 chars):', DEEPSEEK_API_KEY.substring(0, 10) + '...');
    console.log('Request payload:', {
      model: 'deepseek-chat',
      messages: this.conversationHistory,
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    });

    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: 'deepseek-chat',
          messages: this.conversationHistory,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log('=== DEEPSEEK SUCCESS ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.log('=== DEEPSEEK ERROR ===');
      console.log('Error type:', error.constructor.name);
      console.log('Error message:', error.message);
      console.log('Error response status:', error.response?.status);
      console.log('Error response data:', error.response?.data);
      console.log('Error response headers:', error.response?.headers);
      
      // Re-throw the error to be handled by the main error handler
      throw error;
    }
  }

  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  clearConversation(): void {
    this.conversationHistory = [{
      role: 'assistant',
      content: 'Hi! I\'m your AI friend. I\'m here to listen and chat with you about anything on your mind. How are you feeling today?'
    }];
  }

  // Test method to verify Deepseek API connection
  async testDeepseekConnection(): Promise<string> {
    try {
      console.log('=== TESTING DEEPSEEK CONNECTION ===');
      
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
          temperature: 0.7,
          max_tokens: 50,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log('Deepseek test successful:', response.data);
      return `✅ Deepseek API is working! Response: ${response.data.choices[0].message.content}`;
    } catch (error: any) {
      console.log('Deepseek test failed:', error.response?.data || error.message);
      return `❌ Deepseek API test failed: ${error.response?.data?.error?.message || error.message}`;
    }
  }
}

export default new LLMService(); 