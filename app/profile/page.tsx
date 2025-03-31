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
      <div>Profile Page for {username}</div>
    </div>
  );
}
