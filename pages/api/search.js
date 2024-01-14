import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

const { parse } = require("csv-parse");
const fs = require("fs");

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !req.body) {
    res.status(405).redirect("/");
    return;
  }

  const { search } = JSON.parse(req.body);
  let csvData = [];
  let file = process.cwd() + `/public/files/nasdaqSymbols.csv`;
  const reader = fs.createReadStream(file).pipe(parse({ delimiter: ',', fromLine: 2 }));

  await new Promise(resolve => {
    reader.on('data', row => {
      let value = search.toLowerCase();
      let symbol = row[0].toLowerCase();
      let company = row[1].toLowerCase();
      
      if (symbol.indexOf(value) > -1 || company.indexOf(value) > -1) {
        if (csvData.length < 30 && symbol.indexOf('^') == -1) {
          csvData.push(row);
        }
      }
    })
      
    reader.on('end',() => {
      res.status(200).json({ stocks: csvData });
      resolve();
    });
  })
}