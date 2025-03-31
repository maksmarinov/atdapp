"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SlidingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 text-2xl font-extrabold text-green-700 left-1 z-50 bg-neutral-900 py-1 px-2 cursor-pointer rounded-lg"
      >
        {isOpen ? "X" : "☰"}
      </button>

      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-neutral-900 p-10 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-8/10"
        } z-40`}
      >
        <div className="py-10 font-extrabold text-white text-6xl mb-8">
          menu
        </div>

        <ul className="space-y-4 text-white">
          <li className="font-bold px-2 py-1 rounded">
            <Link
              href="/dashboard"
              className={
                pathname === "/dashboard" ? "text-green-700" : "underline"
              }
            >
              Dashboard
            </Link>
          </li>
          <li className="font-bold px-2 py-1 rounded">
            <Link
              href="/game"
              className={pathname === "/game" ? "text-green-700" : "underline"}
            >
              Play Bulls and Cows
            </Link>
          </li>
          <li className="font-bold px-2 py-1 rounded">
            <Link
              href="/profile"
              className={
                pathname === "/profile" ? "text-green-700" : "underline"
              }
            >
              Profile
            </Link>
          </li>
        </ul>

        <div
          id="gradientSlide"
          className="absolute top-0 right-0 h-full w-2 gradient-slide z-10"
        ></div>
      </div>
    </div>
  );
}
