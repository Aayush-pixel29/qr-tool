export function renderHomePage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Forge — Dynamic QR Codes with Scan Tracking & Auto-Expiry</title>
  <meta name="description" content="Generate styled dynamic QR codes with real-time scan analytics, custom designs, and scan limit auto-deactivation. Powered by Cloudflare Workers & D1.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #090d16;
      --card-bg: rgba(18, 24, 38, 0.85);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --accent: #ec4899;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --input-bg: rgba(15, 23, 42, 0.7);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-dark);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem 4rem;
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 85% 85%, rgba(236, 72, 153, 0.12) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.08) 0%, transparent 60%);
      background-attachment: fixed;
    }

    .container {
      width: 100%;
      max-width: 1000px;
    }

    header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
    }

    h1 {
      font-size: 2.75rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #ffffff 30%, #cbd5e1 70%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.5;
    }

    .grid-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: start;
    }

    @media (max-width: 860px) {
      .grid-layout {
        grid-template-columns: 1fr;
      }
      h1 {
        font-size: 2.1rem;
      }
    }

    .glass-card {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: #ffffff;
    }

    .form-group {
      margin-bottom: 1.4rem;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 0.5rem;
    }

    .label-hint {
      font-size: 0.775rem;
      color: var(--text-muted);
      font-weight: normal;
      margin-left: 0.35rem;
    }

    input, select {
      width: 100%;
      padding: 0.85rem 1rem;
      background: var(--input-bg);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      color: #ffffff;
      font-family: inherit;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s ease;
    }

    input:focus, select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
      background: rgba(15, 23, 42, 0.95);
    }

    select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      padding-right: 2.5rem;
    }

    .design-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.6rem;
      margin-top: 0.5rem;
    }

    .design-btn {
      background: var(--input-bg);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 0.75rem 0.5rem;
      color: var(--text-muted);
      font-size: 0.825rem;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
    }

    .design-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .design-btn.active {
      background: rgba(99, 102, 241, 0.18);
      border-color: var(--primary);
      color: #fff;
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
    }

    .btn-submit {
      width: 100%;
      padding: 0.95rem 1.5rem;
      background: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
      transition: all 0.2s ease;
      margin-top: 1rem;
    }

    .btn-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.55);
    }

    .btn-submit:active {
      transform: translateY(0);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* Preview Card */
    .preview-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      min-height: 420px;
      justify-content: center;
    }

    .qr-box {
      width: 250px;
      height: 250px;
      background: #ffffff;
      border-radius: 20px;
      padding: 12px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      transition: transform 0.3s ease;
    }

    .qr-box svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .placeholder-qr {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748b;
      gap: 0.75rem;
      font-size: 0.9rem;
      padding: 1rem;
    }

    .link-box {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }

    .short-url-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: #38bdf8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .copy-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      color: #fff;
      padding: 0.4rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      width: 100%;
    }

    .btn-action {
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-download {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .btn-download:hover {
      background: rgba(16, 185, 129, 0.25);
    }

    .btn-test {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
    }

    .btn-test:hover {
      background: rgba(99, 102, 241, 0.25);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-active {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .status-inactive {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      font-size: 0.825rem;
      color: var(--text-muted);
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* Stats Quick Lookup Section */
    .stats-section {
      margin-top: 2.5rem;
    }

    .stats-search-bar {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .stats-search-bar input {
      flex: 1;
    }

    .stats-search-bar button {
      width: auto;
      padding: 0 1.5rem;
      margin-top: 0;
    }

    .stats-result {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem;
      display: none;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 1rem;
      margin-top: 0.75rem;
    }

    .stat-pill {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      padding: 0.75rem;
    }

    .stat-pill .label {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }

    .stat-pill .value {
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
    }

    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      font-size: 0.875rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 1000;
    }

    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/>
        </svg>
        Cloudflare Workers + D1 Edge App
      </div>
      <h1>QR Forge</h1>
      <p class="subtitle">Generate high-reliability dynamic QR codes with live scan tracking, custom SVG styles, and scan-limit auto-deactivation.</p>
    </header>

    <div class="grid-layout">
      <!-- Left: Create Form -->
      <div class="glass-card">
        <h2 class="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Dynamic QR
        </h2>

        <form id="create-form">
          <div class="form-group">
            <label for="target_url">Target Destination URL</label>
            <input type="url" id="target_url" name="target_url" placeholder="https://yourwebsite.com/promo" required autocomplete="off" />
          </div>

          <div class="form-group">
            <label>QR Code Style</label>
            <input type="hidden" id="design" name="design" value="classic" />
            <div class="design-options">
              <button type="button" class="design-btn active" data-style="classic">
                <span>⬛ Classic</span>
              </button>
              <button type="button" class="design-btn" data-style="rounded">
                <span>🔘 Rounded</span>
              </button>
              <button type="button" class="design-btn" data-style="dots">
                <span>⚪ Dots</span>
              </button>
              <button type="button" class="design-btn" data-style="gradient">
                <span>🌈 Gradient</span>
              </button>
              <button type="button" class="design-btn" data-style="logo">
                <span>🎯 Logo Cut</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="max_scans">
              Scan Limit
              <span class="label-hint">(Optional — auto-deactivates after N scans)</span>
            </label>
            <input type="number" id="max_scans" name="max_scans" min="1" placeholder="e.g. 500 (leave empty for unlimited)" />
          </div>

          <button type="submit" class="btn-submit" id="submit-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            Generate QR Code
          </button>
        </form>
      </div>

      <!-- Right: Preview & Output -->
      <div class="glass-card preview-container" id="preview-card">
        <div class="qr-box" id="qr-box">
          <div class="placeholder-qr">
            <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/>
              <path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/>
            </svg>
            <span>Enter a URL & hit generate to preview your QR code</span>
          </div>
        </div>

        <div id="output-details" style="display: none; width: 100%;">
          <div class="link-box">
            <span class="short-url-text" id="short-url-display">https://...</span>
            <button type="button" class="copy-btn" id="copy-btn">Copy Link</button>
          </div>

          <div class="actions-grid">
            <a id="download-btn" class="btn-action btn-download" download="qr-code.svg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download SVG
            </a>
            <a id="test-btn" class="btn-action btn-test" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Test Scan / Link
            </a>
          </div>

          <div class="meta-row">
            <div>Status: <span id="status-badge" class="status-badge status-active">Active</span></div>
            <div>Scans: <span id="scans-display" style="font-family:'JetBrains Mono'; font-weight:700; color:#fff;">0 / ∞</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Quick Lookup -->
    <div class="glass-card stats-section">
      <h2 class="card-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
        </svg>
        QR Analytics & Lookup
      </h2>
      <div class="stats-search-bar">
        <input type="text" id="stats-id-input" placeholder="Enter QR ID (e.g. 8-character ID or full short link)" autocomplete="off" />
        <button type="button" class="btn-submit" id="lookup-btn">Check Stats</button>
      </div>

      <div class="stats-result" id="stats-result">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <strong id="stats-id-title" style="font-family:'JetBrains Mono'; color:#38bdf8;"></strong>
          <span id="stats-status-badge" class="status-badge"></span>
        </div>
        <div class="stats-grid">
          <div class="stat-pill">
            <div class="label">Total Scans</div>
            <div class="value" id="stats-scan-count">0</div>
          </div>
          <div class="stat-pill">
            <div class="label">Max Scan Cap</div>
            <div class="value" id="stats-max-scans">Unlimited</div>
          </div>
          <div class="stat-pill">
            <div class="label">Design Style</div>
            <div class="value" id="stats-design" style="text-transform:capitalize;">-</div>
          </div>
          <div class="stat-pill">
            <div class="label">Created</div>
            <div class="value" id="stats-created" style="font-size:0.9rem;">-</div>
          </div>
        </div>
        <div style="margin-top:0.75rem; font-size:0.8rem; color:var(--text-muted); word-break:break-all;">
          Target: <a id="stats-target-link" href="#" target="_blank" style="color:#a5b4fc;"></a>
        </div>
      </div>
    </div>
  </div>

  <div id="toast" class="toast">Copied to clipboard!</div>

  <script>
    let currentRawSvg = '';

    // Style selector buttons
    const designBtns = document.querySelectorAll('.design-btn');
    const designInput = document.getElementById('design');
    designBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        designBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        designInput.value = btn.dataset.style;
      });
    });

    // Form submission
    const form = document.getElementById('create-form');
    const submitBtn = document.getElementById('submit-btn');
    const qrBox = document.getElementById('qr-box');
    const outputDetails = document.getElementById('output-details');
    const shortUrlDisplay = document.getElementById('short-url-display');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const testBtn = document.getElementById('test-btn');
    const statusBadge = document.getElementById('status-badge');
    const scansDisplay = document.getElementById('scans-display');
    const toast = document.getElementById('toast');

    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const target_url = document.getElementById('target_url').value.trim();
      const design = designInput.value;
      const max_scans_val = document.getElementById('max_scans').value.trim();
      const max_scans = max_scans_val ? parseInt(max_scans_val, 10) : null;

      if (!target_url) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Generating...';

      try {
        const res = await fetch('/api/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target_url, design, max_scans })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to generate QR');
        }

        const data = await res.json();
        currentRawSvg = data.qr_svg;

        // Render SVG preview
        qrBox.innerHTML = data.qr_svg;
        outputDetails.style.display = 'block';
        shortUrlDisplay.textContent = data.short_url;
        testBtn.href = data.short_url;

        // Download data URI
        const blobUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data.qr_svg);
        downloadBtn.href = blobUri;
        downloadBtn.setAttribute('download', 'qr-' + data.id + '.svg');

        // Status badge
        statusBadge.textContent = 'Active';
        statusBadge.className = 'status-badge status-active';
        scansDisplay.textContent = '0 / ' + (max_scans ? max_scans : '∞');

        showToast('QR Code Generated Successfully!');
      } catch (err) {
        alert(err.message || 'Error creating QR code');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> Generate QR Code';
      }
    });

    // Copy short link
    copyBtn.addEventListener('click', async () => {
      const url = shortUrlDisplay.textContent;
      if (url && url !== 'https://...') {
        await navigator.clipboard.writeText(url);
        showToast('Short URL copied to clipboard!');
      }
    });

    // Analytics lookup
    const lookupBtn = document.getElementById('lookup-btn');
    const statsIdInput = document.getElementById('stats-id-input');
    const statsResult = document.getElementById('stats-result');

    lookupBtn.addEventListener('click', async () => {
      let rawId = statsIdInput.value.trim();
      if (!rawId) return;

      // Clean ID if full URL pasted
      if (rawId.includes('/r/')) {
        rawId = rawId.split('/r/').pop().split('?')[0].split('#')[0];
      } else if (rawId.includes('/stats/')) {
        rawId = rawId.split('/stats/').pop().split('?')[0].split('#')[0];
      }

      lookupBtn.disabled = true;
      try {
        const res = await fetch('/stats/' + rawId);
        if (!res.ok) {
          throw new Error('QR code with ID "' + rawId + '" was not found.');
        }
        const data = await res.json();
        statsResult.style.display = 'block';
        document.getElementById('stats-id-title').textContent = 'ID: ' + data.id;
        
        const badge = document.getElementById('stats-status-badge');
        badge.textContent = data.status;
        badge.className = 'status-badge ' + (data.status === 'active' ? 'status-active' : 'status-inactive');

        document.getElementById('stats-scan-count').textContent = data.scan_count;
        document.getElementById('stats-max-scans').textContent = data.max_scans ? data.max_scans : 'Unlimited';
        document.getElementById('stats-design').textContent = data.design || 'classic';
        document.getElementById('stats-created').textContent = new Date(data.created_at).toLocaleDateString();
        
        const targetLink = document.getElementById('stats-target-link');
        targetLink.href = data.target_url;
        targetLink.textContent = data.target_url;
      } catch (err) {
        alert(err.message || 'Lookup failed');
      } finally {
        lookupBtn.disabled = false;
      }
    });
  </script>
</body>
</html>`;
}

export function renderInactivePage(reason = 'This QR code is no longer active'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Code Inactive — QR Forge</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #090d16;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      margin: 0;
      background-image: radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.12) 0%, transparent 60%);
    }
    .card {
      background: rgba(18, 24, 38, 0.9);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .icon-box {
      width: 64px;
      height: 64px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: #f87171;
    }
    h1 {
      font-size: 1.6rem;
      font-weight: 800;
      margin-bottom: 0.75rem;
      color: #ffffff;
    }
    p {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1.75rem;
    }
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #6366f1;
      color: #fff;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #4f46e5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
      </svg>
    </div>
    <h1>QR Code Inactive</h1>
    <p>${reason}. The scan limit has been reached or this code has been deactivated by the organizer.</p>
    <a href="/" class="btn">Go to QR Forge</a>
  </div>
</body>
</html>`;
}

export function renderNotFoundPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invalid QR Code — QR Forge</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #090d16;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      margin: 0;
    }
    .card {
      background: rgba(18, 24, 38, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .icon-box {
      width: 64px;
      height: 64px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: #fbbf24;
    }
    h1 {
      font-size: 1.6rem;
      font-weight: 800;
      margin-bottom: 0.75rem;
      color: #ffffff;
    }
    p {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1.75rem;
    }
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #6366f1;
      color: #fff;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .btn:hover {
      background: #4f46e5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <h1>Invalid QR Code</h1>
    <p>The requested QR code does not exist or the link was mistyped.</p>
    <a href="/" class="btn">Create a QR Code</a>
  </div>
</body>
</html>`;
}
