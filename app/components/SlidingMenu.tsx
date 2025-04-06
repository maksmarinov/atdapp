"use client";
import { signOut } from "../actions/authenticate";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SlidingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        buttonRef.current &&
        buttonRef.current.contains(event.target as Node)
      ) {
        return;
      }

      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 text-2xl font-extrabold left-1 z-50 bg-neutral-900/40 py-1 px-2 cursor-pointer rounded-sm"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? "X" : "☰"}
      </button>

      <div
        ref={menuRef}
        className={`fixed top-0 left-0 h-screen w-64 bg-neutral-900/90 p-10 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-8/10"
        } z-40`}
      >
        <div className="py-10 font-extrabold text-6xl mb-8">menu</div>

        <ul className="space-y-4" style={{ color: "#C7F9CC" }}>
          <li className="font-bold px-2 py-1 rounded-sm">
            <Link
              href="/dashboard"
              style={{
                color: pathname === "/dashboard" ? "#2bff00" : "#ffffff",
                textDecoration:
                  pathname === "/dashboard" ? "none" : "underline",
              }}
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
          </li>
          <li className="font-bold px-2 py-1 rounded-sm">
            <Link
              href="/game"
              style={{
                color: pathname === "/game" ? "#2bff00" : "#ffffff",
                textDecoration: pathname === "/game" ? "none" : "underline",
              }}
              onClick={() => setIsOpen(false)}
            >
              Play Bulls&Cows
            </Link>
          </li>
          <li className="font-bold px-2 py-1 rounded-sm">
            <Link
              href="/profile"
              style={{
                color: pathname === "/profile" ? "#2bff00" : "#ffffff",
                textDecoration: pathname === "/profile" ? "none" : "underline",
              }}
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
          </li>
        </ul>
        <form action={signOut} className="mt-8">
          <button
            type="submit"
            className="px-4 font-extrabold py-2 bg-black rounded-sm hover:opacity-90 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </form>
        <div
          id="gradientSlide"
          className="absolute top-0 right-0 h-full w-2 gradient-slide z-10"
        ></div>
      </div>
    </>
  );
}
