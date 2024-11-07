import React from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ChatInterface } from './components/ChatInterface';
import { DataPreview } from './components/DataPreview';
import { Analytics } from './components/Analytics';
import { useDataStore } from './hooks/useDataStore';

const App: React.FC = () => {
  const { activeDataset } = useDataStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Upload Your Data
              </h2>
              <FileUpload />
            </div>
            
            {activeDataset && (
              <div className="space-y-6">
                <DataPreview />
                <Analytics />
              </div>
            )}
          </div>
          
          <div className="h-[calc(100vh-12rem)]">
            <ChatInterface />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;