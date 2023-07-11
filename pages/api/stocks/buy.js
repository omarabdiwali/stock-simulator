import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import dbConnect from "@/utils/dbConnect";
import Users from "@/models/Users";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  const getPrice = async (symbol, key) => {
    return await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`)
      .then(resp => resp.json())
      .then(data => { return data })
      .catch(err => {
        console.error(err);
        res.status(500).json({ type: "error", answer: "Error fetching price." });
      });
  }

  if (!session || !req.body) {
    res.redirect("/");
    return;
  }

  const { stock, amount } = JSON.parse(req.body);
  const profile = session.user;

  let query = { email: profile.email };

  await dbConnect();
  let user = await Users.findOne(query);

  if (!user || user.apiKey.length == 0) {
    res.redirect("/");
    return;
  }

  let priceData = await getPrice(stock, user.apiKey);
  const price = priceData['c'];

  let stockData = { stock: stock, price: price, amount: amount, date: new Date() };

  if (user.cash > price * amount) {
    user.cash -= (price * amount);
    user.stocks.push(stockData);
    user.save();

    res.status(200).json({ type: "success", price: price, cash: user.cash, answer: `Bought ${new Intl.NumberFormat().format(amount)} ${stock} ${amount > 1 ? "stocks" : "stock"}!` });
  }
  
  else {
    res.status(200).json({ type: "error", price: price, cash: user.cash, answer: "Insufficient funds." });
  }
}