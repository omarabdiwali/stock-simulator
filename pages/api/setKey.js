import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import dbConnect from "@/utils/dbConnect";
import Users from "@/models/Users";
import { getStockPrice } from "@/utils/common";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !req.body) {
    res.redirect("/");
    return;
  }

  const { key } = JSON.parse(req.body);
  const profile = session.user;
  await dbConnect();

  let query = { email: profile.email };
  let user = await Users.findOne(query);

  if (user) {
    let keyValue = key.toLowerCase() == "public" ? process.env.PUBLIC_KEY : key;
    
    if (user.apiKey == keyValue) {
      res.status(200).json({ type: "info", answer: "Value has not changed." })
      return;
    }
    
    let testData = await getStockPrice("AAPL", keyValue);
    
    if (testData['error']) {
      res.status(200).json({ type: "error", answer: "Invalid API key." });
    } else {
      user.apiKey = keyValue;
      user.save();
      res.status(200).json({ type: "success", answer: "API key added!" });
    }
  }

  else {
    res.status(200).json({ type: "error", answer: "User is not created." });
  }
}