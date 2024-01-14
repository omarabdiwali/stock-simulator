import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Spinner from "@/components/spinner";
import Toolbar from "@/components/toolbar";
import GetKey from "@/components/getKey";
import Head from "next/head";

export default function Home() {
  const { data: _, status } = useSession();
  const [assets, setAssets] = useState(0);
  const [cash, setCash] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [noKey, setNoKey] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setLoaded(true);
      return;
    }

    const getPrices = async (stock) => {
      return await fetch("/api/price", {
        method: "POST",
        body: JSON.stringify({ stock: stock.stock })
      }).then(res => res.json()).then(data => { return data; })
        .catch(err => console.error(err));
    }

    const getAssetPrices = async (stocks) => {
      let assets = 0;
      let uniqStocks = {};
      let repStocks = [];

      await Promise.all(stocks.map(async (stock, _) => {
        const getData = async (stock) => {
          const data = await getPrices(stock);
          assets += stock.amount * data.price;
          uniqStocks[stock.stock] = data.price;
        }

        if (!isNaN(uniqStocks[stock.stock])) {
          repStocks.push(stock);
        } else {
          uniqStocks[stock.stock] = 0;
          await getData(stock);
        }
      }))

      for (let i = 0; i < repStocks.length; i++) {
        const stock = repStocks[i];
        const price = uniqStocks[stock.stock];
        assets += (price * stock.amount);
      }

      setAssets(assets);
      setLoaded(true);
    }

    fetch('/api/stocks/get').then(res => res.json())
    .then(data => {
      if (data.apiKey) {
        let stocks = data.stocks;
        setCash(data.cash);
        getAssetPrices(stocks);
      } else {
        setNoKey(true);
        setLoaded(true);
      }
    }).catch(err => console.error(err));
  }, [status])

  if (noKey && loaded) {
    return (
      <>
        <Head>
          <title>Stonks</title>
        </Head>
        <GetKey />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Stonks</title>
      </Head>
      <Toolbar />
      {loaded ?
        <div className="flex h-screen">
          <div className="flex space-y-6 w-full flex-col m-auto">
            <div className="text-7xl dark:text-teal-400 text-teal-600 m-auto font-extrabold">{new Intl.NumberFormat('en-us', { style: "currency", currency: "USD" }).format(cash + assets)}</div>
            <div className="flex m-auto space-x-8">
              <div className="flex flex-1 flex-col m-auto">
                <div className="text-lg m-auto">Available Cash</div>
                <div className="text-5xl font-bold text-green-500">{new Intl.NumberFormat('en-us', { style: "currency", currency: "USD" }).format(cash)}</div>
              </div>
              <div className="flex flex-col flex-1 justify-center">
                <div className="m-auto text-lg">Total Assets</div>
                <div className="text-5xl dark:text-cyan-300 text-cyan-500 font-bold">{new Intl.NumberFormat('en-us', { style: "currency", currency: "USD" }).format(assets)}</div>
              </div>
            </div>
          </div>
        </div> : <Spinner />}
    </>
  )
}

// layout changes at 525px