import { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      
      try {
        // For now, use mock data since the backend doesn't have a tasks endpoint
        // In a real app, you would make an API call here
        setTasks([
          {
            id: 1,
            title: 'Sample Task 1',
            description: 'This is a sample task',
            status: 'pending',
            priority: 'medium'
          },
          {
            id: 2,
            title: 'Sample Task 2',
            description: 'Another sample task',
            status: 'completed',
            priority: 'high'
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setError('Failed to fetch tasks.');
      }
    };

    fetchTasks();
  }, [user]);

  // Show loading while auth is being determined
  if (authLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-semibold mb-4">Tasks</h1>
          <p className="text-gray-500 mb-4">Please log in to view tasks.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Task Management</h1>
      <TaskForm
        tasks={tasks}
        setTasks={setTasks}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
      />
      <TaskList tasks={tasks} setTasks={setTasks} setEditingTask={setEditingTask} />
    </div>
  );
};

export default Tasks;
