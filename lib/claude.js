/*
@ author: Herza
@ type : CommonJS
@ ========> Info <=========
@ github: https://github.com/herzonly
@ wa_channel: https://whatsapp.com/channel/0029VaGVOvq1iUxY6WgHLv2R
*/

const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

//sell products BELAJAR ILMU COLI|MELIHAT FEMBOY TANPA BATAS, MENAHAN NAFSU PADA ANIME BERUSU BESAR 😹

const COOKIE_STRING = `_fbp=fb.1.1774196948829.57752726135290630; __cf_bm=nMpGA4YHTYRF75DbBumwYlljdodNoU0K2FDvdNUSSR8-1774196948-1.0.1.1-34DCWmG0SNbF2yZ3Le.O_NC8xKOhXP1PAkYRGQCWa3BQRQsY.Evbi.jXTy94Q9qqr1.3cwsAj2W.t3xUjlb1TFbrEoIUifet0GxeJUH3hBg; _cfuvid=Kvs7leYXnBo9vqtcRQDiF4QosHwgWB2RACHol3b74vQ-1774196948833-0.0.1.1-604800000; anthropic-device-id=354cfeb9-45fb-4c00-afd8-2d1714732838; activitySessionId=2c155f8b-d353-457f-a485-dcad731305da; ajs_anonymous_id=claudeai.v1.451f46bb-4d2c-4bde-b66c-97388f0a7fb3; CH-prefers-color-scheme=dark; __ssid=f3fbcd7c-276e-4267-b7a9-60a1a6bf9f8e; _gcl_au=1.1.500032452.1774196964; g_state={"i_l":0,"i_ll":1774196962634,"i_e":{"enable_itp_optimization":0}}; sessionKey=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; lastActiveOrg=153e8643-c786-464e-ae29-b270b23ea6a6; intercom-device-id-lupk8zyo=68c2536f-d0d4-4d5e-8399-c9e145e1032c; cf_clearance=VyRczPBU2qhF9Ai9BEEUCrtOrCye_UYdndLK.5wwzak-1774196981-1.2.1.1-p9W7XZ9UlnHsSFBKsxGWPU4P3ZOfwQm7MPCXqBVXQ7DFzwRMC9McacqyixRPv3Yb5_onLLz1MyWB1zu3YDfD857Q47Wc5_LH6bsofZXfy_qhk2t3HGdk5RWpyVJu0Rpj9AGUls4uTYXvU3msMYdR70_VbEDUbZxazE.MJqVbkKgcv9U4z02OGeko6M1ST_TNfBd2pnzbpVVj62n.2UlyqWtRGwmqBwox7.y6UwyXN3Y; routingHint=sk-ant-rh-eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJFUzI1NiIsICJraWQiOiAiN0MxcWFPRnhqdWxaUjRFQnNuNk1UeUZGNWdDV2JHbFpNVDR2RklrRFFpbyJ9.eyJzdWIiOiAiNmFlMzY3ZGItMWMyMi00MmIxLTljYjQtMGFmM2U2ZTcxODQ3IiwgImlhdCI6IDE3NzQxOTY5ODEsICJpc3MiOiAiY2xhdWRlLWFpLXJvdXRpbmciLCAib25ib2FyZGluZ19jb21wbGV0ZSI6IHRydWUsICJwaG9uZV92ZXJpZmllZCI6IGZhbHNlLCAiYWdlX3ZlcmlmaWVkIjogdHJ1ZSwgIm5hbWUiOiAiTWl0cmFhYSJ9.HjIQA64TBNOVkRR0a51PthzYmWXIdtpKiNQZugP6KEUpS4PVgRGhM97Ebd8IfVuB5OSsjIuYYzXOrSNHVqhNRg; ajs_user_id=6ae367db-1c22-42b1-9cb4-0af3e6e71847; intercom-session-lupk8zyo=MVU0WkVsM2tSWjdha0dwcWtveDA1dmFuWkRNWG5odE85SmFlSHB6R0dFWkNBOVA5VGg2ZERYTmdXYVBOWTMwU2dZbHpTaXpRTnV3a3AramloTVRnZ0MyZXZveDRvSWFGL0oyUExCazRxbFdkUGZCM1ZHamVacDJkaWdUd1FlbnY1MWRzV3o0bDNjanN1NzdCZEFDVW5nNzg4NGRZbGxwUnY4aEF3N29VLzc5c2tkeldLYlFWeG5YL0ZGUEgwRC9WWGpmYThZbnhKRnJGbFdhN3JhRzVrL2NxQzZPVkNoYk50dDlCWHVXOUxvSlYzRDVGcEdMZW5XYVBYODAwODJrRE0vVldreDUxWWwvL3FWWG1CTXRYSEN5V3o2M2M1YTg2blY2YUQ5MHljaGs9LS1LNWJCbUtSelhvbHB4UEM2YTlINzR3PT0=--9ae3d7853b16a02e9e57cad615e9a836a906c359; user-sidebar-visible-on-load=false; _dd_s=aid=7b87362a-e01f-46c5-95cc-f72a1a64f700&rum=0&expire=1774197968557`;

const ORG_ID = "153e8643-c786-464e-ae29-b270b23ea6a6";
const MODEL = "claude-sonnet-4-6";
const DEVICE_ID = "354cfeb9-45fb-4c00-afd8-2d1714732838";
const ANON_ID = crypto.randomUUID(); // Dibuat otomatis menggunakan fungsi UUID internal Node.js
const MAX_IMAGES = 2;
const MAX_PROMPT = 2500;

const BASE_HEADERS = {
  "accept": "*/*",
  "accept-encoding": "gzip, deflate, br",
  "accept-language": "en-US,en;q=0.9",
  "anthropic-anonymous-id": ANON_ID,
  "anthropic-client-platform": "web_claude_ai",
  "anthropic-client-sha": "456b13de6bf5c5013fd09fbfc657137b90de112a",
  "anthropic-client-version": "1.0.0",
  "anthropic-device-id": DEVICE_ID,
  "cache-control": "no-cache",
  "cookie": COOKIE_STRING,
  "origin": "https://claude.ai",
  "pragma": "no-cache",
  "sec-ch-ua": '"Chromium";v="137", "Not/A)Brand";v="24"',
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": '"Android"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
};

async function createConversation() {
  const convId = crypto.randomUUID();
  const res = await axios.post(
    `https://claude.ai/api/organizations/${ORG_ID}/chat_conversations`,
    {
      uuid: convId,
      name: "",
      enabled_imagine: true,
      include_conversation_preferences: true,
      is_temporary: false,
    },
    {
      headers: {
        ...BASE_HEADERS,
        "content-type": "application/json",
        "referer": "https://claude.ai/new",
      },
      decompress: true,
    }
  );
  return res.data.uuid;
}

async function uploadFile(convId, filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName).toLowerCase();

  const mimeMap = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  const mimeType = mimeMap[ext] || "application/octet-stream";

  const form = new FormData();
  form.append("file", fileBuffer, { filename: fileName, contentType: mimeType });

  const res = await axios.post(
    `https://claude.ai/api/organizations/${ORG_ID}/conversations/${convId}/wiggle/upload-file`,
    form,
    {
      headers: {
        ...BASE_HEADERS,
        ...form.getHeaders(),
        "referer": "https://claude.ai/new",
      },
      decompress: true,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );
  return res.data.file_uuid;
}

async function sendMessage(convId, prompt, fileUuids = []) {
  const humanUuid = crypto.randomUUID();
  const assistantUuid = crypto.randomUUID();

  const payload = {
    prompt,
    timezone: "Asia/Makassar",
    personalized_styles: [
      {
        isDefault: true,
        key: "Default",
        name: "Normal",
        nameKey: "normal_style_name",
        prompt: "Normal\n",
        summary: "Default responses from Claude",
        summaryKey: "normal_style_summary",
        type: "default",
      },
    ],
    locale: "en-US",
    attachments: [],
    files: fileUuids,
    model: MODEL,
    rendering_mode: "messages",
    sync_sources: [],
    tools: [],
    turn_message_uuids: {
      human_message_uuid: humanUuid,
      assistant_message_uuid: assistantUuid,
    },
  };

  const res = await axios.post(
    `https://claude.ai/api/organizations/${ORG_ID}/chat_conversations/${convId}/completion`,
    payload,
    {
      headers: {
        ...BASE_HEADERS,
        "accept": "text/event-stream",
        "content-type": "application/json",
        "referer": `https://claude.ai/chat/${convId}`,
      },
      responseType: "stream",
      decompress: true,
    }
  );

  return new Promise((resolve, reject) => {
    let fullText = "";
    let buffer = "";

    res.data.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === "[DONE]") continue;
        try {
          const evt = JSON.parse(raw);
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
            fullText += evt.delta.text;
            process.stdout.write(evt.delta.text);
          }
        } catch {}
      }
    });

    res.data.on("end", () => {
      console.log();
      resolve(fullText);
    });

    res.data.on("error", reject);
  });
}

async function claude(query, imagePaths = []) {
  if (query.length > MAX_PROMPT) {
    throw new Error(`Prompt melebihi ${MAX_PROMPT} karakter (${query.length})`);
  }
  if (imagePaths.length > MAX_IMAGES) {
    throw new Error(`Max ${MAX_IMAGES} gambar, kamu kasih ${imagePaths.length}`);
  }

  const convId = await createConversation();
  console.log(`[conv] ${convId}`);

  const fileUuids = [];
  for (const imgPath of imagePaths) {
    console.log(`[upload] ${imgPath}`);
    const uuid = await uploadFile(convId, imgPath);
    console.log(`[file_uuid] ${uuid}`);
    fileUuids.push(uuid);
  }

  const reply = await sendMessage(convId, query, fileUuids);
  return reply;
}

module.exports = claude

 /*This Code Uploaded By NotMeBotz - MD, DO NOT DELETE WM | | Saturday, 21 March 2026 || 10:30:40 WIB */