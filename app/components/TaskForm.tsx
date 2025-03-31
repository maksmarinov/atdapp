"use client";

import { Task, TaskStatus } from "@prisma/client";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createTask, editTask, ActionResponse } from "../actions/tasks";
import { useState } from "react";

interface TaskFormProps {
  task?: Task;
  userId: string | number;
  isEditing?: boolean;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
  errors: undefined,
};

export default function TaskForm({
  task,
  userId,
  isEditing = false,
}: TaskFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(async (prevState: ActionResponse, formData: FormData) => {
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      dueDate: formData.get("dueDate")
        ? new Date(formData.get("dueDate") as string)
        : new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: (formData.get("status") as TaskStatus) || TaskStatus.IN_PROGRESS,
      userId: Number(userId),
    };

    console.log("Submitting task data:", data);

    if (isEditing && task) {
      return await editTask(task.id, data);
    } else {
      return await createTask(data);
    }
  }, initialState);

  const [showSuccess, setShowSuccess] = useState(false);

  if (state.success && !showSuccess) {
    setShowSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  return (
    <div className="w-full max-w-md mx-auto bg-neutral-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">
        {isEditing ? "Edit Task" : "Create New Task"}
      </h2>

      {showSuccess && (
        <div className="bg-green-900/50 border border-green-600 text-white px-4 py-2 rounded mb-4">
          {state.message}
        </div>
      )}

      {state.error && (
        <div className="bg-red-900/50 border border-red-600 text-white px-4 py-2 rounded mb-4">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={task?.title || ""}
            required
            className="input-field w-full py-2 px-3"
            placeholder="Task title"
          />
          {state.errors?.title && (
            <p className="text-red-500 text-xs mt-1">{state.errors.title[0]}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={task?.description || ""}
            rows={4}
            className="input-field w-full py-2 px-3"
            placeholder="Task description"
          ></textarea>
          {state.errors?.description && (
            <p className="text-red-500 text-xs mt-1">
              {state.errors.description[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            defaultValue={
              task?.dueDate
                ? new Date(task.dueDate).toISOString().split("T")[0]
                : ""
            }
            className="input-field w-full py-2 px-3"
          />
          {state.errors?.dueDate && (
            <p className="text-red-500 text-xs mt-1">
              {state.errors.dueDate[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={task?.status || "IN_PROGRESS"}
            className="input-field w-full py-2 px-3"
          >
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <input type="hidden" name="userId" value={userId} />

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending
              ? "Submitting..."
              : isEditing
              ? "Update Task"
              : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
