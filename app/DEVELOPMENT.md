Development notes

1. Free up disk space if `npm install` fails with ENOSPC.

2. Install dependencies and run dev server:

```bash
cd app
npm install --legacy-peer-deps
npm run dev
```

3. PocketBase local dev:

- Download binary from https://pocketbase.io/
- Run `./pocketbase serve --http 127.0.0.1:8090`
- Create `.env` in `app/` with:

```
VITE_PB_URL=http://127.0.0.1:8090
```

4. Collections: see `pocketbase-setup.md` for curl examples to create `comments` and `ratings`.

5. After frontend is running, open `http://localhost:5173` (or the port Vite reports) and sign in.
