import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import dbConnect from "@/utils/dbConnect";
import Users from "@/models/Users";
import { getCryptoPrice, getStockPrice } from "@/utils/common";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !req.body) {
    res.status(500).json({ type: "error", answer: "Error fetching price." });
    return;
  }

  await dbConnect();
  const { stock, kind } = JSON.parse(req.body);
  const profile = session.user;
  const query = { email: profile.email };
  const user = await Users.findOne(query);
  
  if (user) {
    if (user.apiKey) {
      let priceData, previous, price;
      if (kind == "crypto") {
        priceData = await getCryptoPrice(stock);
        price = priceData[stock]['usd'];
        previous = price - (price * priceData[stock]["usd_24h_change"] / 100);
      } else {
        priceData = await getStockPrice(stock, user.apiKey);
        previous = priceData.pc;
        price = priceData.c;
      }
      if (priceData['error']) {
        res.status(200).json({ type: "error", answer: "Invalid API key." });
      } else {
        res.status(200).json({ type: "success", price: price, previous: previous, cash: user.cash });
      }
    } else {
      res.status(200).json({ type: "error", answer: "Invalid API key." });
    }
  } else {
    res.status(200).json({ type: "error", answer: "User is not created." });
  }
}