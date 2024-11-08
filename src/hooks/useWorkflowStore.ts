import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface Workflow {
  id: string;
  name: string;
  description: string;
}

interface WorkflowStore {
  workflows: Workflow[];
  addWorkflow: (workflow: Omit<Workflow, 'id'>) => void;
  updateWorkflow: (updatedWorkflow: Workflow) => void;
  deleteWorkflow: (id: string) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  workflows: [],
  addWorkflow: (workflow) =>
    set((state) => ({
      workflows: [
        ...state.workflows,
        { ...workflow, id: uuidv4() },
      ],
    })),
  updateWorkflow: (updatedWorkflow) =>
    set((state) => ({
      workflows: state.workflows.map((workflow) =>
        workflow.id === updatedWorkflow.id ? updatedWorkflow : workflow
      ),
    })),
  deleteWorkflow: (id) =>
    set((state) => ({
      workflows: state.workflows.filter((workflow) => workflow.id !== id),
    })),
}));

