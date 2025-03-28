"use client";

export default function Task() {
  return (
    <div id="task" className="flex flex-col w-full">
      <div id="taskName" className="font-medium text-lg">
        task name
      </div>
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-col">
          <div id="descriotion" className="text-sm text-gray-300">
            task description
          </div>
          <div id="dueDate" className="text-xs text-gray-400">
            Due date: 17/12/2111
          </div>
        </div>

        <div id="taskActions" className="flex flex-row gap-2">
          <button className="cursor-pointer bg-green-800/40 text-black hover:bg-green-600/50 rounded-sm px-2">
            Mark Done
          </button>
          <button
            id="edit"
            className="cursor-pointer text-sm px-2 py-1 bg-neutral-700 rounded hover:bg-neutral-600"
          >
            Edit
          </button>

          <button
            id="delete"
            className="cursor-pointer bg-red-500/20 text-sm px-2 py-1 rounded hover:bg-red-600/50"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
