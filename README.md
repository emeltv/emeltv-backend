# EmelTV Backend

This is the companion backend service for the EmelTV frontend applications, built with Node.js and Express.

It serves as a secure intermediary between the frontend clients and the EmelTV streaming API, managing authentication and fetching protected stream URLs for live TV playback.

## Features

- Retrieves a secure **group token** based on the device type and API key
- Requests a **stream URL** using the group token
- Exposes a single API endpoint `/stream-url` for the frontend to retrieve the playable HLS stream

---

## API Reference

### `GET /stream-url`

Fetches the authenticated live stream URL for a given device type.

#### Query Parameters

- `device` (required): Specifies the device type requesting the stream.

  Supported values:

  - `android`
  - `apple`
  - `samsung`
  - `lg`

> 🔴 **Important:** The `device` parameter is **required**. If omitted or invalid, the API will respond with HTTP 400.

#### Request Headers

- `X-Client-IP` (optional but recommended): Specifies the client's IP address.  
  Used for authentication purposes by the upstream API.  
  If not provided, fallback behavior may apply.

#### Example Request

```http
GET /stream-url?device=android
X-Client-IP: 203.0.113.42
```

Example Response

```json
{
  "stream_url": "https://cdn.emeltv.ba/stream/live.m3u8",
  "expires_at": "2025-07-31T03:25:18.484159755+02:00"
}
```
