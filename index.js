import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ⚙️ Thay bằng API Key thật của bạn từ Open Cloud
const API_KEY = "tZvI4HToekWLJURxJGPuZ1MOj9L3NkYT/3t3ytAi/f7INUxqZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SW5SYWRrazBTRlJ2Wld0WFRFcFZVbmhLUjFCMVdqRk5UMm81VEROT2ExbFVMek4wTTNsMFFXa3ZaamRKVGxWNGNTSXNJbTkzYm1WeVNXUWlPaUkxTWprNE56Z3hNak1pTENKbGVIQWlPakUzTlRrNE16WTROeklzSW1saGRDSTZNVGMxT1Rnek16STNNaXdpYm1KbUlqb3hOelU1T0RNek1qY3lmUS5YWnM4TTJtOFVwUWNVWDhEelJYWGZvSjB4SU9tWXAyRGc2TU16Y2xWa0kxZDhaNU9RMWl6SDNMUGQtNTBxMHptTVFOMC1Hb2hKeXVjY19SZ2tYUHpCY1g1VlFCSmpBZHNrY1NsOWlQaHRyeW9PbFNBanZrRlJoSU9BN2IzZjZ2ZmY2UVpPQnlfem9BUV9IQXNiaTZRd2FYbHFYbklxakc2R1lOeWVyWFJtY0txX1dxSWdwU29iS0lOQkIwUEF5SG5Pa3lVV3k4NFRxcHJrM2pLak8xSE0zRHREMk5BVm5uUWhURjk0cEh4b1ktUFVHRjQ2T1dMajZlTnRuNWhfdXRiMkVlVzdMZVdPWGJKaUpUYkJVRFdGTXpWamFscDRDVFZXUi1VNG1qVTVBdGNKaXhLOHFYN0lSLXcwNGZwVHB2Wm9nYzZubTJrVHk0ZDc0LVJKMWgtLXc=";

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
