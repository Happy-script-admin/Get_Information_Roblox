import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ⚙️ Thay bằng API Key thật của bạn từ Open Cloud
const API_KEY = "YOUR_ROBLOX_API_KEY_HERE";

// ✅ Lấy danh sách GamePass của 1 user (userId)
app.get("/getGamePasses/:userId", async (req, res) => {
  const userId = req.params.userId;
  const limit = 100;
  let cursor = "";
  let allPasses = [];

  try {
    while (true) {
      const url = `https://apis.roblox.com/game-passes/v1/users/${userId}/game-passes?count=${limit}${
        cursor ? `&exclusiveStartId=${cursor}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          "x-api-key": API_KEY,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        return res.status(500).json({ error: "Roblox API error", details: text });
      }

      const data = await response.json();
      allPasses.push(...(data.data || []));

      if (!data.nextPageExclusiveStartId) break;
      cursor = data.nextPageExclusiveStartId;
    }

    const filtered = allPasses.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price || 0,
    }));

    res.json({ success: true, passes: filtered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
