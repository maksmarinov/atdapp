import { getCurrentUser } from "../../../lib/utils";
import TaskForm from "../../../components/TaskForm";
import prisma from "../../../lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function EditTaskPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const params = await paramsPromise;
  const taskId = parseInt(params.id, 10);

  if (isNaN(taskId)) {
    notFound();
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task || task.userId !== user.id) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col py-2 px-2">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Task</h1>
        <TaskForm task={task} userId={user.id} isEditing={true} />
      </div>
    </div>
  );
}
