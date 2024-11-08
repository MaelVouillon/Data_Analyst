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
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
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
        saveMessage("Veuillez d'abord télécharger un ensemble de données.", false);
        return;
      }

      const data = Array.isArray(currentDataset.data) 
        ? currentDataset.data 
        : Object.values(currentDataset.data).flat();

      const analysis = await analyzeData(data, userMessage);
      saveMessage(analysis.answer, false);
      
      if (analysis.chartConfig) {
        setCurrentChart({ ...analysis.chartConfig, type: chartType });
      }
    } catch (error) {
      console.error('Erreur d\'analyse:', error);
      saveMessage("Je suis désolé, mais une erreur est survenue lors de l'analyse de vos données.", false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChartTypeChange = (type: 'bar' | 'line' | 'pie') => {
    setChartType(type);
    if (currentChart) {
      setCurrentChart({ ...currentChart, type });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Assistant AI</h2>
        </div>
      </div>

      {/* Content Area - Messages and Chart */}
      <div className="flex-1 overflow-y-auto">
        {/* Messages */}
        <div className="p-4 space-y-4">
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
              <span>Analyse des données en cours...</span>
            </div>
          )}
        </div>

        {/* Chart Section */}
        {currentChart && (
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {currentChart.title}
                </h3>
                {/* Contrôles de style de graphique */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleChartTypeChange('bar')}
                    className={`px-3 py-1 rounded ${
                      chartType === 'bar' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => handleChartTypeChange('line')}
                    className={`px-3 py-1 rounded ${
                      chartType === 'line' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => handleChartTypeChange('pie')}
                    className={`px-3 py-1 rounded ${
                      chartType === 'pie' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Pie
                  </button>
                </div>
              </div>
              <div className="h-[500px] w-full">
                <ChartView config={currentChart} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question sur vos données..."
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
        </form>
      </div>
    </div>
  );
};