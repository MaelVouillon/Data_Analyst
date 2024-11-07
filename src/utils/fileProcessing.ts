import Papa from 'papaparse';
import { read, utils } from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { v4 as uuidv4 } from 'uuid';
import { DataSet } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function processFile(file: File): Promise<DataSet> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && Array.isArray(results.data)) {
            // Filter out empty rows
            const filteredData = results.data.filter(row => 
              Object.values(row).some(value => value !== '')
            );
            
            resolve({
              id: uuidv4(),
              name: file.name,
              type: 'csv',
              data: filteredData,
              uploadedAt: Date.now(),
            });
          } else {
            reject(new Error('Invalid CSV data structure'));
          }
        },
        header: true,
        skipEmptyLines: true,
        error: reject,
      });
    });
  }

  if (fileType === 'xlsx' || fileType === 'xls') {
    const data = await file.arrayBuffer();
    const workbook = read(data);
    
    // Process all sheets
    const sheets: { [key: string]: any[] } = {};
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(worksheet);
      if (jsonData.length > 0) {
        sheets[sheetName] = jsonData;
      }
    });

    return {
      id: uuidv4(),
      name: file.name,
      type: 'excel',
      data: sheets,
      uploadedAt: Date.now(),
    };
  }

  if (fileType === 'json') {
    const text = await file.text();
    const jsonData = JSON.parse(text);
    
    // Ensure the data is in a format we can work with
    const processedData = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    return {
      id: uuidv4(),
      name: file.name,
      type: 'json',
      data: processedData,
      uploadedAt: Date.now(),
    };
  }

  if (fileType === 'pdf') {
    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const textContent: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item: any) => item.str)
        .join(' ');
      textContent.push(text);
    }

    return {
      id: uuidv4(),
      name: file.name,
      type: 'pdf',
      data: textContent,
      uploadedAt: Date.now(),
    };
  }

  throw new Error('Unsupported file type');
}