import { signOut } from "../actions/authenticate";
import TaskList from "../components/TaskList";
import NewTaskButton from "../components/NewTaskButton";

export default async function DashboardPage() {
  return (
    <>
      <div className="w-full mb-6 flex justify-between items-center">
        <h3 className="text-xl font-medium">Your Tasks</h3>
        <NewTaskButton />
      </div>

      <div className="flex w-full place-content-start">
        <TaskList />
      </div>

      <form action={signOut} className="mt-8">
        <button
          type="submit"
          className="px-4 py-2 bg-green-950 text-white rounded hover:bg-red-900 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </form>
    </>
  );
}
