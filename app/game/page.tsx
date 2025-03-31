import { User } from "@prisma/client";
import { getCurrentUser } from "../lib/utils";
import SlidingMenu from "../components/SlidingMenu";
export default async function Game() {
  const user: User = await getCurrentUser();
  const username: string = user.username;
  return (
    <div className="min-h-screen">
      <SlidingMenu />
      <div className="flex flex-col left-[4rem]">
        {username} score: {user.score}
      </div>
    </div>
  );
}
