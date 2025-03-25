import Image from "next/image";
import Link from "next/link";
import { mockFetch } from "./utils/mockFetch";

export default async function Home() {
  const data = await mockFetch("", 1000);
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center text-white">
        <h1 className="mb-10 text-6xl">ANOTHER TO DO APP...BUT</h1>
        <div className="mb-10 text-xl">You can play bulls and cows!</div>
        <div className="flex flex-col items-center relative overflow-visible">
          {/* Wrap the button with the Link */}
          <Link href={"/signup"}>
            <div className="relative">
              <button className="signup-button" type="button">
                <div className="glow-div"></div>
                Sign Up
              </button>
            </div>
          </Link>

          <div className="mt-5">
            <Image
              src="/cow.png"
              alt="cow"
              width={120}
              height={120}
              className="cow"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
