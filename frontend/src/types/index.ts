export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  image?: string;
  timestamp: Date;
  isUser: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface UserSettings {
  notifications: boolean;
  theme: 'light' | 'dark';
  language: string;
}