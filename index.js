const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Lấy UserId từ username
 */
async function getUserId(username) {
  try {
    const res = await axios.get(
      `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=1`
    );
    const data = res.data;
    if (data.data && data.data.length > 0) return data.data[0].id;
    return null;
  } catch (err) {
    console.error("[getUserId] Lỗi:", err.message);
    return null;
  }
}

/**
 * Lấy tất cả GamePass đang bán của user từ RoProxy
 */
async function getGamePasses(userId) {
  let allPasses = [];
  let cursor = null;

  try {
    while (true) {
      const url =
        `https://www.roproxy.com/users/inventory/list-json?assetTypeId=34&itemsPerPage=100&userId=${userId}` +
        (cursor ? `&cursor=${cursor}` : "");
      const res = await axios.get(url);
      const data = res.data;

      if (!data || !data.Data || !data.Data.Items) break;

      for (const item of data.Data.Items) {
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
  } catch (err) {
    console.error("[getGamePasses] Lỗi lấy GamePass:", err.message);
  }

  return allPasses;
}

/**
 * Endpoint: lấy GamePass theo username
 */
app.get("/gamepasses/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const userId = await getUserId(username);
    if (!userId) return res.status(404).json({ error: "Không tìm thấy người dùng" });

    const passes = await getGamePasses(userId);
    const filtered = passes
      .filter((p) => p.price && p.price > 0)
      .sort((a, b) => a.price - b.price);

    res.json(filtered);
  } catch (err) {
    console.error("[API Error]:", err.message);
    res.status(500).json({ error: "Không thể lấy dữ liệu GamePass" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server proxy Roblox đang chạy trên port ${PORT}`));
