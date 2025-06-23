import { useState, useCallback } from 'react';
import { ChatMessage, ChatThread } from '../types';

export const useChat = () => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeThread = threads.find(t => t.id === activeThreadId);

  const createThread = useCallback(() => {
    const newThread: ChatThread = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    return newThread.id;
  }, []);

  const sendMessage = useCallback(async (content: string, image?: string) => {
    if (!activeThreadId) {
      createThread();
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      image,
      timestamp: new Date(),
      isUser: true
    };

    setThreads(prev => prev.map(thread => {
      if (thread.id === activeThreadId) {
        const updatedMessages = [...thread.messages, userMessage];
        return {
          ...thread,
          messages: updatedMessages,
          title: thread.messages.length === 0 ? content.slice(0, 50) : thread.title,
          updatedAt: new Date()
        };
      }
      return thread;
    }));

    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `I can see ${image ? 'the nutrition label you uploaded' : 'your question about nutrition'}. Based on the ${image ? 'label information' : 'details provided'}, here's my analysis:\n\n• This appears to be a processed food item\n• The sodium content seems high (over 20% daily value)\n• Consider looking for alternatives with less added sugar\n• The protein content is moderate\n\nWould you like me to suggest healthier alternatives or explain any specific nutritional aspects?`,
        timestamp: new Date(),
        isUser: false
      };

      setThreads(prev => prev.map(thread => {
        if (thread.id === activeThreadId) {
          return {
            ...thread,
            messages: [...thread.messages, aiMessage],
            updatedAt: new Date()
          };
        }
        return thread;
      }));
      
      setLoading(false);
    }, 1500);
  }, [activeThreadId, createThread]);

  const deleteThread = useCallback((threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
    }
  }, [activeThreadId]);

  return {
    threads,
    activeThread,
    activeThreadId,
    setActiveThreadId,
    createThread,
    sendMessage,
    deleteThread,
    loading
  };
};