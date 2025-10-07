import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ⚙️ Thay bằng API Key thật của bạn từ Open Cloud
const API_KEY = "b2eT1hN6ekGmIaTB7CswyZ29k8LmTLvjddkWWQxrtEpb1GHkZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SW1JeVpWUXhhRTQyWld0SGJVbGhWRUkzUTNOM2VWb3lPV3M0VEcxVVRIWnFaR1JyVjFkUmVISjBSWEJpTVVkSWF5SXNJbTkzYm1WeVNXUWlPaUkzTXpJMk16azFOVE16SWl3aVpYaHdJam94TnpVNU9ETTRNRGs1TENKcFlYUWlPakUzTlRrNE16UTBPVGtzSW01aVppSTZNVGMxT1Rnek5EUTVPWDAuZ2hDVW1QYklkUElyVmtuWnRVWjQza1hTVlNBZkxxWmFNNTBzY2VTcG1CcGdQejQtRHR2dVBYbFgxd21tZGRMWlFOT3h3TXVIclRPSXBSQ2o1TDh5bnNGbk8zLVpBVTZMTTVkRGMwejZPVVFOWUM3eU9lSEJXTFJiTTNFYURKSkd1T0J0NjBFcWg5OVdvOXV0LXlTaTYzU1FLM2I3dkdMUUJZLV9pMEU3MVNTSE5JV0R3cElPdFBxS3BNc1V4dzd3Y2s4SmExalB1ZVZ2cXAxb0xqTXhVS0dJb3M1QTdMMkdWNGh3QXFqTHZleGhJY1hEdnMzQ1JjZ1FPRy1CZ1J6WGVUcDZIWk5iZUtkRnZzdFpOTFRXdkpFX0hlZEVfdzNoRjBLV3Q4Rk5KOEJIVUd3eWpxU01hQVZnc2hJbmIzTDVrSnpqT0lGM0R1bVpVMmkzRGsxQXdn"

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
