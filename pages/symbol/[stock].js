import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import GetKey from "@/components/getKey";
import Spinner from "@/components/spinner";
import Toolbar from "@/components/toolbar";
import dynamic from 'next/dynamic'
import Head from "next/head";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function Page() {
  const router = useRouter();
  
  const [disabled, setDisabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [noKey, setNoKey] = useState(false);
  const [error, setError] = useState(false);

  const [prevClose, setPrevClose] = useState(0);  
  const [current, setCurrent] = useState(0);
  const [max, setMax] = useState(0);
  
  const [options, setOptions] = useState({});
  const [series, setSeries] = useState([]);
  
  const [amount, setAmount] = useState("");
  const [symbol, setSymbol] = useState("");
  
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

  useEffect(() => {
    if (!router.isReady) return;
    let value = router.query.stock;
    
    setSymbol(value.toUpperCase());
    history.replaceState({}, "Title", `/symbol/${value.toUpperCase()}`);

    setOptions({
      chart: {
        type: 'candlestick'
      },
      title: {
        text: `${value.toUpperCase()} Chart`,
        align: 'left'
      },
      xaxis: {
        type: 'datetime'
      },
      yaxis: {
        tooltip: {
          enabled: true
        }
      },
      noData: {
        text: 'Loading...'
      }
    });

    const getValues = async (symbol, key) => {
      let date = new Date();
      let current = Math.round(date.getTime() / 1000);
      date.setFullYear(date.getFullYear() - 1);
      let past = Math.round(date.getTime() / 1000);
      
      return await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${past}&to=${current}&token=${key}`)
        .then(res => res.json()).then(data => { return data; }).catch(err => console.error(err));
    }

    const currentPrices = async (symbol, key) => {
      return await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`)
        .then(resp => resp.json())
        .then(data => { return data })
        .catch(err => console.error(err));
    }

    const readValues = async (symbol, key, cash) => {      
      const stockData = await getValues(symbol, key);
      let option = [];
      
      let closePrices = stockData['c'];
      let openPrices = stockData['o'];
      let highPrice = stockData['h'];
      let lowPrice = stockData['l'];
      let time = stockData['t'];

      if (stockData['s'] != "ok") {
        setError(true);
        setLoaded(true);
      }

      else {
        const todayPrices = await currentPrices(symbol, key);
        setMax(Math.round(cash / todayPrices['c']));
        setCurrent(todayPrices['c']);
        setPrevClose(todayPrices['pc']);

        await Promise.all(closePrices.map((close, i) => {
          const item = {
            x: new Date(time[i] * 1000),
            y: [openPrices[i].toFixed(2), highPrice[i].toFixed(2), lowPrice[i].toFixed(2), close.toFixed(2)]
          }
  
          return option.push(item);
        }))

        setSeries([{ data: option }]);
        setLoaded(true);
      }
    }
    
    fetch("/api/stocks/get").then(res => res.json())
      .then(data => {
        if (data.error) {
          window.location.href = "/";
        } else {
          if (data.apiKey) {
            readValues(value, data.apiKey, data.cash);
          } else {
            setNoKey(true);
            setLoaded(true);
          }
        }
    })

  }, [router.isReady, router.query])

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
      setCurrent(data.price);
      setDisabled(false);
      setAmount("");
    }).catch(err => console.error(err));
  }

  if (noKey && loaded) {
    return (
      <>
        <Head>
          <title>Chart - Stonks</title>
        </Head>
        <GetKey />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{`${symbol} Chart | Stonks`}</title>
      </Head>
      <Toolbar />
      {loaded ? 
        <>
          <div className="flex h-screen">
            <div className="m-auto">
              {!error ?
                <>
                  <div className="text-black">
                    <Chart series={series} options={options} type='candlestick' height={400} width={700} />
                  </div>
                  
                  <center>
                    <div className="text-xl">{current > 1 ? new Intl.NumberFormat('en-us', { style: "currency", currency: "USD" }).format(current) : `$${current.toPrecision(2)}`}</div>
                    <div className={`${current > prevClose ? "text-green-500" : prevClose > current ? "text-red-500" : "text-slate-300"} font-bold`}>
                      <span>{current > 1 ? `${current > prevClose ? "+" : ""}${(current - prevClose).toFixed(2)} ` : `${current > prevClose ? "+" : ""}${(current - prevClose).toPrecision(2)} `}</span>
                      <span>{`(${(Math.abs(current - prevClose) / prevClose * 100).toFixed(2)}%)`}</span>
                    </div>
                  </center>

                  <form onSubmit={buyStock} className="w-full mt-2 flex space-x-3">
                    <input className="dark:bg-gray-600 dark:border-black focus:border-light-blue-500 focus:ring-1 focus:ring-light-blue-500 focus:outline-none flex-1 text-sm text-black border border-gray-200 rounded-md pl-10" type="number" value={amount} onChange={changeAmount} max={max} min={0} aria-label="Amount" placeholder={`Max: ${new Intl.NumberFormat().format(max)}`} />
                    <button type="submit" disabled={disabled} className="disabled:opacity-60 rounded-lg bg-slate-400 dark:bg-slate-700 hover:bg-slate-600 hover:text-gray-200 dark:hover:text-black dark:hover:bg-slate-500 p-3 px-5">Buy</button>
                  </form>
                </>
                : <div className="text-3xl">Error Retrieving {symbol} Data.</div>}
            </div>
          </div>
        </>
      : <Spinner />}
    </>
  )
}