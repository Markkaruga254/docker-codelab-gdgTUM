# Containerise Dock Notes: a guided PR

Work through the steps in order. Each step ends with a **check** so you know it worked before moving on.
Commit after each step. Small commits make a better PR.

## Step 0: Baseline

```bash
npm ci && npm test && npm start
```
**Check:** http://localhost:3000 loads and you can post a note. Stop it with Ctrl+C.

## Step 1: Branch

```bash
git checkout -b feat/containerise
```

## Step 2: `.dockerignore`

Create `.dockerignore` first. It controls what gets sent to the build.
It should exclude at least: `node_modules`, `.git`, `.env`, `*.log`, `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `docs`, `test`.

**Question to answer in your PR:** why is excluding `node_modules` important even though the Dockerfile runs `npm ci`?

```bash
git add .dockerignore && git commit -m "chore: add .dockerignore"
```

## Step 3: First Dockerfile (make it work)

Write a `Dockerfile` that:
1. Starts from `node:20-alpine`
2. Sets `WORKDIR /app`
3. Copies `package.json` and `package-lock.json`, then runs `npm ci --omit=dev`
4. Copies the rest of the source
5. Declares `EXPOSE 3000`
6. Starts with `CMD ["node", "src/server.js"]`

```bash
docker build -t dock-notes:1.0 .
docker run -d --name dock-notes -p 8080:3000 dock-notes:1.0
```
**Check:** http://localhost:8080 loads. `docker logs dock-notes` shows the "listening" line.

```bash
docker stop dock-notes && docker rm dock-notes
git add Dockerfile && git commit -m "feat: add Dockerfile"
```

## Step 4: Prove layer caching

1. Change one line in `public/style.css`.
2. Rebuild: `docker build -t dock-notes:1.0 .`
3. Look for `CACHED` next to the `npm ci` step.

If `npm ci` re-ran, your `COPY` order is wrong. Fix it so dependencies are copied and installed **before** the source.

**Question for your PR:** what would happen to build time if you wrote `COPY . .` before `npm ci`?

## Step 5: Harden it

Improve the Dockerfile:
- Add `ENV NODE_ENV=production`
- Run as non-root: `USER node` (and make sure files are readable by that user, `COPY --chown=node:node` helps)
- Add a healthcheck. The base image has no `curl`, but Node 20 has `fetch`:
  ```dockerfile
  HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
  ```

```bash
docker build -t dock-notes:1.0 .
docker run -d --name dock-notes -p 8080:3000 dock-notes:1.0
docker exec dock-notes whoami          # should print: node
docker ps                              # STATUS should become "healthy"
time docker stop dock-notes            # should be ~instant, thanks to the SIGTERM handler
docker rm dock-notes
```
```bash
git commit -am "feat: run as non-root and add healthcheck"
```

## Step 6: Compare image sizes

```bash
docker images dock-notes
docker history dock-notes:1.0
```
Try swapping `node:20-alpine` for `node:20` temporarily and compare. Record both numbers in your PR. Switch back.

## Step 7: Docker Compose

Create `docker-compose.yml` with one service `web` that builds from `.`, maps `8080:3000`, sets `PORT=3000`, uses `restart: unless-stopped`, and reuses the image healthcheck.

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f web
docker compose down
git add docker-compose.yml && git commit -m "feat: add docker compose"
```

## Step 8: Scan it

```bash
docker scout quickview dock-notes:1.0     # or: trivy image dock-notes:1.0
```
Paste the summary in your PR. Note any High/Critical findings and whether a newer base image tag fixes them.

## Step 9: Document

Add a "Run with Docker" section to `README.md` with the build and run commands.

## Step 10: Open the PR

```bash
git push -u origin feat/containerise
```
Then on GitHub, open a pull request into `main`. The template gives you a checklist. Tick each item honestly and fill in the size and scan sections.

If you use the GitHub CLI:
```bash
gh pr create --fill --base main
```

## Stretch goals (follow-up PRs)

1. **Multi-stage build** with a separate build stage (add a build step to the app first, such as minifying CSS).
2. **GitHub Actions** workflow that runs `npm test`, builds the image, and scans it with Trivy on every PR.
3. **Push to a registry** (GHCR) from CI on merge to `main`, tagged with the commit SHA.
4. **Persist notes** with a Postgres container in Compose and a named volume.
5. **Hardened run**: `docker run --read-only --cap-drop=ALL --tmpfs /tmp ...` and fix whatever breaks.

## When you are stuck

Paste your Dockerfile and the error into the chat. Diagnose it with:
```bash
docker build --progress=plain --no-cache -t dock-notes:1.0 .
docker logs dock-notes
docker exec -it dock-notes sh
```
