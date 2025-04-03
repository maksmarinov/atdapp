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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete task:", error);
      setIsDeleting(false);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/edit-task/${task.id}`);
  };

  const formattedDueDate = task.dueDate
    ? formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })
    : "No due date";

  return (
    <div className="flex flex-col w-full relative">
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg p-5 max-w-sm w-full mx-auto shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete this task?</p>
            <div className="text-sm text-gray-300 mb-4">
              <strong>{task.title}</strong>
              <p className="mt-1">{task.description}</p>
            </div>
            <div className="flex flex-row justify-end gap-3 mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-neutral-700 rounded-md hover:bg-neutral-600 text-white font-medium min-w-20"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-800/70 rounded-md hover:bg-red-700 text-white font-medium min-w-20 flex items-center justify-center"
              >
                {isDeleting ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="font-medium text-lg">{task.title}</div>

      <div className="flex flex-row justify-between items-start md:items-center w-full gap-2 md:gap-0">
        <div className="flex flex-col">
          <div className="text-sm text-gray-300">{task.description}</div>
          <div className="text-xs text-gray-400">Due {formattedDueDate}</div>
        </div>

        <div className="flex flex-row gap-2 self-end md:self-auto">
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
            onClick={() => setShowDeleteModal(true)}
            className="cursor-pointer bg-red-800/40 text-sm px-2 py-1 rounded hover:bg-red-700/70"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
