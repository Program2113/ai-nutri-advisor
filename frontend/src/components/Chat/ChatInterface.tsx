import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ImageUpload } from './ImageUpload';
import { ChatThread } from '../../types';

interface ChatInterfaceProps {
  thread: ChatThread | null;
  onSendMessage: (content: string, image?: string) => void;
  loading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  thread,
  onSendMessage,
  loading
}) => {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;
    
    onSendMessage(message.trim(), selectedImage || undefined);
    setMessage('');
    setSelectedImage(null);
  };

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to NutriAI</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Upload a nutrition label image or ask questions about food nutrition to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {thread.messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex-1 max-w-2xl">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing nutrition information...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-colors duration-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedImage && (
            <ImageUpload
              onImageSelect={setSelectedImage}
              selectedImage={selectedImage}
              onClearImage={() => setSelectedImage(null)}
            />
          )}
          
          {!selectedImage && (
            <ImageUpload
              onImageSelect={setSelectedImage}
              selectedImage={selectedImage}
              onClearImage={() => setSelectedImage(null)}
            />
          )}

          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about nutrition or describe what you'd like to analyze..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={(!message.trim() && !selectedImage) || loading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};