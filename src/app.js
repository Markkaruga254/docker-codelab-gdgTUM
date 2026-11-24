const express = require("express");
const path = require("path");

function createApp() {
  const app = express();
  const notes = [
    { id: 1, text: "Ferry to Likoni delayed 15 min", at: new Date().toISOString() },
  ];
  let nextId = 2;

  app.use(express.json({ limit: "10kb" }));
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Used later by Docker HEALTHCHECK and orchestrators
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: Math.round(process.uptime()) });
  });

  app.get("/api/notes", (_req, res) => {
    res.json([...notes].reverse());
  });

  app.post("/api/notes", (req, res) => {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text || text.length > 200) {
      return res.status(400).json({ error: "Write a note between 1 and 200 characters." });
    }
    const note = { id: nextId++, text, at: new Date().toISOString() };
    notes.push(note);
    res.status(201).json(note);
  });

  return app;
}

module.exports = { createApp };
