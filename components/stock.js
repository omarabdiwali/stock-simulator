import { useSession } from "next-auth/react";
import Link from "next/link";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react"

export default function Stock({ symbol, desc }) {
  const { data: _, status } = useSession();

  const [disabled, setDisabled] = useState(true);
  const [amount, setAmount] = useState("");
  const [buy, setBuy] = useState(false);
  const [price, setPrice] = useState();
  const [cash, setCash] = useState(0);
  const [max, setMax] = useState(0);
  const [apiKey, setApiKey] = useState("");

  const getSymbolData = async (e) => {
    e.preventDefault();
    setDisabled(true);

    const getPrices = async (symbol) => {
      return await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`)
        .then(resp => resp.json())
        .then(data => { return data })
        .catch(err => console.error(err));
    }

    let pricesData = await getPrices(symbol);
    setPrice(pricesData['c']);
    setMax(Math.floor(cash / pricesData['c']));
    setDisabled(false);
    setBuy(true);
  }

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      window.location.href = "/";
      return;
    }

    fetch('/api/stocks/get').then(res => res.json()).then(data => {
      if (data.error) {
        window.location.href = "/";
      } else {
        setApiKey(data.apiKey);
        setCash(data.cash);
        setDisabled(false);
      }
    }).catch(err => console.error(err));
    
  }, [status])

  const changeAmount = (e) => {
    e.preventDefault();

    if (e.target.value > max) {
      setAmount(max);
    } else {
      if (e.target.value.length > 1 && e.target.value[0] == "0") {
        let value = e.target.value.substring(e.target.value.length - 1);
        setAmount(Math.round(value));
        e.target.value = value;
      } else {
        if (e.target.value == "") {
          setAmount(e.target.value);
        } else {
          let value = Math.round(e.target.value);
          if (value < 0) {
            setAmount(0);
            e.target.value = 0;
          } else {
            setAmount(value);
          }
        }
      }
    }
  }

  const buyStock = (e) => {
    e.preventDefault();
    if (amount == 0 || amount > max) {
      enqueueSnackbar("Invalid amount.", { autoHideDuration: 3000, variant: "info" });
      return;
    };

    setDisabled(true);

    fetch("/api/stocks/buy", {
      method: "POST",
      body: JSON.stringify({ stock: symbol, amount: amount })
    }).then(res => res.json()).then(data => {
      enqueueSnackbar(data.answer, { autoHideDuration: 3000, variant: data.type });
      
      setMax(Math.floor(data.cash / data.price));
      setPrice(data.price);
      setAmount("");
      setCash(data.cash);
      setDisabled(false);
    }).catch(err => console.error(err));
  }

  return (
    <div className={`${buy && price == 0 ? "hidden" : ""} mx-5 flex w-1/4 shadow-2xl h-60 border-2 dark:border-white border-black rounded-xl`}>
      <form className="flex-auto p-6 pb-0">
        <div className="flex flex-wrap h-8">
          <h1 className="flex-auto text-xl font-semibold">
            {symbol}
          </h1>
          <div className={`text-xl font-semibold text-gray-500 ${buy ? "" : "hidden"}`}>
            {buy && price >= 1 ? new Intl.NumberFormat('en-us', { style: "currency", currency: "USD" }).format(price) : buy ? `$${price}` : ""}
          </div>
        </div>
        <div className="flex h-20 overflow-y-auto items-baseline mt-4 mb-6">
          {buy ?
            <div className="w-full">
              <input className="focus:border-light-blue-500 focus:ring-1 focus:ring-light-blue-500 focus:outline-none w-full text-sm text-black placeholder-gray-500 border border-gray-200 rounded-md py-2 pl-10 p-3" type="number" value={amount} onChange={changeAmount} max={max} min={0} aria-label="Amount" placeholder="Select Amount..." />
              <div className="mt-3 opacity-60">Max: {new Intl.NumberFormat().format(max)}</div>
            </div>
            : desc}
        </div>
        <div className="flex h-10 space-x-3 text-sm font-medium">
          <div className="flex-auto flex space-x-3">
            <button disabled={disabled} className="w-full disabled:opacity-60 hover:bg-slate-600 h-10 flex-1 items-center justify-center rounded-md bg-black text-white" type="submit" onClick={!buy ? getSymbolData : buyStock}>Buy now</button>
            <Link className="flex-1" href={`/symbol/${symbol}`}>
              <div className="w-full flex h-full disabled:opacity-60 hover:bg-slate-600 h-10 items-center justify-center rounded-md bg-black text-white">
                <div className="m-auto">Chart</div>
              </div>
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}