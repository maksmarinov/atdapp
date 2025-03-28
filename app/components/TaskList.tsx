import Task from "./Task";

export default function TaskList() {
  // Create an array of 10 items to map over
  const taskArray = Array(10).fill(null);

  return (
    <div className="w-full max-w-3xl ">
      {" "}
      <h3 className="text-xl font-medium mb-4">Your Tasks</h3>
      <div className="bg-neutral-800 rounded-lg shadow-lg p-4">
        <ul className="divide-y divide-neutral-700">
          {taskArray.map((_, index) => (
            <li key={index} className="py-3">
              <Task />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
