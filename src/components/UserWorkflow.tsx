import React, { useState } from 'react';
import { useWorkflowStore } from '../hooks/useWorkflowStore';
import { Edit, Trash, PlusCircle } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
}

export const UserWorkflow: React.FC = () => {
  const { workflows, addWorkflow, updateWorkflow, deleteWorkflow } = useWorkflowStore();
  const [newWorkflow, setNewWorkflow] = useState<Partial<Workflow>>({ name: '', description: '' });
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  const handleAddWorkflow = () => {
    if (newWorkflow.name && newWorkflow.description) {
      addWorkflow(newWorkflow as Workflow);
      setNewWorkflow({ name: '', description: '' });
    }
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
  };

  const handleUpdateWorkflow = () => {
    if (editingWorkflow) {
      updateWorkflow(editingWorkflow);
      setEditingWorkflow(null);
    }
  };

  const handleDeleteWorkflow = (id: string) => {
    deleteWorkflow(id);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">User Workflows</h2>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Workflow Name"
            value={newWorkflow.name}
            onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Description"
            value={newWorkflow.description}
            onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddWorkflow}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
          </button>
        </div>

        {editingWorkflow && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Edit Name"
              value={editingWorkflow.name}
              onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Edit Description"
              value={editingWorkflow.description}
              onChange={(e) => setEditingWorkflow({ ...editingWorkflow, description: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleUpdateWorkflow}
              className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 transition-colors"
            >
              Update
            </button>
          </div>
        )}

        <ul className="space-y-2">
          {workflows.map((workflow) => (
            <li key={workflow.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
              <div>
                <p className="text-lg font-medium text-gray-700">{workflow.name}</p>
                <p className="text-sm text-gray-500">{workflow.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditWorkflow(workflow)}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteWorkflow(workflow.id)}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Trash className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

