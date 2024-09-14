import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import dbConnect from "@/utils/dbConnect";
import Users from "@/models/Users";
import { capitalizeFirstLetter, getCryptoPrice, getResponse, getStockPrice } from "@/utils/common";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !req.body) {
    res.redirect("/");
    return;
  }

  const { stock, kind, amount } = JSON.parse(req.body);
  const profile = session.user;

  let query = { email: profile.email };

  await dbConnect();
  let user = await Users.findOne(query);

  if (!user || user.apiKey.length == 0) {
    res.redirect("/");
    return;
  }

  const response = `Bought ${new Intl.NumberFormat().format(amount)} ${capitalizeFirstLetter(stock)}${getResponse(amount, kind)}`;
  let stockData;
  let price;

  if (kind == "crypto") {
    let priceData = await getCryptoPrice(stock);
    price = priceData[stock]['usd'];
    stockData = { stock: stock, kind: "crypto", price: price, amount: amount, date: new Date() };
  } else {
    let priceData = await getStockPrice(stock, user.apiKey);
    price = priceData['c'];
    stockData = { stock: stock, kind: "stock", price: price, amount: amount, date: new Date() };
  }

  if (user.cash > price * amount) {
    user.cash -= (price * amount);
    user.stocks.push(stockData);
    user.save();

    res.status(200).json({ type: "success", price: price, cash: user.cash, answer: response });
  }
  
  else {
    res.status(200).json({ type: "error", price: price, cash: user.cash, answer: "Insufficient funds." });
  }
}