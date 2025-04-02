"use client";

import Link from "next/link";

export default function NewTaskButton() {
  return (
    <Link
      href="/dashboard/new-task"
      className="flex items-center justify-center gap-2 px-4 py-2 rounded-md"
      style={{ backgroundColor: "#38A3A5", color: "#C7F9CC" }}
    >
      <span className="text-xl font-bold">+</span>
      <span>New Task</span>
    </Link>
  );
}
