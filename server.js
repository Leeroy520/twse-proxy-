const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

app.get("/stock/:id", async (req, res) => {
  try {
    const symbol = req.params.id + ".TW";
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const data = await response.json();
    const meta = data.chart.result[0].meta;
    res.json({
      id: req.params.id,
      price: meta.regularMarketPrice,
      open: meta.regularMarketOpen,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow,
      volume: meta.regularMarketVolume,
      change: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2)
    });
  } catch (err) {
    res.status(500).json({ error: "無法取得資料" });
  }
});

app.get("/stocks", async (req, res) => {
  const ids = (req.query.ids || "").split(",").filter(Boolean);
  try {
    const results = await Promise.all(ids.map(async (id) => {
      try {
        const symbol = id + ".TW";
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
        const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const data = await response.json();
        const meta = data.chart.result[0].meta;
        return {
          id,
          price: meta.regularMarketPrice,
          open: meta.regularMarketOpen,
          change: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2)
        };
      } catch { return { id, error: true }; }
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "無法取得資料" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
