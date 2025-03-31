import { getCurrentUser } from "../lib/utils";
import SlidingMenu from "../components/SlidingMenu";
import { redirect } from "next/navigation";

// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";

export default async function Game() {
  // Get user with proper type safety
  const user = await getCurrentUser();

  // Add null check and redirect if no user
  if (!user) {
    redirect("/login?next=/game");
  }

  return (
    <div className="min-h-screen">
      <SlidingMenu />
      <div className="flex flex-col ml-[4rem] p-6">
        <h1 className="text-2xl mb-6">Bulls and Cows Game</h1>
        <div className="bg-neutral-800 p-4 rounded-lg shadow">
          <div className="text-xl mb-4">
            {user.name} score: {user.score}
          </div>
          <div className="text-gray-300">Game content goes here...</div>
        </div>
      </div>
    </div>
  );
}
