import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Spinner from "@/components/spinner";
import Stock from "@/components/stock";
import Toolbar from "@/components/toolbar";
import Head from "next/head";
import GetKey from "@/components/getKey";

export default function Page() {
  const router = useRouter();
  
  const [curValue, setCurValue] = useState("");
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [perfectMatch, setPerfectMatch] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [noKey, setNoKey] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const getKey = async () => {
      return await fetch('/api/stocks/get')
        .then(res => res.json()).then(data => {
          if (data.error) {
            return 2;
          }
          else {
            if (data.apiKey) {
              return 1;
            } else {
              return 0;
            }
          }
      })
    }

    let search = router.query.value;
    setCurValue(`'${search}'`);

    search = search.replace(/\\/g, String.raw`\\`);

    getKey().then(verified => {
      if (verified == 1) {
        fetch('/api/search', {
          method: "POST",
          body: JSON.stringify({ search: search })
        }).then(res => res.json()).then(data => {
          setStocks(data.stocks);
          setPerfectMatch(data.perfectMatch);
          setCrypto(data.crypto);
          setCompleted(true);
        }).catch(err => console.error(err));
      } else if (verified == 0) {
        setNoKey(true);
        setCompleted(true);
      } else {
        window.location.href = "/";
      }
    })

  }, [router.isReady, router.query])

  if (noKey && completed) {
    return (
      <>
        <Head>
          <title>Stocks | Stonks</title>
        </Head>
        <GetKey />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{`${curValue} Stocks | Stonks`}</title>
      </Head>
      <Toolbar />
      {completed ?
        <>
          <center>
            <div className="text-2xl m-5">{`Result(s) for ${curValue}`}</div>
          </center>
          <div className="flex justify-center space-y-3 m-auto flex-wrap">
            <div></div>
            {perfectMatch.map((item, i) => {
              const isStock = item.kind ? false : true;
              const desc = isStock ? item[1] : item.name;
              const symbol = isStock ? item[0] : item.symbol;
              const id = isStock ? item[0] : item.id;
              const kind = isStock ? item[-1] : item.kind;
              return <Stock key={`match-${i}`} desc={desc} symbol={symbol} id={id} kind={kind} />
            })}
            {stocks.map((stock, i) => {
              return <Stock key={`stock-${i}`} desc={stock[1]} symbol={stock[0]} id={stock[0]} kind={"stock"} />
            })}
            {crypto.map((coin, i) => {
              return <Stock key={`coin-${i}`} desc={coin.name} symbol={coin.symbol} id={coin.id} kind={"crypto"} />
            })}
          </div>
        </>
        : <Spinner /> }
    </>
  )
}