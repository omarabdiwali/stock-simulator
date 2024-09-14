import { IoSwapVertical, IoCash } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Spinner from "@/components/spinner";
import Toolbar from "@/components/toolbar";
import SellModal from "@/components/sellModal";
import GetKey from "@/components/getKey";
import Head from "next/head";

export default function Page() {
  const { data: _, status } = useSession();
  
  const [showingStocks, setShowingStocks] = useState([]);
  const [stockAmount, setStockAmount] = useState({});
  const [allSort, setAllSort] = useState("Symbol");
  const [sortBy, setSortBy] = useState("Symbol");
  
  const [allStocks, setAllStocks] = useState([]);
  const [certStock, setCertStock] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [noKey, setNoKey] = useState(false);

  let prev = "";
  let total = 0;
  let count = 0;
  let amount = 0;
  let spent = 0;
  let current = 0;

  const sortingOrder = (stock, stock1, value = null, value1 = null) => {
    if (stock > stock1) {
      return 1;
    } else if (stock1 > stock) {
      return -1;
    } else {
      return (value > value1 ? 1 : -1);
    }
  }

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      window.location.href = "/";
      return;
    }

    const getPrices = async (stock) => {
      return await fetch("/api/price", {
        method: "POST",
        body: JSON.stringify({ stock: stock.stock, kind: stock.kind })
      }).then(res => res.json()).then(data => { return data; })
        .catch(err => console.error(err));
    }

    const getAssetPrices = async (stocks) => {
      let stockTableData = [];
      let repStocks = [];
      let uniqStocks = {};
      let amountStock = {};

      await Promise.all(stocks.map(async (stock, _) => {
        const getData = async (stock) => {
          const data = await getPrices(stock);
          
          let assets = stock.amount * data.price;
          let prevTotal = stock.amount * stock.price;
          let total = assets - prevTotal;
          let stockData = { stock: stock.stock, symbol: stock.symbol, date: new Date(stock.date), amount: stock.amount, purPrice: stock.price, curPrice: data.price, profit: total };

          amountStock[stock.stock] = {};
          amountStock[stock.stock]["amount"] = stock.amount;
          amountStock[stock.stock]["kind"] = stock.kind ?? "stock";
          stockTableData.push(stockData);
          uniqStocks[stock.stock] = data.price
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
        
        let assets = stock.amount * price;
        let prevTotal = stock.amount * stock.price;
        let total = assets - prevTotal;
        let stockData = { stock: stock.stock, symbol: stock.symbol, date: new Date(stock.date), amount: stock.amount, purPrice: stock.price, curPrice: price, profit: total };

        stockTableData.push(stockData);
        amountStock[stock.stock]["amount"] += stock.amount;
      }

      setStockAmount(amountStock);
      return stockTableData
    }

    fetch("api/stocks/get").then(res => res.json()).then(data => {
      if (data.apiKey) {
        let stocks = data.stocks;
        getAssetPrices(stocks).then(data => {
          data.sort((stock, stock1) => (stock.symbol ?? stock.stock) > (stock1.symbol ?? stock1.stock) ? 1 : -1);
          setAllStocks(data);
          setShowingStocks(data);
          setLoaded(true);
        });
      }
      else {
        setNoKey(true);
        setLoaded(true);
      }
    }).catch(err => console.error(err));

  }, [status])

  const changeSort = (e) => {
    let prevStocks = [...showingStocks];
    setLoaded(false);

    prevStocks.sort((stock, stock1) => {
      const stockName = stock.symbol ?? stock.stock;
      const stockName1 = stock1.symbol ?? stock1.stock;

      if (e.target.value === "Symbol") {
        return sortingOrder(stockName, stockName1, stock.date, stock1.date);
      } else if (e.target.value === "Date") {
        return sortingOrder(stock1.date, stock.date, stockName, stockName1);
      } else if (e.target.value === "Purchase Amount") {
        return sortingOrder(stock1.amount, stock.amount, stockName, stockName1);
      } else if (e.target.value === "Company Amount") {
        return sortingOrder(stockAmount[stock1.stock], stockAmount[stock.stock], stockName, stockName1);
      } else if (e.target.value === "Purchase") {
        return sortingOrder(stock1.purPrice, stock.purPrice, stockName, stockName1);
      } else if (e.target.value === "Current") {
        return sortingOrder(stock1.curPrice, stock.curPrice, stockName, stockName1);
      } else if (e.target.value === "Profit") {
        return sortingOrder(stock1.profit, stock.profit, stockName, stockName1);
      } else {
        return sortingOrder(stock1.amount * stock1.purPrice, stock.amount * stock.purPrice, stockName, stockName1);
      }
    })

    if (showingStocks.length === allStocks.length) {
      setAllStocks(prevStocks);
      setAllSort(e.target.value);
    }

    setShowingStocks(prevStocks);
    setSortBy(e.target.value);
    setLoaded(true);
  }

  const onChange = (e) => {
    setCertStock(e.target.value);
    let prevStock = [...allStocks];
    prevStock = prevStock.filter((stock) => {
      const stockName = stock.symbol ?? stock.stock;
      return stockName.indexOf(e.target.value.toUpperCase()) > -1
    });
    if (sortBy !== allSort) {
      setSortBy(allSort);
    }
    setShowingStocks(prevStock);
  }

  const reverseTable = () => {
    let prevStock = [...showingStocks];
    prevStock.reverse();
    setShowingStocks(prevStock);
  }

  if (noKey && loaded) {
    return (
      <>
        <Head>
          <title>Portfolio | Stonks</title>
        </Head>
        <GetKey />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Portfolio | Stonks</title>
      </Head>
      <Toolbar />
      
      {loaded ? 
        <div>
          <div className="flex m-7 mr-4 text-md justify-end space-x-3">
            <div className={`flex-1 m-auto ${JSON.stringify(stockAmount) == "{}" ? "hidden" : ""}`}>
              <SellModal stocks={stockAmount} button={<IoCash className="text-2xl" />} className={"text-black dark:text-slate-400"} />
            </div>
            <input onChange={onChange} className="focus:outline-none px-3 py-1 border-slate-700 bg-inherit rounded-2xl" type="text" value={certStock} placeholder="Find symbol..."></input>
            <div className="m-auto">Sort By:</div>
            <select value={sortBy} onChange={changeSort} className="text-white text-sm bg-black focus:outline-none">
              <option value={"Symbol"}>Symbol</option>
              <option value={"Date"}>Date</option>
              <option value={"Purchase Amount"}>Amount by Purchase</option>
              <option value={"Company Amount"}>Amount by Company</option>
              <option value={"Purchase"}>Purchase Price</option>
              <option value={"Current"}>Current Price</option>
              <option value={"Profit"}>Profit</option>
              <option value={"Total"}>Total Spent</option>
            </select>
            <button onClick={reverseTable}><IoSwapVertical className="text-xl" /></button>
          </div>
          <table className="border-collapse table-auto w-full">
            <thead>
              <tr>
                <th className="border-b dark:border-slate-600 font-medium p-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Symbol</th>
                <th className="border-b dark:border-slate-600 font-medium p-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Date</th>
                <th className="border-b dark:border-slate-600 font-medium p-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Purchase Price</th>
                <th className="border-b dark:border-slate-600 font-medium p-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Current Price</th>
                <th className="border-b dark:border-slate-600 font-medium p-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Amount</th>
                <th className="border-b dark:border-slate-600 font-medium p-4 pr-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-slate-200 dark:bg-slate-800">
              {showingStocks.map((stock, i) => {
                let alreadyIn = prev === stock.stock;
                let positive = stock.profit >= 0;
                let displayName = stock.symbol ?? stock.stock;
                
                prev = stock.stock;
                total += stock.profit;
                count += 1;
                amount += stock.amount;
                spent += (stock.amount * stock.purPrice);
                current += (stock.amount * stock.curPrice);

                return (
                  <tr key={i}>
                    {/* <td className="border-b border-slate-300 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{!alreadyIn ? <a className="hover:underline" href={`/symbol/${stock.stock}`}>{stock.stock}</a> : ""}</td> */}
                    <td className="border-b border-slate-300 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{!alreadyIn ? displayName : ""}</td>
                    <td className="border-b border-slate-300 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{stock.date.toLocaleString()}</td>
                    <td className="border-b border-slate-300 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{new Intl.NumberFormat('en-us', { style: "currency", currency: "USD" }).format(stock.purPrice)}</td>
                    <td className="border-b border-slate-300 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{new Intl.NumberFormat('en-us', { style: "currency", currency: "USD" }).format(stock.curPrice)}</td>
                    <td className="border-b border-slate-300 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{new Intl.NumberFormat().format(stock.amount)}</td>
                    <td className={`border-b ${positive ? "text-green-500" : "text-red-500"} border-slate-300 dark:border-slate-700 p-4 pr-8`}>{positive ? "+" : ""}{new Intl.NumberFormat('en-us', { style: "currency", currency: "USD" }).format(stock.profit)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="font-extrabold">
                <td className="p-4 text-slate-500 dark:text-slate-400">TOTAL</td>
                <td className="p-4 text-slate-500 dark:text-slate-400"></td>
                <td className="p-4 text-slate-500 dark:text-slate-400">
                  {new Intl.NumberFormat('en-us', { style: "currency", currency: "USD" }).format(spent)}
                </td>
                <td className="p-4 text-slate-500 dark:text-slate-400">
                  {new Intl.NumberFormat('en-us', { style: "currency", currency: "USD" }).format(current)}
                </td>
                <td className="p-4 text-slate-500 dark:text-slate-400">{new Intl.NumberFormat().format(amount)}</td>
                <td className={`${total >= 0 ? "text-green-500" : "text-red-500"} p-4 pr-8`}>
                  {new Intl.NumberFormat('en-us', { style: "currency", currency: "USD" }).format(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      : <Spinner />}
    </>
  )
}

// layout changes at 600px