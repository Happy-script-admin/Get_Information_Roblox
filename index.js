const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

// Proxy API lấy GamePass theo CreatorName
app.get("/gamepasses/:creator", async (req, res) => {
  const creator = req.params.creator;
  try {
    const response = await axios.get(`https://catalog.roproxy.com/v1/search/items/details?Category=3&CreatorName=${creator}`);
    const data = response.data.data
      .filter(item => item.price > 0)
      .sort((a, b) => a.price - b.price)
      .map(item => ({
        id: item.id,
        name: item.name,
        price: item.price
      }));

    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Không thể lấy dữ liệu" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server đang chạy trên port ${PORT}`));
