const { test } = require("node:test");
const assert = require("node:assert");
const { createApp } = require("../src/app");

function start() {
  return new Promise((resolve) => {
    const server = createApp().listen(0, () => resolve(server));
  });
}

test("GET /health returns ok", async () => {
  const server = await start();
  const res = await fetch(`http://localhost:${server.address().port}/health`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).status, "ok");
  server.close();
});

test("POST /api/notes adds a note and rejects empty text", async () => {
  const server = await start();
  const base = `http://localhost:${server.address().port}`;
  const headers = { "Content-Type": "application/json" };

  const ok = await fetch(`${base}/api/notes`, { method: "POST", headers, body: JSON.stringify({ text: "Berth 4 free" }) });
  assert.strictEqual(ok.status, 201);

  const bad = await fetch(`${base}/api/notes`, { method: "POST", headers, body: JSON.stringify({ text: "  " }) });
  assert.strictEqual(bad.status, 400);

  const list = await (await fetch(`${base}/api/notes`)).json();
  assert.strictEqual(list[0].text, "Berth 4 free");
  server.close();
});
