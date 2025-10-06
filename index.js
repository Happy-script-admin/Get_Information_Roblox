const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Lấy UserId từ username
async function getUserId(username) {
  try {
    const res = await axios.get(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=1`);
    if (res.data?.data?.length > 0) {
      return res.data.data[0].id;
    }
    return null;
  } catch (err) {
    console.error("[getUserId] Lỗi:", err.message);
    return null;
  }
}

// Lấy GamePass qua roproxy
async function getGamePasses(userId) {
  let allPasses = [];
  let cursor = null;

  try {
    while (true) {
      const url = `https://www.roproxy.com/users/inventory/list-json?assetTypeId=34&itemsPerPage=100&userId=${userId}` + (cursor ? `&cursor=${cursor}` : "");
      const res = await axios.get(url);
      const data = res.data;

      if (!data?.Data?.Items || data.Data.Items.length === 0) break;

      for (const item of data.Data.Items) {
        if (item.Product?.IsForSale) {
          allPasses.push({
            id: item.Item.AssetId,
            name: item.Item.Name,
            price: item.Product.PriceInRobux
          });
        }
      }

      if (!data.Data.nextPageCursor) break;
      cursor = data.Data.nextPageCursor;
    }
  } catch (err) {
    console.error("[getGamePasses] Lỗi lấy GamePass:", err.message);
  }

  return allPasses;
}

// Endpoint chính
app.get("/gamepasses/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const userId = await getUserId(username);
    if (!userId) return res.status(404).json({ error: "Không tìm thấy người dùng Roblox" });

    const passes = await getGamePasses(userId);
    const filtered = passes.filter(p => p.price && p.price > 0).sort((a,b) => a.price - b.price);

    return res.json(filtered);
  } catch (err) {
    console.error("[API Error]:", err.message);
    return res.status(500).json({ error: "Không thể lấy dữ liệu GamePass" });
  }
});

// Khởi chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server đang chạy trên port ${PORT}`));
