import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import dbConnect from "@/utils/dbConnect";
import Users from "@/models/Users";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    res.status(401).json({ error: "Not Allowed" });
    return;
  }

  const profile = session.user;

  let query = { email: profile.email };
  let data = { email: profile.email, name: profile.name, stocks: [], apiKey: "" };

  await dbConnect();
  let user = await Users.findOne(query);

  if (user) {
    res.status(200).json({ stocks: user.stocks, cash: user.cash, apiKey: user.apiKey });
  } else {
    await Users.create(data).catch(err => console.error(err));
    res.status(200).json({ stocks: [], cash: 25000, apiKey: "" });
  }
}