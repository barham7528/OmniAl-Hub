import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OMNIROUTE_URL =
  process.env.OMNIROUTE_URL || "http://localhost:20128";
const OMNIROUTE_API_KEY = process.env.OMNIROUTE_API_KEY || "";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/index.html");
});
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    name: "OmniAI Hub",
    status: "online"
  });
});

app.get("/api/models", async (req, res) => {
  try {
    const headers = {};

    if (OMNIROUTE_API_KEY) {
      headers.Authorization = `Bearer ${OMNIROUTE_API_KEY}`;
    }

    const response = await fetch(`${OMNIROUTE_URL}/v1/models`, {
      headers
    });

    if (!response.ok) {
      throw new Error("OmniRoute unavailable");
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.json({
      object: "list",
      data: [
        { id: "auto", name: "Auto" },
        { id: "chatgpt", name: "ChatGPT" },
        { id: "claude", name: "Claude" },
        { id: "gemini", name: "Gemini" },
        { id: "deepseek", name: "DeepSeek" }
      ],
      demo: true
    });
  }
});

app.post("/api/chat", async (req, res) => {
  const { messages, model = "auto" } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      error: "messages must be an array"
    });
  }

  try {
    const headers = {
      "Content-Type": "application/json"
    };

    if (OMNIROUTE_API_KEY) {
      headers.Authorization = `Bearer ${OMNIROUTE_API_KEY}`;
    }

    const response = await fetch(
      `${OMNIROUTE_URL}/v1/chat/completions`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages
        })
      }
    );

    if (!response.ok) {
      throw new Error("OmniRoute request failed");
    }

    const data = await response.json();
    return res.json(data);

  } catch (error) {
    return res.json({
      id: "demo-response",
      object: "chat.completion",
      demo: true,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content:
              "مرحباً! OmniAI Hub يعمل حالياً بوضع العرض التجريبي. سيتم ربط نماذج الذكاء الاصطناعي عبر OmniRoute في المرحلة التالية."
          }
        }
      ]
    });
  }
});

app.listen(PORT, () => {
  console.log(`OmniAI Hub running on port ${PORT}`);
});
