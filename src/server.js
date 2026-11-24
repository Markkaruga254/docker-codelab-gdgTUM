const { createApp } = require("./app");

// Config comes from the environment so the same code runs anywhere.
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = createApp().listen(PORT, HOST, () => {
  console.log(`dock-notes listening on http://${HOST}:${PORT}`);
});

// Docker sends SIGTERM on `docker stop`. Exit cleanly instead of being killed after 10s.
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down");
  server.close(() => process.exit(0));
});
