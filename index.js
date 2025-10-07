import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ⚙️ Thay bằng API Key thật của bạn từ Open Cloud
const API_KEY = "0/TU6gnxdkSZvS3Ph7b27HjXpNRvzUPXHolip5kNVeYK4gmrZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SWpBdlZGVTJaMjU0Wkd0VFduWlRNMUJvTjJJeU4waHFXSEJPVW5aNlZWQllTRzlzYVhBMWEwNVdaVmxMTkdkdGNpSXNJbTkzYm1WeVNXUWlPaUkxTWprNE56Z3hNak1pTENKbGVIQWlPakUzTlRrNE16ZzRORGtzSW1saGRDSTZNVGMxT1Rnek5USTBPU3dpYm1KbUlqb3hOelU1T0RNMU1qUTVmUS5lMlc3OXVQLXFfRFYwNHhlRGR1QUFIREswTWZKRzV5dmVSN0RxQXlNd1V5QVl3RGlXeFhPQUFZTHhWbkxsQ2RTQS13dThzXzQ2eW83b3VEN0Q5SHBlck9RMTJ3b3B0cHFuM0hCa0VmWS1Hb3VUOGhjY2hZVWFxRWxMbzhCVTZUb21QcXVkN3dncC05SXRBUnVVYkFqZ2dKLTQzdndHakQzRTF5dG14TGE5dEpPOXNaX0F5RzFEcUpVaUJwZnU4eUxoV1JDM1Rvdi1HYWd2SFNvSDRXSTY3SFZZUGFFejRDd3JldnRKc25fMVctUEl2NjBBdzFnZFdsZnIzeF9wdmF3Q3F0NWx1TW1PSzBHRHJEYzJSc2I1SFJjR1paWEgwOHJaY0RuSDVMTVFPcGJWR0swaG42Z1BSN3V3cjZMQUlGTDE4MWYtSUdqaHdKeXJ1cGl5SUZqanc="
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
      console.error("Roblox API failed:", response.status, text);
      return res.status(500).json({ error: "Roblox API error", status: response.status, details: text });
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
