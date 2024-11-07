import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { SavedChart, ChatMessage, HistoryState } from '../types';

interface HistoryStore extends HistoryState {
  saveChart: (chart: Omit<SavedChart, 'id' | 'timestamp'>) => void;
  saveMessage: (text: string, isUser: boolean) => void;
  deleteChart: (id: string) => void;
  clearMessages: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      charts: [],
      messages: [],
      saveChart: (chart) =>
        set((state) => ({
          charts: [
            ...state.charts,
            {
              ...chart,
              id: uuidv4(),
              timestamp: Date.now(),
            },
          ],
        })),
      saveMessage: (text, isUser) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: uuidv4(),
              text,
              isUser,
              timestamp: Date.now(),
            },
          ],
        })),
      deleteChart: (id) =>
        set((state) => ({
          charts: state.charts.filter((chart) => chart.id !== id),
        })),
      clearMessages: () =>
        set(() => ({
          messages: [],
        })),
    }),
    {
      name: 'history-storage',
    }
  )
);