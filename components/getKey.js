import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import Toolbar from "./toolbar";

export default function GetKey() {
  const [apiKey, setApiKey] = useState("");
  const [disabled, setDisabled] = useState(false);

  const changeKey = (e) => {
    setApiKey(e.target.value);
  }

  const verifyKey = (e) => {
    e.preventDefault();

    if (apiKey.length == 0 || disabled) return;
    setDisabled(true);

    fetch("/api/setKey", {
      method: "POST",
      body: JSON.stringify({ key: apiKey.trim() })
    }).then(res => res.json()).then(data => {
      if (data.type === "success") {
        enqueueSnackbar(data.answer, { autoHideDuration: 3000, variant: data.type });
        if (window.location.href.includes("/changeKey")) {
          setTimeout(() => window.location.href = "/", 1000);
        } else {
          setTimeout(() => window.location.reload(), 1000);
        }
      }
      
      else {
        enqueueSnackbar(data.answer, { autoHideDuration: 3000, variant: data.type });
        setDisabled(false);
      }
    })
  }

  return (
    <div>
      <Toolbar />
      <div className="flex h-screen">
        <form onSubmit={verifyKey} className="w-1/2 m-auto">
          <div className="mb-5 text-2xl">
            <a className="hover:underline" target="__blank" href="https://finnhub.io/">Finnhub API Key</a>
            <div className="opacity-70 text-sm">{`Type "public" to use public key (limited to 30 calls/second)`}</div>
          </div>
          <input className="w-full dark:text-white px-3 py-1 focus:outline-none border border-2 border-gray-400 dark:border-slate-800 rounded-lg bg-inherit" type="text" value={apiKey} placeholder="API key..." onChange={changeKey} />
        </form>
      </div>
    </div>
  )
}