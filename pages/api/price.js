import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import dbConnect from "@/utils/dbConnect";
import Users from "@/models/Users";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !req.body) {
    res.status(500).json({ type: "error", answer: "Error fetching price." });
    return;
  }

  const getStockPrice = async (symbol, key) => {
    let url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`;
    return await fetch(url).then(res => res.json())
      .then(data => { return data; })
      .catch(err => {
        console.error(err);
        res.status(500).json({ type: "error", answer: "Error fetching price." });
      })
  }

  await dbConnect();
  const { stock } = JSON.parse(req.body);
  const profile = session.user;
  const query = { email: profile.email };
  const user = await Users.findOne(query);
  
  if (user) {
    if (user.apiKey) {
      const priceData = await getStockPrice(stock, user.apiKey);
      if (priceData['error']) {
        res.status(200).json({ type: "error", answer: "Invalid API key." });
      } else {
        res.status(200).json({ type: "success", price: priceData['c'], previous: priceData['pc'], cash: user.cash });
      }
    } else {
      res.status(200).json({ type: "error", answer: "Invalid API key." });
    }
  } else {
    res.status(200).json({ type: "error", answer: "User is not created." });
  }
}