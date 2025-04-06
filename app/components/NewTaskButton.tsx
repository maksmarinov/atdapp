"use client";

import Link from "next/link";

export default function NewTaskButton() {
  return (
    <Link
      href="/dashboard/new-task"
      className="flex items-center justify-center gap-2 px-4 py-2 rounded-md opacity-50 hover:opacity-100"
      style={{ backgroundColor: "azure", color: "black" }}
    >
      <span className="text-xl font-bold">+</span>
      <span>New Task</span>
    </Link>
  );
}
