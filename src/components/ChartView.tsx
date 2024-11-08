import React, { useRef } from 'react';
import { 
  BarChart, Bar, 
  LineChart, Line,
  PieChart, Pie,
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import { ChartConfig } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import { Download, Copy, FileText } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'];

interface ChartViewProps {
  config: ChartConfig;
}

export const ChartView: React.FC<ChartViewProps> = ({ config }) => {
  const { type, data, title } = config;
  const chartRef = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const exportToExcel = () => {
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(data);
    utils.book_append_sheet(wb, ws, 'Chart Data');
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
  };

  const copyToClipboard = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          alert('Chart copied to clipboard!');
        }
      });
    } catch (err) {
      console.error('Failed to copy chart:', err);
    }
  };

  const renderChart = () => {
    if (type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              fontSize={12}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              fontSize={12}
            />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone" 
              dataKey="value" 
              stroke="#6366f1" 
              strokeWidth={2} 
              dot={{ fill: '#6366f1' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              labelLine
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div>
      <div className="flex justify-end space-x-2 mb-4">
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <Copy className="h-4 w-4" />
          <span>Copy</span>
        </button>
        <button
          onClick={exportToPDF}
          className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <FileText className="h-4 w-4" />
          <span>PDF</span>
        </button>
        <button
          onClick={exportToExcel}
          className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <Download className="h-4 w-4" />
          <span>Excel</span>
        </button>
      </div>
      <div ref={chartRef} className="h-[500px] w-full">
        {renderChart()}
      </div>
    </div>
  );
};