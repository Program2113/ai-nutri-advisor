import React from 'react';
import { Bot, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex space-x-4 ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        message.isUser 
          ? 'bg-green-500 text-white' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
      }`}>
        {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={`flex-1 max-w-2xl ${message.isUser ? 'flex justify-end' : ''}`}>
        <div className={`rounded-lg px-4 py-3 ${
          message.isUser
            ? 'bg-green-500 text-white'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
        }`}>
          {message.image && (
            <div className="mb-3">
              <img
                src={message.image}
                alt="Uploaded nutrition label"
                className="max-w-xs rounded-lg"
              />
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className={`text-xs mt-2 ${
            message.isUser ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};