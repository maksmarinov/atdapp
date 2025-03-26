"use client";
import Link from "next/link";
import { signIn } from "@/app/actions/authenticate";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import GoogleAuth from "@/app/components/GoogleAuth";

export default function SigninPage() {
  const router = useRouter();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const userData = new FormData(form);

    const result = await signIn(userData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Sign in successful!");
      router.push("/dashboard");
    }
  };
  return (
    <div className="flex h-200 w-full items-center justify-start flex-col pt-50">
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
          className="font-bold border-2 px-1 cursor-pointer"
          type="submit"
        >
          Sign In
        </button>
      </form>
      <div className="relative flex py-3 items-center w-60">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <GoogleAuth mode="signin" />
    </div>
  );
}
