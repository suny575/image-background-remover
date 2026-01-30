import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.post("/remove-bg", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_file_b64: imageBase64, size: "auto" }),
    });

    if (!response.ok) throw new Error("BG removal failed");

    const arrayBuffer = await response.arrayBuffer();
    res.set("Content-Type", "image/png");
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));
