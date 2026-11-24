# Dock Notes

A tiny harbour notice board: post short notes, see them listed. Node + Express, plain HTML/CSS/JS, in-memory storage.

It exists so you can practise **containerising a real web app through a pull request**.
The app works on your machine. Your job is to make it work the same anywhere, in a container.

## Run it without Docker

```bash
npm ci
npm test
npm start          # http://localhost:3000
```

## Your mission

Follow [docs/CONTAINERISE.md](docs/CONTAINERISE.md). The repo has no Docker files yet. You add them on a branch and open a PR.

## Endpoints

| Method | Path          | Purpose                    |
|--------|---------------|----------------------------|
| GET    | `/`           | The web page               |
| GET    | `/health`     | Liveness check             |
| GET    | `/api/notes`  | List notes (newest first)  |
| POST   | `/api/notes`  | Body `{"text": "..."}`     |

Config: `PORT` (default 3000), `HOST` (default 0.0.0.0).
