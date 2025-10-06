const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Lấy UserId từ Username
async function getUserId(username) {
  const url = `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=1`;
  const res = await axios.get(url);
  const data = res.data;
  if (data.data && data.data.length > 0) {
    return data.data[0].id;
  } else {
    return null;
  }
}

// Lấy GamePass cho UserId
async function getGamePasses(userId) {
  let allPasses = [];
  let cursor = null;

  while (true) {
    const url = `https://www.roproxy.com/users/inventory/list-json?assetTypeId=34&itemsPerPage=100&userId=${userId}` + (cursor ? `&cursor=${cursor}` : "");
    const res = await axios.get(url);
    const data = res.data;

    if (!data || !data.Data || !data.Data.Items) break;

    const items = data.Data.Items;
    for (const item of items) {
      if (item.Product && item.Product.IsForSale) {
        allPasses.push({
          id: item.Item.AssetId,
          name: item.Item.Name,
          price: item.Product.PriceInRobux,
        });
      }
    }

    if (!data.Data.nextPageCursor) break;
    cursor = data.Data.nextPageCursor;
  }

  return allPasses;
}

// Endpoint: /gamepasses/:username
app.get("/gamepasses/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const userId = await getUserId(username);
    if (!userId) return res.status(404).json({ error: "Không tìm thấy người dùng" });

    const passes = await getGamePasses(userId);
    const filtered = passes.filter(p => p.price && p.price > 0).sort((a,b) => a.price - b.price);

    res.json(filtered);
  } catch (err) {
    console.error("[Lỗi API]:", err.message);
    res.status(500).json({ error: "Không thể lấy dữ liệu" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server đang chạy trên port ${PORT}`));
