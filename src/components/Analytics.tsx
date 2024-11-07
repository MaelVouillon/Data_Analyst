import React, { useState, useEffect } from 'react';
import { useDataStore } from '../hooks/useDataStore';
import { useHistoryStore } from '../hooks/useHistoryStore';
import { ChartView } from './ChartView';
import { BarChart2, PieChart, TrendingUp, Save } from 'lucide-react';
import { ChartConfig } from '../types';

export const Analytics: React.FC = () => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [currentChart, setCurrentChart] = useState<ChartConfig | null>(null);
  const { datasets, activeDataset } = useDataStore();
  const { saveChart } = useHistoryStore();
  const currentDataset = datasets.find((ds) => ds.id === activeDataset);

  useEffect(() => {
    const handleChartUpdate = (event: CustomEvent<ChartConfig>) => {
      setCurrentChart(event.detail);
    };

    window.addEventListener('updateChart', handleChartUpdate as EventListener);
    return () => {
      window.removeEventListener('updateChart', handleChartUpdate as EventListener);
    };
  }, []);

  if (!currentDataset?.data) return null;

  const data = Array.isArray(currentDataset.data) ? currentDataset.data : [];
  if (!data.length) return null;

  const generateChartData = (): ChartConfig => {
    if (currentChart) {
      return currentChart;
    }

    const numericColumns = Object.keys(data[0]).filter(key => 
      typeof data[0][key] === 'number'
    );

    const firstNumericColumn = numericColumns[0];
    if (!firstNumericColumn) {
      return {
        type: chartType,
        title: 'No numeric data available',
        data: []
      };
    }

    if (chartType === 'pie') {
      return {
        type: 'pie',
        title: `Distribution of ${firstNumericColumn}`,
        data: data.slice(0, 10).map(row => ({
          name: String(row[Object.keys(row)[0]]),
          value: Number(row[firstNumericColumn])
        }))
      };
    }

    return {
      type: chartType,
      title: `${firstNumericColumn} Distribution`,
      data: data.slice(0, 20).map((row, index) => ({
        name: String(row[Object.keys(row)[0]]) || `Item ${index + 1}`,
        value: Number(row[firstNumericColumn])
      }))
    };
  };

  const handleSaveChart = () => {
    const chartConfig = generateChartData();
    saveChart({
      config: chartConfig,
      datasetId: currentDataset.id
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Analytics Dashboard</h2>
        <div className="flex space-x-4">
          <button 
            className={`p-2 rounded-lg ${chartType === 'bar' ? 'bg-indigo-100' : 'hover:bg-indigo-50'} text-indigo-600`}
            onClick={() => {
              setChartType('bar');
              setCurrentChart(null);
            }}
          >
            <BarChart2 className="h-5 w-5" />
          </button>
          <button 
            className={`p-2 rounded-lg ${chartType === 'pie' ? 'bg-indigo-100' : 'hover:bg-indigo-50'} text-indigo-600`}
            onClick={() => {
              setChartType('pie');
              setCurrentChart(null);
            }}
          >
            <PieChart className="h-5 w-5" />
          </button>
          <button 
            className={`p-2 rounded-lg ${chartType === 'line' ? 'bg-indigo-100' : 'hover:bg-indigo-50'} text-indigo-600`}
            onClick={() => {
              setChartType('line');
              setCurrentChart(null);
            }}
          >
            <TrendingUp className="h-5 w-5" />
          </button>
          <button
            onClick={handleSaveChart}
            className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600"
          >
            <Save className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
          <h3 className="text-lg font-medium mb-2">Total Records</h3>
          <p className="text-3xl font-bold">{data.length}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg p-4 text-white">
          <h3 className="text-lg font-medium mb-2">Columns</h3>
          <p className="text-3xl font-bold">{Object.keys(data[0]).length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg p-4 text-white">
          <h3 className="text-lg font-medium mb-2">Data Quality</h3>
          <p className="text-3xl font-bold">98%</p>
        </div>
      </div>

      <div className="mt-6">
        <ChartView config={generateChartData()} />
      </div>
    </div>
  );
};