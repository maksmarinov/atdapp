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
          <button className="cursor-pointer bg-green-500/30 text-black rounded px-2  button-hover">
            Done
          </button>
          <button
            id="edit"
            className="cursor-pointer  text-black px-2 bg-neutral-500/30 rounded button-hover"
          >
            Edit
          </button>

          <button
            id="delete"
            className="cursor-pointer text-black bg-red-500/30 text-sm px-2  rounded button-hover"
          >
            X
          </button>
        </div>
      </div>
    </div>
  );
}
