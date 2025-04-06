import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/utils";
import SlidingMenu from "../components/SlidingMenu";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-linear-to-bl from-lime-500/10 to-black">
      <SlidingMenu />

      <div className="flex flex-col min-h-screen w-full max-w-10/12 ml-[4rem] pt-10">
        {user?.email && (
          <div className="text-xl mb-4">Welcome, {user.username}</div>
        )}
        <h2 className="text-3xl mb-8 underline">Dashboard</h2>

        {children}
      </div>
    </div>
  );
}
