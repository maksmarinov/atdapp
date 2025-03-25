"use client";
import "../../globals.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { signupUser } from "../../actions/authenticate";

export default function SignupPage() {
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const userData = new FormData(form);

    const result = await signupUser(userData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Signup successful!");
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex h-200 w-full items-center justify-start flex-col pt-50">
      <div className="mb-4 flex flex-row">
        <div className="border-b-2 mx-2.5">SIGN UP</div>
        <Link className="mx-2.5" href={"/signin"}>
          SIGN IN
        </Link>
      </div>

      <form
        className="flex flex-col border-2 rounded-xl border-emerald-900 p-4"
        onSubmit={handleSubmit}
      >
        Email
        <input
          className="input-field"
          type="email"
          name="useremail"
          id="useremail"
          required
        />
        Username
        <input
          className="input-field"
          type="text"
          name="username"
          id="username"
          required
        />
        First Name
        <input
          className="input-field"
          type="text"
          name="name"
          id="name"
          required
        />
        Password
        <input
          className="input-field"
          type="password"
          name="password"
          id="password"
          required
        />
        Confirm Password
        <input
          className="input-field"
          type="password"
          name="password2"
          id="password2"
          required
        />
        <button
          className="font-bold border-2 px-1 cursor-pointer"
          type="submit"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
