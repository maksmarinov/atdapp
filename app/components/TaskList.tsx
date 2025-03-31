import Task from "./Task";
import { getCurrentUser } from "../lib/utils";
import { getAllTasks } from "../lib/utils"; // Assuming this exists

export default async function TaskList() {
  // Get current user
  const user = await getCurrentUser();

  // Get tasks
  const allTasks = user ? await getAllTasks() : [];

  // Filter tasks for current user
  const userTasks = allTasks.filter((task) => task.userId === user?.id);

  // Handle empty state
  if (!userTasks || userTasks.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-xl font-medium mb-4">Your Tasks</h3>
        <div className="bg-neutral-800 rounded-lg shadow-lg p-4 text-gray-400">
          No tasks found. Create a new task to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-neutral-800 rounded-lg shadow-lg p-4">
        <ul className="divide-y divide-neutral-700">
          {userTasks.map((task) => (
            <li key={task.id} className="py-3">
              <Task
                task={{
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  dueDate: task.dueDate,
                  status: task.status,
                  userId: task.userId,
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
