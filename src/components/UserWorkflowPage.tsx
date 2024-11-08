import React, { useState } from 'react';
import { useWorkflowStore } from '../hooks/useWorkflowStore';
import { ChartView } from './ChartView';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const UserWorkflowPage: React.FC = () => {
  const { workflows, addWorkflow, updateWorkflow, deleteWorkflow } = useWorkflowStore();
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddWorkflow = () => {
    if (newWorkflowName.trim()) {
      addWorkflow({ name: newWorkflowName });
      setNewWorkflowName('');
    }
  };

  const handleUpdateWorkflow = (id: string) => {
    if (editingName.trim()) {
      updateWorkflow(id, { name: editingName });
      setEditingWorkflow(null);
      setEditingName('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">User Workflows</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={newWorkflowName}
          onChange={(e) => setNewWorkflowName(e.target.value)}
          placeholder="New workflow name"
          className="border rounded-lg px-4 py-2 mr-2"
        />
        <button
          onClick={handleAddWorkflow}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <PlusCircle className="inline-block h-5 w-5 mr-1" />
          Add Workflow
        </button>
      </div>

      <ul className="space-y-4">
        {workflows.map((workflow) => (
          <li key={workflow.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            {editingWorkflow === workflow.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="border rounded-lg px-4 py-2 flex-1 mr-2"
              />
            ) : (
              <span className="text-lg font-medium">{workflow.name}</span>
            )}
            <div className="flex space-x-2">
              {editingWorkflow === workflow.id ? (
                <button
                  onClick={() => handleUpdateWorkflow(workflow.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingWorkflow(workflow.id);
                    setEditingName(workflow.name);
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                >
                  <Edit className="inline-block h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => deleteWorkflow(workflow.id)}
                className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
              >
                <Trash2 className="inline-block h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserWorkflowPage;

