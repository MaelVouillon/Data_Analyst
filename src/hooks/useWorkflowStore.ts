import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface Workflow {
  id: string;
  name: string;
}

interface WorkflowState {
  workflows: Workflow[];
  addWorkflow: (workflow: Omit<Workflow, 'id'>) => void;
  updateWorkflow: (id: string, updatedWorkflow: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set) => ({
      workflows: [],
      addWorkflow: (workflow) =>
        set((state) => ({
          workflows: [
            ...state.workflows,
            { ...workflow, id: uuidv4() },
          ],
        })),
      updateWorkflow: (id, updatedWorkflow) =>
        set((state) => ({
          workflows: state.workflows.map((workflow) =>
            workflow.id === id ? { ...workflow, ...updatedWorkflow } : workflow
          ),
        })),
      deleteWorkflow: (id) =>
        set((state) => ({
          workflows: state.workflows.filter((workflow) => workflow.id !== id),
        })),
    }),
    {
      name: 'workflow-storage',
    }
  )
);

