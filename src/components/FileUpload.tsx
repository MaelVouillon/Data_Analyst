import React, { useCallback, useRef } from 'react';
import { Upload, FileType, AlertCircle } from 'lucide-react';
import { useDataStore } from '../hooks/useDataStore';
import { processFile } from '../utils/fileProcessing';
import { DataSet } from '../types';

export const FileUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addDataset, setActiveDataset } = useDataStore();

  const handleFiles = useCallback(async (files: FileList) => {
    try {
      const file = files[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        alert('La taille du fichier dépasse la limite de 10MB.');
        return;
      }

      const dataset: DataSet = await processFile(file);
      addDataset(dataset);
      setActiveDataset(dataset.id);
    } catch (error) {
      console.error('Erreur lors du traitement du fichier :', error);
      if (error instanceof Error) {
        alert(`Erreur lors du traitement du fichier : ${error.message}`);
      } else {
        alert('Erreur inconnue lors du traitement du fichier.');
      }
    }
  }, [addDataset, setActiveDataset]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [handleFiles]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onClick = () => {
    fileInputRef.current?.click();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-gradient-to-br from-white to-indigo-50"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onClick={onClick}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-30"></div>
          <Upload className="h-12 w-12 text-indigo-600 relative" />
        </div>
        
        <div>
          <p className="text-xl font-medium text-gray-700">Glissez vos fichiers ici</p>
          <p className="text-sm text-gray-500">ou cliquez pour parcourir</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FileType className="h-4 w-4" />
          <span>CSV, Excel, PDF, JSON supportés</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <span>Taille maximale du fichier : 10MB</span>
        </div>
      </div>
      
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        accept=".csv,.json,.xlsx,.xls,.pdf"
        onChange={onChange}
      />
    </div>
  );
};