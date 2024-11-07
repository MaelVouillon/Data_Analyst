import React, { useState } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { useHistoryStore } from '../hooks/useHistoryStore';
import { useDataStore } from '../hooks/useDataStore';
import { analyzeData } from '../services/openai';
import { ChartView } from './ChartView';
import { ChartConfig } from '../types';

export const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChart, setCurrentChart] = useState<ChartConfig | null>(null);
  const { messages, saveMessage } = useHistoryStore();
  const { datasets, activeDataset } = useDataStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    saveMessage(userMessage, true);
    setIsLoading(true);

    try {
      const currentDataset = datasets.find(ds => ds.id === activeDataset);
      if (!currentDataset?.data) {
        saveMessage("Please upload a dataset first.", false);
        return;
      }

      const data = Array.isArray(currentDataset.data) 
        ? currentDataset.data 
        : Object.values(currentDataset.data).flat();

      const analysis = await analyzeData(data, userMessage);
      
      saveMessage(analysis.answer, false);
      
      if (analysis.chartConfig) {
        setCurrentChart(analysis.chartConfig);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      saveMessage("I apologize, but I encountered an error while analyzing your data.", false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.isUser
                ? 'bg-indigo-50 text-indigo-900 ml-auto'
                : 'bg-gray-50 text-gray-900'
            } max-w-[80%]`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing data...</span>
          </div>
        )}
      </div>

      {/* Chart Area */}
      {currentChart && (
        <div className="p-4 border-t border-gray-200">
          <ChartView config={currentChart} />
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your data..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};