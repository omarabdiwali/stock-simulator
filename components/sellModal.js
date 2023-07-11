import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react"

export default function SellModal({ stocks, button, className }) {
  const [disabled, setDisabled] = useState(true);
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [max, setMax] = useState(0);

  useEffect(() => {
    let first = Object.keys(stocks)[0];
    setMax(stocks[first]);
    setSymbol(first);
    setDisabled(false);
  }, [stocks])

  const sellStock = () => {
    if (amount == 0) {
      enqueueSnackbar("Invalid Amount.", { autoHideDuration: 3000, variant: "info" });
      return;
    }

    setAmount(Number(amount));

    setDisabled(true);
    fetch("/api/stocks/sell", {
      method: "POST",
      body: JSON.stringify({ symbol: symbol, amount: amount })
    }).then(res => res.json()).then(data => {
      if (data.type === "success") {
        setOpen(false);
        setAmount("");
        enqueueSnackbar(data.answer, { autoHideDuration: 3000, variant: data.type });
        setMax(data.amount);
        setDisabled(false);
        
        setInterval(() => window.location.reload(), 1500);
      }
      else {
        enqueueSnackbar(data.answer, { autoHideDuration: 3000, variant: data.type });
        setMax(data.amount);
        setDisabled(false);
      }
    }).catch(err => console.error(err));
  }

  const closeModal = () => {
    setAmount("");
    setOpen(false);
  }

  const changeSymbol = (e) => {
    setSymbol(e.target.value);
    setMax(stocks[e.target.value]);
    
    if (amount > stocks[e.target.value]) {
      setAmount(stocks[e.target.value]);
    }
  }
  const changeAmount = (e) => {    
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

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {button}
      </button>

      <div className={`cursor-auto text-white ${!open ? "hidden" : ""} z-50`}>
        <div className={`absolute flex h-screen inset-0 z-50 transition-all duration-300 delay-150 ease-in-out ${!open ? "opacity-0 hidden" : "opacity-100"} w-full overflow-x-hidden overflow-y-auto md:inset-0 h-96 max-h-full`}>
          <div className="relative m-auto w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow bg-slate-700">
              <div className="text-2xl font-bold p-3 m-3">Sell Stocks</div>
              <div className="flex space-x-5 flex-row m-5">
                <div>Stock:</div>
                <select value={symbol} onChange={changeSymbol} className="w-1/3 focus:outline-none text-white text-sm bg-slate-700">
                  {Object.keys(stocks).map((key, i) => {
                    return <option value={key} key={i}>{key}</option>
                  })}
                </select>
                <div className="opacity-50 mx-5">Max: {new Intl.NumberFormat().format(max)}</div>
              </div>
              <div className="flex m-5 space-x-5 flex-row m-5">
                <div>Amount:</div>
                <input className="focus:border-light-blue-500 focus:ring-1 focus:ring-light-blue-500 focus:outline-none w-full text-sm text-black placeholder-gray-500 border border-gray-200 rounded-md py-2 pl-10 p-3" type="number" value={amount} onChange={changeAmount} max={max} min={0} aria-label="Amount" placeholder="Select Amount..." />
              </div>
              <div className="flex items-center justify-end p-6 space-x-2 rounded-b border-gray-600">
                <button disabled={disabled} className="disabled:opacity-75 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-black text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800" onClick={sellStock}>Sell</button>
                <button className="focus:ring-4 focus:outline-none rounded-lg border text-sm font-medium px-5 py-2.5 focus:z-10 bg-gray-700 text-gray-300 border-gray-500 hover:text-white hover:bg-gray-600 focus:ring-gray-600" onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`ml-0 cursor-auto w-full opacity-25 fixed inset-0 z-10 bg-black ${!open ? "hidden" : ""}`}></div>
    </>
  )
}