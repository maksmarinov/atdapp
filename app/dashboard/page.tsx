import { redirect } from "next/navigation";
import { signOut } from "../actions/authenticate";
import { getCurrentUser } from "../lib/utils";
import SlidingMenu from "../components/SlidingMenu";
import TaskList from "../components/TaskList";
import NewTaskButton from "../components/NewTaskButton"; // Updated import

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }
  return (
    <div className="min-h-screen">
      <SlidingMenu />

      <div className="flex flex-col min-h-screen w-full max-w-10/12 ml-[4rem] pt-10">
        {user?.email && (
          <div className="text-xl mb-4">Welcome, {user.username}</div>
        )}
        <h2 className="text-3xl mb-8 underline">Dashboard</h2>

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
      </div>
    </div>
  );
}
