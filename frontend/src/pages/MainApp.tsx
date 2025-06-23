import React, { useState } from 'react';
import { Header } from '../components/Layout/Header';
import { Sidebar } from '../components/Layout/Sidebar';
import { ChatInterface } from '../components/Chat/ChatInterface';
import { SettingsModal } from '../components/Settings/SettingsModal';
import { useChat } from '../hooks/useChat';

export const MainApp: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const {
    threads,
    activeThread,
    activeThreadId,
    setActiveThreadId,
    createThread,
    sendMessage,
    deleteThread,
    loading
  } = useChat();

  return (
    <div className="h-screen flex flex-col">
      <Header onOpenSettings={() => setShowSettings(true)} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={setActiveThreadId}
          onCreateThread={createThread}
          onDeleteThread={deleteThread}
        />
        
        <ChatInterface
          thread={activeThread || null}
          onSendMessage={sendMessage}
          loading={loading}
        />
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};