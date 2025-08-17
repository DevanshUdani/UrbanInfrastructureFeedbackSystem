import { useAuth } from '../context/AuthContext';

const TaskList = ({ tasks, setTasks, setEditingTask }) => {
  const { user } = useAuth();

  const handleDelete = async (taskId) => {
    try {
      // For now, just remove from local state since there's no backend endpoint
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task.');
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks found. Create a new task to get started.
      </div>
    );
  }

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{task.title}</h2>
          <p>{task.description}</p>
          <div className="text-sm text-gray-500 mb-2">
            Status: <span className="capitalize">{task.status}</span> • 
            Priority: <span className="capitalize">{task.priority}</span>
          </div>
          <div className="mt-2">
            <button
              onClick={() => setEditingTask(task)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(task.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
