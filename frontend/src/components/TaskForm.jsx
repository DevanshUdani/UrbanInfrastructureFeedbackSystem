import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TaskForm = ({ tasks, setTasks, editingTask, setEditingTask }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', description: '', status: 'pending', priority: 'medium' });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        priority: editingTask.priority,
      });
    } else {
      setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        // Update existing task
        const updatedTask = { ...editingTask, ...formData };
        setTasks(tasks.map((task) => (task.id === editingTask.id ? updatedTask : task)));
      } else {
        // Create new task
        const newTask = {
          id: Date.now(), // Simple ID generation for demo
          ...formData,
          createdAt: new Date().toISOString()
        };
        setTasks([...tasks, newTask]);
      }
      setEditingTask(null);
      setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Create New Task'}</h1>
      
      <input
        type="text"
        placeholder="Task Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        required
      />
      
      <textarea
        placeholder="Task Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        rows="3"
        required
      />
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          {editingTask ? 'Update Task' : 'Create Task'}
        </button>
        {editingTask && (
          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
            }}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
