import { signOut } from "../actions/authenticate";
import TaskList from "../components/TaskList";
import NewTaskButton from "../components/NewTaskButton";

export default async function DashboardPage() {
  return (
    <>
      <div className="w-full mb-6 flex justify-between items-center">
        <h3 className="text-xl font-medium" style={{ color: "#C7F9CC" }}>
          Your Tasks
        </h3>
        <NewTaskButton />
      </div>

      <div className="flex w-full place-content-start">
        <TaskList />
      </div>

      <form action={signOut} className="mt-8">
        <button
          type="submit"
          className="px-4 py-2 rounded-sm hover:opacity-90 transition-colors cursor-pointer"
          style={{ backgroundColor: "#57CC99", color: "#22577A" }}
        >
          Sign Out
        </button>
      </form>
    </>
  );
}
