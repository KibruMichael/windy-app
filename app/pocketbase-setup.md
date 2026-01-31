PocketBase setup (quick start)

1. Download and run PocketBase locally
   - Download the binary for your platform from https://pocketbase.io/
   - Start the server in the repo root (or anywhere):

```bash
./pocketbase serve --http 127.0.0.1:8090
```

2. Set env for the frontend (create `app/.env`):

```
VITE_PB_URL=http://127.0.0.1:8090
```

3. Collections (curl examples)

- Create `comments` collection:

```bash
curl -X POST "http://127.0.0.1:8090/api/collections" -H "Content-Type: application/json" \
  -d '{"name":"comments","schema":[{"name":"text","type":"text","required":true},{"name":"user","type":"text","required":true}],"listRule":"","viewRule":"","createRule":"@request.auth != null","updateRule":"@request.auth != null","deleteRule":"@request.auth != null"}'
```

- Create `ratings` collection:

```bash
curl -X POST "http://127.0.0.1:8090/api/collections" -H "Content-Type: application/json" \
  -d '{"name":"ratings","schema":[{"name":"user","type":"text","required":true},{"name":"value","type":"number","required":true}],"createRule":"@request.auth != null","updateRule":"@request.auth != null"}'
```

4. Use Admin UI to create the `users` collection (or enable built-in users). Make sure email/password auth is enabled.

5. Start the frontend after installing dependencies:

```bash
cd app
npm install --legacy-peer-deps
npm run dev
```

If you want, I can generate PocketBase collection JSON export for direct import. Tell me if you'd like that.
