import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Toolbar() {
  const { data: _, status } = useSession();
  const [search, setSearch] = useState("");

  const changeSearch = (e) => {
    setSearch(e.target.value);
  } 
  
  const findSearch = (e) => {
    e.preventDefault();
    if (search.trim().length == 0) return;

    window.location.href = `/search/${search.trim()}`;
  }

  return (
    <nav>
      <div className={`my-5 flex flex-row space-x-5 text-black m-3 h-8`}>
        <Link href="/" className="cursor-pointer text-xl dark:text-teal-400 text-teal-600 font-extrabold">
          Stonks
        </Link>
        <div className={`flex flex-1 flex-row justify-end ${status === "loading" ? "hidden" : ""}`}>
          <form onSubmit={findSearch}>
            <input onChange={changeSearch} value={search} className={`dark:text-white px-3 py-1 focus:outline-none border border-2 border-gray-400 dark:border-slate-800 rounded-lg bg-inherit ${status === "unauthenticated" ? "hidden" : ""}`} type="text" placeholder="Find stocks..."></input>
          </form>
          <div className={`${status === "unauthenticated" ? "hidden" : ""} m-auto mx-4 bg-inherit dark:text-white`}>
            <Link href="/portfolio" className="dark:text-slate-500 hover:underline">Portfolio</Link>
          </div>
          <div className={`${status === "unauthenticated" ? "hidden" : ""} m-auto mx-3 pr-3 bg-inherit dark:text-white`}>
            <Link href="/changeKey" className="dark:text-slate-500 hover:underline">API Key</Link>
          </div>
          <button onClick={() => status === "authenticated" ? signOut() : signIn('google')} className="cursor-pointer bg-slate-200 dark:bg-slate-900 dark:text-white font-semibold px-5 rounded shadow">
            {status === "authenticated" ? "Logout" : "Login"}
          </button>
        </div>
      </div>
    </nav>
  )
}