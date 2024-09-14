export const getStockPrice = async (symbol, key) => {
    return await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`)
      .then(resp => resp.json())
      .then(data => { return data })
      .catch(err => {
        console.error(err);
        res.status(500).json({ type: "error", answer: "Error fetching price." });
      });
  }

export const getCryptoPrice = async (symbol) => {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`;
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-cg-demo-api-key': process.env.CRYPTO_KEY }
    };

    return await fetch(url, options).then(res => res.json()).then(data => { return data }).catch(err => {
      console.error(err);
      res.status(500).json({ type: "error", answer: "Error fetching price." });
    })
}

export const decimalAdjust = (value) => {
    let type = "floor";
    let exp = -4;
    value = Number(value);
    if (exp % 1 !== 0 || Number.isNaN(value)) {
      return NaN;
    } else if (exp === 0) {
      return Math[type](value);
    }
    const [magnitude, exponent = 0] = value.toString().split("e");
    const adjustedValue = Math[type](`${magnitude}e${exponent - exp}`);
    // Shift back
    const [newMagnitude, newExponent = 0] = adjustedValue.toString().split("e");
    return Number(`${newMagnitude}e${+newExponent + exp}`);
}

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const getResponse = (amount, kind) => {
    if (amount > 1) {
      return kind === "crypto" ? "!" : " stocks!" 
    } else {
      return kind === "crypto" ? "!" : " stock!"
    }
}

export const sellStock = (index, amount, stocks) => {
    let stockData = stocks[index];

    if (amount > stockData.amount) {
        amount -= stockData.amount;
        stockData.amount = 0;
    } else {
        stockData.amount -= amount;
        amount = 0
    }

    stocks[index] = stockData;
    return [amount, stocks];
}

export const getValidCoins = (allCoins, perfectMatch, search) => {
    const coins = [];
    const uniqSymbols = new Set();
    for (let i = 0; i < allCoins.length; i++) {
      const coin = allCoins[i];
      const marketRank = coin["market_cap_rank"]
      if (marketRank == undefined || marketRank > 1000) {
        break;
      }

      if (!uniqSymbols.has(coin.symbol)) {
        if (coin.symbol.toLowerCase() == search.toLowerCase() || coin.name.toLowerCase() == search.toLowerCase()) {
          coin.kind = "crypto";
          perfectMatch.push(coin);
        } else {
          coins.push(coin);
        }
        uniqSymbols.add(coin.symbol);
      }
    }

    return coins;
}

export const getCryptoCoins = async (search, match) => {
    const url = `https://api.coingecko.com/api/v3/search?query=${search}`;
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-cg-demo-api-key': process.env.CRYPTO_KEY }
    };

    return await fetch(url, options).then(res => res.json()).then(data => {
      const allCoins = data["coins"];
      return getValidCoins(allCoins, match, search);
    }).catch(err => {
      console.error(err);
      res.status(500).json({ type: "error", answer: "Error fetching price." });
    })
}