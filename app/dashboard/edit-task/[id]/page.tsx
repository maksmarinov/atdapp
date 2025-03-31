import { getCurrentUser } from "../../../lib/utils";
import TaskForm from "../../../components/TaskForm";
import prisma from "../../../lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function EditTaskPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  // Get the current user
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  // Get task ID from URL params (now as a Promise)
  const params = await paramsPromise;
  const taskId = parseInt(params.id, 10);

  if (isNaN(taskId)) {
    notFound();
  }

  // Fetch the task
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  // Check if task exists and belongs to current user
  if (!task || task.userId !== user.id) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Task</h1>
        <TaskForm task={task} userId={user.id} isEditing={true} />
      </div>
    </div>
  );
}
