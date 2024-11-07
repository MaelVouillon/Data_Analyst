import React from 'react';
import { User, Bot } from 'lucide-react';
import { DataSet } from '../types';
import { processFile as processFileUtil } from '../utils/fileProcessing';
import { useDataStore } from '../hooks/useDataStore';

export interface Conversation {
  type: 'user' | 'bot';
  message: string;
}

interface ChatMessageProps {
  message: Conversation;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user';
  const { addDataset, setActiveDataset } = useDataStore();

  const handleFiles = async (files: FileList) => {
    try {
      const file = files[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit');
        return;
      }

      const dataset = await processFileUtil(file);
      addDataset(dataset);
      setActiveDataset(dataset.id);
    } catch (error) {
      console.error('Error processing file:', error);
      if (error instanceof Error) {
        alert(`Error processing file: ${error.message}`);
      } else {
        alert('Error processing file');
      }
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex space-x-2 max-w-[80%] ${
          isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-indigo-100' : 'bg-purple-100'
          }`}
        >
          {isUser ? (
            <User className="w-5 h-5 text-indigo-600" />
          ) : (
            <Bot className="w-5 h-5 text-purple-600" />
          )}
        </div>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {message.message}
        </div>
      </div>
    </div>
  );
}