import { create } from 'zustand';
import { DataSet } from '../types';

interface DataStore {
  datasets: DataSet[];
  activeDataset: string | null;
  addDataset: (dataset: DataSet) => void;
  setActiveDataset: (id: string) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  datasets: [],
  activeDataset: null,
  addDataset: (dataset) =>
    set((state) => ({
      datasets: [...state.datasets, dataset],
    })),
  setActiveDataset: (id) =>
    set(() => ({
      activeDataset: id,
    })),
}));