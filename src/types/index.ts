export interface DataSet {
  id: string;
  name: string;
  type: 'csv' | 'excel' | 'pdf' | 'json';
  data: any;
  uploadedAt: number;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: Array<{
    name: string;
    value: number;
  }>;
}

export interface SavedChart {
  id: string;
  timestamp: number;
  config: ChartConfig;
  datasetId: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}

export interface HistoryState {
  charts: SavedChart[];
  messages: ChatMessage[];
}