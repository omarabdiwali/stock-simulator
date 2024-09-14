import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import dbConnect from "@/utils/dbConnect";
import Users from "@/models/Users";
import { decimalAdjust, getCryptoPrice, getResponse, getStockPrice, sellStock } from "@/utils/common";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !req.body) {
    res.redirect("/");
    return;
  }

  const { symbol, kind, amount } = JSON.parse(req.body);
  const profile = session.user;

  let query = { email: profile.email };

  await dbConnect();
  let user = await Users.findOne(query);

  if (!user || user.apiKey.length == 0) {
    res.redirect("/");
    return;
  }

  let totalAmount = 0;
  let stockDataIndex = [];

  for (let i = 0; i < user.stocks.length; i++) {
    const stock = user.stocks[i];
    if (stock.stock == symbol) {
      stockDataIndex.push(i);
      totalAmount += stock.amount;
    }
  }

  if (totalAmount < amount && totalAmount != 0) {
    res.status(200).json({ type: "error", amount: totalAmount, answer: `Insufficient ${symbol} stock amount.` });
  }

  else if (totalAmount == 0) {
    res.status(200).json({ type: "error", answer: "Insufficient stocks." });
  }

  else {
    let price;
    if (kind == "crypto") {
      let priceData = await getCryptoPrice(symbol);
      price = priceData[symbol]['usd'];
    } else {
      let priceData = await getStockPrice(symbol, user.apiKey);
      price = priceData.c;
    }
    
    let index = 0;
    let remainingSell = amount;
    let correctStockIndex = stockDataIndex[index];
    let newStocks = user.stocks;

    while (remainingSell != 0) {
      let data = sellStock(correctStockIndex, remainingSell, newStocks);
      remainingSell = data[0], newStocks = data[1];
      index += 1;
      correctStockIndex = stockDataIndex[index]
    }

    user.stocks = newStocks.filter(stock => stock.amount > 0.00001);
    user.cash += (amount * price);
    user.save();

    res.status(200).json({ type: "success", amount: totalAmount - amount, answer: `Sold ${new Intl.NumberFormat().format(amount)} ${symbol}${getResponse(amount, kind)}` });
  }
}