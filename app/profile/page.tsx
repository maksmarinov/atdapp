import { getCurrentUser } from "../lib/utils";
import SlidingMenu from "../components/SlidingMenu";
import { User } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user: User = await getCurrentUser();

  const username: string = user.username;
  return (
    <div className="min-h-screen">
      <SlidingMenu />
      <div className="relative top-10 left-20 text-emerald-400">
        <div className="underline text-2xl mb-4">Profile</div>
        <div>Username: {username}</div>
        <div>B&C Score: {user.score}</div>
      </div>
    </div>
  );
}
