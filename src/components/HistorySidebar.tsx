import React from 'react';
import { X, Download, Clock, MessageSquare, BarChart, FileText } from 'lucide-react';
import { useHistoryStore } from '../hooks/useHistoryStore';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';

export const HistorySidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { charts, messages, deleteChart } = useHistoryStore();

  const downloadChart = (chartData: any) => {
    const blob = new Blob([JSON.stringify(chartData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-${format(new Date(chartData.timestamp), 'yyyy-MM-dd-HH-mm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportChatHistory = () => {
    const chatText = messages
      .map((msg) => {
        const timestamp = format(msg.timestamp, 'yyyy-MM-dd HH:mm:ss');
        const role = msg.isUser ? 'User' : 'Assistant';
        return `[${timestamp}] ${role}: ${msg.text}\n`;
      })
      .join('\n');

    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `chat-history-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.txt`);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">History</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BarChart className="h-5 w-5 text-indigo-600" />
                <h3 className="text-md font-medium text-gray-700">Saved Charts</h3>
              </div>
            </div>
            <div className="space-y-3">
              {charts.map((chart) => (
                <div
                  key={chart.id}
                  className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {chart.config.title}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(chart.timestamp, 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadChart(chart)}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <Download className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => deleteChart(chart.id)}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                <h3 className="text-md font-medium text-gray-700">Chat History</h3>
              </div>
              <button
                onClick={exportChatHistory}
                className="flex items-center space-x-1 px-2 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                <FileText className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-indigo-50 text-indigo-900'
                      : 'bg-gray-50 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(message.timestamp, 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};