const list = document.getElementById("notes");
const empty = document.getElementById("empty");
const form = document.getElementById("note-form");
const input = document.getElementById("text");
const error = document.getElementById("error");

function render(notes) {
  list.replaceChildren();
  empty.hidden = notes.length > 0;
  for (const n of notes) {
    const li = document.createElement("li");
    li.textContent = n.text;
    const t = document.createElement("time");
    t.dateTime = n.at;
    t.textContent = new Date(n.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    li.appendChild(t);
    list.appendChild(li);
  }
}

async function load() {
  const res = await fetch("/api/notes");
  render(await res.json());
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  error.textContent = "";
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input.value }),
  });
  if (!res.ok) {
    error.textContent = (await res.json()).error;
    return;
  }
  input.value = "";
  load();
});

load();
