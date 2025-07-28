export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AudioSettings {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Conversation {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
} 