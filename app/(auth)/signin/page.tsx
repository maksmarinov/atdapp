"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "@/app/actions/authenticate";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SigninPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    const form = event.currentTarget as HTMLFormElement;
    const userData = new FormData(form);

    const result = await signIn(userData);

    if (!result.success) {
      // Show the message from the response
      toast.error(result.message || "Sign in failed");
    } else {
      toast.success("Sign in successful!");
      router.push("/dashboard");
    }
  };
  return (
    <div className="flex h-200 w-full items-center justify-start flex-col pt-[2rem]">
      <Toaster position="top-center" />
      <div className=" mb-4 flex flex-row">
        <Link className="mx-2.5" href={"/signup"}>
          SIGN UP
        </Link>
        <div className="border-b-2 mx-2.5">SIGN IN</div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col border-2 rounded-xl border-emerald-900 p-4"
      >
        Email
        <input
          className="input-field"
          type="email"
          name="email"
          id="email"
          required
        />
        Password
        <input
          className="input-field"
          type="password"
          name="password"
          id="password"
        />
        <button
          className="font-bold border-2 px-1 rounded cursor-pointer"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
