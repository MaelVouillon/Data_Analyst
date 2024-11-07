import React, { useState } from 'react';
import { BarChart2, Settings, History } from 'lucide-react';
import { HistorySidebar } from './HistorySidebar';

export const Header: React.FC = () => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-800">Data Analytics Platform</h1>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <History className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {isHistoryOpen && <HistorySidebar onClose={() => setIsHistoryOpen(false)} />}
    </>
  );
};