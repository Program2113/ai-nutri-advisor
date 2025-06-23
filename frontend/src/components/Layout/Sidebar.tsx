import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, AlertTriangle } from 'lucide-react';
import { ChatThread } from '../../types';

interface SidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
  onDeleteThread: (threadId: string) => void;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  threadTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  threadTitle,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Chat</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Are you sure you want to delete "<span className="font-medium">{threadTitle}</span>"? 
            All messages in this chat will be permanently removed.
          </p>
          
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Delete Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
  onDeleteThread
}) => {
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; threadId: string; threadTitle: string }>({
    isOpen: false,
    threadId: '',
    threadTitle: ''
  });

  const handleDeleteClick = (threadId: string, threadTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, threadId, threadTitle });
  };

  const handleConfirmDelete = () => {
    onDeleteThread(deleteModal.threadId);
    setDeleteModal({ isOpen: false, threadId: '', threadTitle: '' });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, threadId: '', threadTitle: '' });
  };

  return (
    <>
      <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-200">
        <div className="p-4">
          <button
            onClick={onCreateThread}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Chat History
            </h3>
            <div className="space-y-2">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeThreadId === thread.id
                      ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => onSelectThread(thread.id)}
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {thread.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {thread.messages.length} messages
                  </p>
                  <button
                    onClick={(e) => handleDeleteClick(thread.id, thread.title, e)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        threadTitle={deleteModal.threadTitle}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};