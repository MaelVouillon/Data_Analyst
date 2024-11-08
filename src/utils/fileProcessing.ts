import Papa from 'papaparse';
import { read, utils } from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { v4 as uuidv4 } from 'uuid';
import { DataSet } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function processFile(file: File): Promise<DataSet> {
  const fileType = file.name.split('.').pop()?.toLowerCase();

  if (!fileType) {
    throw new Error('File type could not be determined.');
  }

  try {
    if (fileType === 'csv') {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          complete: (results) => {
            if (results.data && Array.isArray(results.data)) {
              // Filter out empty rows
              const filteredData = results.data.filter((row: any) =>
                Object.values(row as { [key: string]: any }).some(value => value !== '')
              );

              resolve({
                id: uuidv4(),
                name: file.name,
                type: 'csv',
                data: filteredData,
                uploadedAt: Date.now(),
              });
            } else {
              reject(new Error('Invalid CSV data structure.'));
            }
          },
          header: true,
          skipEmptyLines: true,
          error: (error) => {
            reject(new Error(`CSV parsing error: ${error.message}`));
          },
        });
      });
    }

    if (fileType === 'xlsx' || fileType === 'xls') {
      const data = await file.arrayBuffer();
      let workbook;
      try {
        workbook = read(data, { type: 'array' });
      } catch (error) {
        throw new Error('Error reading Excel file.');
      }

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('No sheets found in Excel file.');
      }

      const sheets: { [key: string]: any[] } = {};
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        if (worksheet) {
          const jsonData = utils.sheet_to_json(worksheet, { defval: '' });
          if (jsonData.length > 0) {
            sheets[sheetName] = jsonData;
          } else {
            console.warn(`Sheet "${sheetName}" is empty.`);
          }
        } else {
          console.warn(`Sheet "${sheetName}" could not be found.`);
        }
      });

      if (Object.keys(sheets).length === 0) {
        throw new Error('No valid data found in any sheets.');
      }

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
      let jsonData;
      try {
        jsonData = JSON.parse(text);
      } catch (error) {
        throw new Error('Invalid JSON format.');
      }

      // Ensure the data is in a workable format
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
      let pdf;
      try {
        pdf = await pdfjsLib.getDocument({ data }).promise;
      } catch (error) {
        throw new Error('Error loading PDF document.');
      }

      const textContent: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = content.items.map((item: any) => item.str).join(' ');
          textContent.push(text);
        } catch (error) {
          const errorMessage = (error as Error).message;
          console.warn(`Error processing page ${i} of PDF: ${errorMessage}`);
        }
      }

      if (textContent.length === 0) {
        throw new Error('No text content found in PDF.');
      }

      return {
        id: uuidv4(),
        name: file.name,
        type: 'pdf',
        data: textContent,
        uploadedAt: Date.now(),
      };
    }

    throw new Error('Unsupported file type.');
  } catch (error) {
    console.error('Erreur lors du traitement du fichier :', error);
    if (error instanceof Error) {
      throw new Error(`Erreur lors du traitement du fichier : ${error.message}`);
    }
    throw new Error('Erreur inconnue lors du traitement du fichier.');
  }
}