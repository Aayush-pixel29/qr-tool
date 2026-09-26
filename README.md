# QR Forge 🚀
> Dynamic QR Code Generator with Real-Time Scan Analytics & Scan-Limit Auto-Deactivation. Built on **Cloudflare Workers (Hono + TypeScript)** and **Cloudflare D1**.

---

## 🌟 Key Features

- **⚡ Edge Fast & Pure JS Matrix Engine**: Powered by `qrcode-generator` — runs natively in the Cloudflare Workers runtime with zero canvas or native dependencies.
- **🎨 5 Custom SVG Renderers**:
  - `classic`: Standard high-contrast square modules (maximum optical scanning reliability).
  - `rounded`: Softly rounded square modules for sleek modern appearance.
  - `dots`: Circular module dots with solid finder corners for instant scanning.
  - `gradient`: Vibrant multi-stop linear gradient (`#4f46e5` → `#7c3aed` → `#ec4899`).
  - `logo`: Reserved central logo cutout using high error correction level (`H` - 30% recovery).
- **🔒 Dynamic Scan Limits & Auto-Deactivation**: Set optional scan caps (e.g. 500 scans) — once reached, the QR code automatically flips to `inactive` and displays an inactive notification page instead of redirecting.
- **📊 Real-Time Analytics**: Tracks total scan counts, timestamps in `scan_log`, and live status.
- **🗄️ Serverless SQL with Cloudflare D1**: Fully transactional with batch updates and atomic counters.
- **✨ Built-in Glassmorphism UI**: Live SVG preview, 1-click short URL copy, direct SVG vector downloads, and instant stats lookup.

---

## 📐 Architecture & Flow

```
[ User scans QR Code ]
         │
         ▼
[ https://<subdomain>.workers.dev/r/:id ]
         │
         ▼
[ Worker queries D1 Database ]
   ├─ If not found ──────────────► 404 "Invalid QR Code" Page
   ├─ If status == 'inactive' ───► 410 "QR Code Inactive" Page
   └─ If active:
         ├─ Log scan to `scan_log`
         ├─ Increment `scan_count` in `qr_codes`
         ├─ If scan_count >= max_scans ──► set status = 'inactive'
         └─ 302 Redirect to destination URL (e.g., https://yourbrand.com)
```

---

## 🗄️ D1 Database Schema (`migrations/0001_init.sql`)

```sql
CREATE TABLE qr_codes (
  id TEXT PRIMARY KEY,                     -- 8-character nanoid
  target_url TEXT NOT NULL,
  design TEXT NOT NULL DEFAULT 'classic', -- classic | rounded | dots | gradient | logo
  max_scans INTEGER,                       -- NULL = unlimited
  scan_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',  -- active | inactive
  created_at INTEGER NOT NULL
);

CREATE TABLE scan_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qr_id TEXT NOT NULL,
  scanned_at INTEGER NOT NULL,
  FOREIGN KEY (qr_id) REFERENCES qr_codes(id)
);

CREATE INDEX idx_qr_codes_status ON qr_codes(status);
CREATE INDEX idx_scan_log_qr_id ON scan_log(qr_id);
```

---

## 🛣️ API Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Web dashboard UI for creating QR codes & viewing analytics |
| `POST` | `/api/create` | Generates a new dynamic QR code (JSON: `{ target_url, design, max_scans }`) |
| `GET` | `/r/:id` | Scan & redirect endpoint (logs scan, checks scan limit, redirects 302) |
| `GET` | `/qr/:id.svg` | Returns the raw styled SVG file (`image/svg+xml`) |
| `GET` | `/stats/:id` | Returns JSON metadata & scan statistics for any QR ID |

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Apply Local D1 Database Migration
```bash
npm run d1:migrate:local
```

### 3. Start Local Dev Server
```bash
npm run dev
```
Open `http://127.0.0.1:8787` in your browser.

---

## 🚀 Cloudflare Production Deployment

### 1. Log in to Cloudflare (one-time)
```bash
npx wrangler login
```

### 2. Create the Cloudflare D1 Database
```bash
npx wrangler d1 create qr_forge_db
```
Copy the `database_id` output from Cloudflare and paste it into `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "qr_forge_db"
database_id = "<your-database-id-here>"
```

### 3. Run Remote D1 Migration
```bash
npm run d1:migrate:remote
```

### 4. Deploy to Cloudflare Workers
```bash
npm run deploy
```
Your app will be live at `https://qr-forge.<your-account-subdomain>.workers.dev`!

---

## 📄 License
MIT
