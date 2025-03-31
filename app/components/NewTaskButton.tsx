"use client";

import Link from "next/link";

export default function NewTaskButton() {
  return (
    <Link
      href="/dashboard/new-task"
      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 transition-colors shadow-md self-end"
    >
      <span className="text-xl font-bold">+</span>
      <span>New Task</span>
    </Link>
  );
}
