"use client";

import { useState } from "react";
import { TaskStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { markTaskStatus, deleteTask } from "../actions/tasks";

interface TaskProps {
  task: {
    id: number;
    title: string;
    description: string;
    dueDate: Date;
    status: TaskStatus;
    userId: number;
  };
}

export default function Task({ task }: TaskProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status) return;

    setIsUpdating(true);
    try {
      await markTaskStatus(task.id, newStatus);
      router.refresh();
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true);
      try {
        await deleteTask(task.id);
        router.refresh();
      } catch (error) {
        console.error("Failed to delete task:", error);
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/edit-task/${task.id}`);
  };

  const formattedDueDate = task.dueDate
    ? formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })
    : "No due date";

  return (
    <div className="flex flex-col w-full">
      <div className="font-medium text-lg">{task.title}</div>

      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-col">
          <div className="text-sm text-gray-300">{task.description}</div>
          <div className="text-xs text-gray-400">Due {formattedDueDate}</div>
        </div>

        <div className="flex flex-row gap-2">
          {/* Status dropdown button */}
          <div className="relative">
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              disabled={isUpdating}
              className={`cursor-pointer text-sm px-2 py-1 rounded appearance-none ${
                task.status === TaskStatus.COMPLETED
                  ? "bg-black/70"
                  : "bg-emerald-600/70"
              }`}
            >
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.COMPLETED}>Completed</option>
            </select>
          </div>

          <button
            onClick={handleEdit}
            className="cursor-pointer text-sm px-2 py-1 bg-neutral-700 rounded hover:bg-neutral-600"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="cursor-pointer  bg-red-800/40 text-sm px-2 py-1 rounded hover:bg-red-700/70"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
