import { signOut } from "../actions/authenticate";
import { getCurrentUser } from "../lib/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center">
      {user?.email && (
        <div className="text-xl mb-4">Welcome, {user.username}</div>
      )}
      <h1 className="text-7xl">Dashboard</h1>

      <form action={signOut} className="mt-8">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-950 text-white rounded hover:bg-red-900 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
