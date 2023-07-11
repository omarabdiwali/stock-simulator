import { useSession } from "next-auth/react";
import { useEffect } from "react"

export default function Stock({ symbol, desc }) {
  const { data: _, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      window.location.href = "/";
      return;
    }
  }, [status])

  return (
    <div className={`mx-5 flex w-1/4 shadow-2xl h-60 border-2 dark:border-white border-black rounded-xl`}>
      <form className="flex-auto p-6 pb-0">
        <div className="flex flex-wrap h-8">
          <h1 className="flex-auto text-xl font-semibold">
            {symbol}
          </h1>
        </div>
        <div className="flex h-20 overflow-y-auto items-baseline mt-4 mb-6">
          {desc}
        </div>
        <div className="flex h-10 space-x-3 text-sm font-medium">
          <div className="flex-auto flex space-x-3">
            <a className="flex-1" href={`/symbol/${symbol}`}>
              <div className="w-full flex h-full disabled:opacity-60 hover:bg-slate-600 h-10 items-center justify-center rounded-md bg-black text-white">
                <div className="m-auto">Buy Now</div>
              </div>
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}