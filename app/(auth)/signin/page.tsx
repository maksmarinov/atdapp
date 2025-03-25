import Link from "next/link";
import { mockFetch } from "../../utils/mockFetch";

export default async function SigninPage() {
  const data = await mockFetch("", 1000);
  return (
    <div className="flex h-200 w-full items-center justify-start flex-col pt-50">
      <div className=" mb-4 flex flex-row">
        <Link className="mx-2.5" href={"/signup"}>
          SIGN UP
        </Link>
        <div className="border-b-2 mx-2.5">SIGN IN</div>
      </div>

      <form className="flex flex-col border-2 rounded-xl border-emerald-900 p-4">
        Username
        <input
          className="input-field"
          type="text"
          name="username"
          id="username"
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
    </div>
  );
}
