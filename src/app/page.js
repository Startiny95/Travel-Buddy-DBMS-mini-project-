import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div>
        Get Started with Travel Diary
      </div>
      <Link href="/login">
        <button className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-heading rounded-base group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
          <span className="relative px-4 py-2.5 transition-all ease-in duration-75 bg-neutral-primary-soft rounded-base group-hover:bg-transparent group-hover:dark:bg-transparent leading-5">
            Login
          </span>
        </button>
      </Link>
    </div>
  );
}
