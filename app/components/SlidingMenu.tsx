"use client";

import { useState } from "react";

export default function SlidingMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 font-extrabold border-2 text-violet-800 left-4 z-50 bg-neutral-900 py-1 px-2 cursor-pointer rounded-lg"
      >
        {isOpen ? "X" : "☰"}
      </button>

      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-neutral-900 p-10 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-5/6"
        } z-40`}
      >
        <div className="py-10 font-extrabold underline text-white text-3xl mb-8">
          menu
        </div>

        <ul className="space-y-4 text-white">
          <li className="font-bold">Dashboard</li>
          <li className="font-bold">Settings</li>
          <li className="font-bold">Profile</li>
        </ul>

        {/* Positioned at the right edge of the menu */}
        <div
          id="gradientSlide"
          className="absolute top-0 right-0 h-full w-2 gradient-slide z-10"
        ></div>
      </div>
    </div>
  );
}
