"use client";
import "../../globals.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { signUp } from "../../actions/authenticate";

export default function SignupPage() {
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const userData = new FormData(form);

    const result = await signUp(userData);

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
          className="font-bold border-2 px-1 cursor-pointer"
          type="submit"
        >
          Sign Up
        </button>
      </form>
      <div className="relative flex py-3 items-center w-full">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <button
        type="button"
        className="mt-4 w-full flex items-center justify-center gap-2 font-semibold border-2 border-gray-300 bg-white text-gray-700 py-2 px-4 rounded hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out" // Google-like button styling
      >
        {" "}
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
        Sign in with Google
      </button>
    </div>
  );
}
