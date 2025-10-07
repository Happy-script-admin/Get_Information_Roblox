import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ⚙️ Thay bằng API Key thật của bạn từ Open Cloud
const API_KEY = "GCkk+OuMmUypfbg0VvIr3YmgxOU2CN/JJWQ88i15NP4C/vh7ZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SWtkRGEyc3JUM1ZOYlZWNWNHWmlaekJXZGtseU0xbHRaM2hQVlRKRFRpOUtTbGRST0RocE1UVk9VRFJETDNab055SXNJbTkzYm1WeVNXUWlPaUkzTXpJMk16azFOVE16SWl3aVpYaHdJam94TnpVNU9EUXdNekkyTENKcFlYUWlPakUzTlRrNE16WTNNallzSW01aVppSTZNVGMxT1Rnek5qY3lObjAuWHBrZFgxNExKY2xYN29wTU9yMENKLVVfNHdJTjM5eUROWUN3TmtQYXNsU2VaUmQzSjd2aVlKeTNPNmRxaWNKYlVwbTYtU1BjV2I5ZWJDZzljWXV1VmxIMVFRcGd5bGFPRjNKeVA0a0l4SjYyRlB6aC1EVTg1VGZNcTlJMERHSTA5c0duOGF4U0E4MmVON1Uwdk1lR1VBMU8wZTVPcng5N2lWWU5ZRkg1Z25PLXRRNlI1SEVWX0pJMF9FNzN5UW0tTzFJTVMyX0tteWdrMVROTTFQZENWNHpfNzlOUFRRZ1hUSnk4OFMxb1l3bEQ1VW9iRzRtQzhCLXY0UV9LZ2g1V0o1bTF6VmxUWnZaYTR2ejhoRzJQamZQMjZTLU9FQUxFQVVVOHhOWElXSDFhRVVyMnk0RDdXblB5WEo5eWpxdEtYZElHVVVSLXhkMTJXb0pyUDc5RC1B"
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
