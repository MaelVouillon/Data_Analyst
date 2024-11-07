import React, { useState } from 'react';
import { useDataStore } from '../hooks/useDataStore';
import { Table, Download, Copy } from 'lucide-react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import 'react-tabs/style/react-tabs.css';

export const DataPreview: React.FC = () => {
  const { datasets, activeDataset } = useDataStore();
  const [currentPage, setCurrentPage] = useState(0);
  const ROWS_PER_PAGE = 10;

  const currentDataset = datasets.find((ds) => ds.id === activeDataset);
  if (!currentDataset?.data) return null;

  const getSheetData = (data: any) => {
    if (typeof data === 'object' && !Array.isArray(data)) {
      return Object.entries(data).map(([key, value]) => ({
        key,
        value: JSON.stringify(value)
      }));
    }
    return Array.isArray(data) ? data : [];
  };

  const sheets = currentDataset.type === 'excel' && typeof currentDataset.data === 'object'
    ? Object.keys(currentDataset.data)
    : ['Data'];

  const getCurrentSheetData = (sheetName: string) => {
    if (currentDataset.type === 'excel' && typeof currentDataset.data === 'object') {
      return getSheetData(currentDataset.data[sheetName]);
    }
    return getSheetData(currentDataset.data);
  };

  const copyToClipboard = async (sheetName: string) => {
    const data = getCurrentSheetData(sheetName);
    if (!data.length) return;

    const columns = Object.keys(data[0]);
    const tableData = data.map(row => 
      columns.map(col => row[col]).join('\t')
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(tableData);
      alert('Data copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportToExcel = (sheetName: string) => {
    const data = getCurrentSheetData(sheetName);
    if (!data.length) return;

    const wb = utils.book_new();
    const ws = utils.json_to_sheet(data);
    utils.book_append_sheet(wb, ws, sheetName);
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${currentDataset.name}_${sheetName}.xlsx`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Table className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">Data Preview</h2>
        </div>
      </div>

      <Tabs>
        <TabList className="flex border-b border-gray-200 mb-4">
          {sheets.map((sheet) => (
            <Tab
              key={sheet}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer border-b-2 border-transparent hover:border-gray-300 focus:outline-none"
              selectedClassName="text-indigo-600 border-indigo-600"
            >
              {sheet}
            </Tab>
          ))}
        </TabList>

        {sheets.map((sheet) => {
          const data = getCurrentSheetData(sheet);
          if (!data.length) return null;

          const columns = Object.keys(data[0]);
          const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
          const startIndex = currentPage * ROWS_PER_PAGE;
          const endIndex = startIndex + ROWS_PER_PAGE;
          const currentPageData = data.slice(startIndex, endIndex);

          return (
            <TabPanel key={sheet}>
              <div className="mb-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {data.length} rows × {columns.length} columns
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(sheet)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => exportToExcel(sheet)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPageData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {columns.map((column) => (
                          <td
                            key={`${rowIndex}-${column}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {String(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </TabPanel>
          );
        })}
      </Tabs>
    </div>
  );
};