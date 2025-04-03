import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center text-white">
        <h1 className="mb-10 text-6xl">ANOTHER TO DO APP...BUT</h1>
        <div className="mb-10 text-xl">You can play bulls and cows!</div>
        <div className="flex flex-col items-center relative overflow-visible">
          <Link href={"/signup"}>
            <button className="signup-button" type="button">
              Sign Up
            </button>
          </Link>

          <div className="mt-5 ">
            <Image
              src="/cow.png"
              alt="cow"
              width={120}
              height={120}
              className="cow pl-5"
            />
          </div>
          <div className="glow-div"></div>
        </div>
      </div>
    </div>
  );
}
