import { getCurrentUser } from "../../lib/utils";
import TaskForm from "../../components/TaskForm";

export default async function CreateTaskPage() {
  // Updated function name for clarity
  const user = await getCurrentUser();

  if (!user) {
    return <div>Please sign in to create a task</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Task</h1>
        <TaskForm userId={user.id} />
      </div>
    </div>
  );
}
