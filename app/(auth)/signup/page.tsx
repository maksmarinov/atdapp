"use client";
import "../../globals.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { signUp } from "../../actions/authenticate";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const form = event.currentTarget as HTMLFormElement;
      const userData = new FormData(form);

      const result = await signUp(userData);

      if (!result.success) {
        toast.error(result.error || "Signup failed");
        setIsSubmitting(false);
      } else {
        toast.success("Signup successful!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-200 w-full items-center justify-start pt-[2rem] flex-col ">
      <Toaster position="top-center" />
      <div className="mb-4 flex flex-row">
        <div className="border-b-2 mx-2.5">SIGN UP</div>
        <Link className="mx-2.5" href={"/signin"}>
          SIGN IN
        </Link>
      </div>

      <form
        className="flex flex-col border-2 rounded-xl border-lime-500 p-4"
        onSubmit={handleSubmit}
      >
        Email
        <input
          className="input-field"
          type="email"
          name="email"
          id="email"
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
          className="font-bold border-2 rounded px-1 cursor-pointer "
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
