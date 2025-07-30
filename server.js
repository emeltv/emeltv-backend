import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const apiBase = "https://live.emeltv.ba";
const origin = process.env.ORIGIN;

// Mapa uređaja → group i API key
const deviceConfig = {
  android: {
    group: process.env.DEVICE_ANDROID_GROUP,
    apiKey: process.env.DEVICE_ANDROID_API_KEY,
  },
  apple: {
    group: process.env.DEVICE_IOS_GROUP,
    apiKey: process.env.DEVICE_IOS_API_KEY,
  },
  samsung: {
    group: process.env.DEVICE_TIZEN_GROUP,
    apiKey: process.env.DEVICE_TIZEN_API_KEY,
  },
  lg: {
    group: process.env.DEVICE_LG_GROUP,
    apiKey: process.env.DEVICE_LG_API_KEY,
  },
};

app.get("/stream-url", async (req, res) => {
  const deviceType = req.query.device?.toLowerCase();

  if (!deviceType || !deviceConfig[deviceType]) {
    return res.status(400).json({ error: "Invalid or missing device type" });
  }

  const { group, apiKey } = deviceConfig[deviceType];
  const userAgent = req.headers["user-agent"] || "node-fetch-client";
  const clientIp = req.headers["x-client-ip"] || "";

  console.log(`Device Ip: ${clientIp}`);

  try {
    // Step 1: Get group token
    const tokenResponse = await fetch(
      `${apiBase}/api/device/group-token?device=${group}`,
      {
        headers: {
          "X-API-Key": apiKey,
          "X-Client-IP": clientIp,
          "X-Real-IP": clientIp,
          Origin: origin,
          "User-Agent": userAgent,
        },
      }
    );

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      return res.status(tokenResponse.status).json({
        error: "Failed to fetch group token",
        status: tokenResponse.status,
        body: text,
      });
    }

    const { group_token } = await tokenResponse.json();
    console.log(`✅ Group token fetched for ${deviceType}`);

    // Step 2: Get stream URL
    const streamResponse = await fetch(
      `${apiBase}/api/stream?device=${group}&streamID=1`,
      {
        headers: {
          "X-Group-Token": group_token,
          "X-Client-IP": clientIp,
          "X-Real-IP": clientIp,
          "X-API-Key": apiKey,
          Origin: origin,
          "User-Agent": userAgent,
        },
      }
    );

    if (!streamResponse.ok) {
      const text = await streamResponse.text();
      return res.status(streamResponse.status).json({
        error: "Failed to fetch stream URL",
        status: streamResponse.status,
        body: text,
      });
    }

    const responseData = await streamResponse.json();
    console.log(`🎬 Stream data fetched for ${deviceType}`);
    res.json(responseData);
  } catch (err) {
    console.error("❌ Error in /stream-url:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
