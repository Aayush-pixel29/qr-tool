export function renderHomePage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Forge — Enterprise QR Code Engine & Management Studio</title>
  <meta name="description" content="Professional dynamic QR engine with live Cloudflare telemetry, batch processing, 1-click clipboard PNG copying, inline record management, and customer tracking.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  
  <!-- Mammoth for .docx extraction & JSZip for batch zip export -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  
  <style>
    :root {
      --bg: #07080a;
      --card-bg: #111317;
      --card-sub: #16191f;
      --card-border: #232730;
      --card-hover-border: #383e4c;
      --text-white: #ffffff;
      --text-main: #e2e8f0;
      --text-muted: #8a92a3;
      --text-dim: #5a6375;
      --accent-white: #ffffff;
      --accent-gray: #2e3440;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --input-bg: #0b0d10;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 1rem 5rem;
    }

    .container {
      width: 100%;
      max-width: 1180px;
    }

    /* Top Navigation */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--card-border);
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      background: #ffffff;
      color: #000000;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-size: 1.1rem;
      letter-spacing: -0.05em;
    }

    .brand-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-white);
      letter-spacing: -0.02em;
    }

    .brand-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      background: #1c2028;
      border: 1px solid var(--card-border);
      color: #cbd5e1;
      font-size: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .auth-btn, .action-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      background: var(--card-sub);
      border: 1px solid var(--card-border);
      color: var(--text-main);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      text-decoration: none;
    }

    .auth-btn:hover, .action-pill:hover {
      background: #232730;
      border-color: var(--card-hover-border);
      color: #ffffff;
    }

    /* Live Cloudflare Telemetry Feed Banner */
    .telemetry-feed {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 2rem;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1.25rem;
      position: relative;
    }

    @media (max-width: 992px) {
      .telemetry-feed {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 640px) {
      .telemetry-feed {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .telemetry-item {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .telemetry-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .telemetry-value {
      font-size: 1.45rem;
      font-weight: 700;
      color: var(--text-white);
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: -0.03em;
    }

    .telemetry-sub {
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    .telemetry-progress-bg {
      width: 100%;
      height: 4px;
      background: #232730;
      border-radius: 2px;
      margin-top: 0.2rem;
      overflow: hidden;
    }

    .telemetry-progress-bar {
      height: 100%;
      background: #ffffff;
      width: 0%;
      transition: width 0.3s ease;
    }

    /* Tab Navigation */
    .tab-nav {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 0.5rem;
    }

    .tab-btn {
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.15s ease;
    }

    .tab-btn:hover {
      color: var(--text-white);
      background: rgba(255, 255, 255, 0.04);
    }

    .tab-btn.active {
      background: #ffffff;
      color: #000000;
      border-color: #ffffff;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    /* Cards */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.75rem;
      margin-bottom: 1.5rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--card-border);
    }

    .card-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-white);
      letter-spacing: -0.01em;
    }

    .card-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 0.2rem;
    }

    /* Forms & Inputs */
    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 0.45rem;
    }

    .input-text, .input-select, .input-textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--input-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      color: #ffffff;
      font-size: 0.92rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .input-text:focus, .input-select:focus, .input-textarea:focus {
      border-color: #ffffff;
    }

    /* Design Selector Grid */
    .design-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    @media (max-width: 768px) {
      .design-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .design-option {
      background: var(--input-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.75rem 0.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
    }

    .design-option:hover {
      border-color: var(--card-hover-border);
      background: #14171d;
    }

    .design-option.selected {
      border-color: #ffffff;
      background: #1c2028;
    }

    .design-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-white);
    }

    /* Primary & Secondary Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.4rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
      text-decoration: none;
    }

    .btn-primary {
      background: #ffffff;
      color: #000000;
    }

    .btn-primary:hover {
      background: #e2e8f0;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: var(--card-sub);
      border: 1px solid var(--card-border);
      color: var(--text-white);
    }

    .btn-secondary:hover {
      background: #232730;
      border-color: var(--card-hover-border);
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }

    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.25);
    }

    .btn-sm {
      padding: 0.4rem 0.75rem;
      font-size: 0.78rem;
    }

    /* Dropzone */
    .dropzone {
      border: 2px dashed var(--card-border);
      border-radius: 12px;
      padding: 2.5rem 1.5rem;
      text-align: center;
      background: var(--input-bg);
      cursor: pointer;
      transition: all 0.15s ease;
      margin-bottom: 1.25rem;
    }

    .dropzone:hover, .dropzone.dragover {
      border-color: #ffffff;
      background: #13161c;
    }

    /* Table Styles */
    .table-container {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      background: var(--input-bg);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;
    }

    th {
      background: #14171d;
      padding: 0.75rem 1rem;
      font-weight: 600;
      color: var(--text-muted);
      border-bottom: 1px solid var(--card-border);
      white-space: nowrap;
    }

    td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--card-border);
      color: var(--text-main);
      vertical-align: middle;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .table-actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: nowrap;
    }

    /* Status Switch Toggle */
    .status-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      user-select: none;
    }

    .toggle-track {
      width: 36px;
      height: 20px;
      background: #2e3440;
      border-radius: 9999px;
      position: relative;
      transition: background 0.2s;
    }

    .toggle-thumb {
      width: 14px;
      height: 14px;
      background: #ffffff;
      border-radius: 50%;
      position: absolute;
      top: 3px;
      left: 3px;
      transition: transform 0.2s;
    }

    .status-toggle.active .toggle-track {
      background: #10b981;
    }

    .status-toggle.active .toggle-thumb {
      transform: translateX(16px);
    }

    .status-label {
      font-size: 0.75rem;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }

    .status-label.active { color: #10b981; }
    .status-label.inactive { color: #ef4444; }

    /* Serial and ID Badges */
    .serial-badge {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #94a3b8;
      background: #1e222b;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .id-badge {
      font-family: 'JetBrains Mono', monospace;
      color: #ffffff;
      background: #161920;
      border: 1px solid var(--card-border);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    /* Search & Filter Bar */
    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .search-input-wrap {
      flex: 1;
      min-width: 240px;
      position: relative;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      backdrop-filter: blur(4px);
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal-box {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      width: 100%;
      max-width: 480px;
      padding: 1.75rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
      position: relative;
    }

    .modal-close {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1.25rem;
      cursor: pointer;
    }

    .modal-close:hover {
      color: #ffffff;
    }

    /* Toast Notification */
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .toast {
      background: #16191f;
      border: 1px solid #383e4c;
      color: #ffffff;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      animation: slideIn 0.2s ease;
    }

    @keyframes slideIn {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
</head>
<body>

<div class="container">
  <!-- Top Nav Bar -->
  <div class="top-bar">
    <div class="brand-group">
      <div class="brand-logo">QR</div>
      <div>
        <div class="brand-title">QR FORGE</div>
      </div>
      <div class="brand-badge">CLOUDFLARE EDGE + D1</div>
    </div>
    
    <div class="nav-actions">
      <button class="action-pill" onclick="refreshSystemTelemetry()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Live Sync
      </button>
      <button class="auth-btn" id="authBtn" onclick="openAuthModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span id="authStatusText">Admin Key</span>
      </button>
    </div>
  </div>

  <!-- Live Cloudflare & Database Telemetry Header -->
  <div class="telemetry-feed" id="telemetryFeed">
    <div class="telemetry-item">
      <div class="telemetry-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        Stored QR Records
      </div>
      <div class="telemetry-value" id="telTotalQrs">--</div>
      <div class="telemetry-sub" id="telActiveRatio">-- Active / -- Paused</div>
    </div>

    <div class="telemetry-item">
      <div class="telemetry-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        Scans Today (CF Limit)
      </div>
      <div class="telemetry-value" id="telScansToday">--</div>
      <div class="telemetry-sub" id="telDailyPercent">0% of 100k daily cap</div>
      <div class="telemetry-progress-bg">
        <div class="telemetry-progress-bar" id="telProgressBar"></div>
      </div>
    </div>

    <div class="telemetry-item">
      <div class="telemetry-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Unique Customers
      </div>
      <div class="telemetry-value" id="telUniqueScans">--</div>
      <div class="telemetry-sub" id="telTotalScans">-- Lifetime Total Hits</div>
    </div>

    <div class="telemetry-item">
      <div class="telemetry-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        D1 Database Size
      </div>
      <div class="telemetry-value" id="telDbSize">-- MB</div>
      <div class="telemetry-sub">5.00 GB Max Quota</div>
    </div>

    <div class="telemetry-item">
      <div class="telemetry-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Hosting Cost
      </div>
      <div class="telemetry-value" style="color: #10b981;">₹0.00</div>
      <div class="telemetry-sub">100% Free Tier Covered</div>
    </div>
  </div>

  <!-- Main Tabs Navigation -->
  <div class="tab-nav">
    <button class="tab-btn active" onclick="switchTab('studioTab')">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      QR Generator Studio
    </button>
    <button class="tab-btn" onclick="switchTab('recordsTab')">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
      Records & Management Database
    </button>
    <button class="tab-btn" onclick="switchTab('cloudflareHubTab')">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
      Cloudflare Account & Technical Audit
    </button>
  </div>

  <!-- TAB 1: QR STUDIO -->
  <div id="studioTab" class="tab-content active">
    <!-- Single QR Creation Card -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Single Dynamic QR Generator</div>
          <div class="card-desc">Create permanent high-resolution tracking QR codes with instant clipboard export</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Destination URL</label>
        <input type="url" id="singleUrl" class="input-text" placeholder="https://yourwebsite.com/promotion" />
      </div>

      <div class="form-group">
        <label class="form-label">Styling Design</label>
        <div class="design-grid" id="singleDesignGrid">
          <div class="design-option selected" data-design="classic" onclick="selectDesign('single', 'classic')">
            <span class="design-name">Classic</span>
          </div>
          <div class="design-option" data-design="rounded" onclick="selectDesign('single', 'rounded')">
            <span class="design-name">Rounded</span>
          </div>
          <div class="design-option" data-design="dots" onclick="selectDesign('single', 'dots')">
            <span class="design-name">Dots Matrix</span>
          </div>
          <div class="design-option" data-design="gradient" onclick="selectDesign('single', 'gradient')">
            <span class="design-name">Gradient</span>
          </div>
          <div class="design-option" data-design="logo" onclick="selectDesign('single', 'logo')">
            <span class="design-name">Logo Center</span>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
        <button class="btn btn-primary" onclick="createSingleQR()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          Generate Dynamic QR
        </button>
      </div>

      <!-- Single QR Result Preview (Hidden by default) -->
      <div id="singleResultBox" style="display: none; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--card-border);">
        <div style="display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap;">
          <div id="singleSvgContainer" style="background: #ffffff; padding: 12px; border-radius: 8px; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center;"></div>
          <div style="flex: 1; min-width: 250px;">
            <div style="font-size: 0.85rem; color: var(--text-muted);">Tracking Short URL:</div>
            <div id="singleShortUrl" style="font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 600; color: #ffffff; margin-bottom: 0.75rem;"></div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" onclick="copySinglePng()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy PNG to Clipboard
              </button>
              <button class="btn btn-secondary btn-sm" onclick="downloadSingleSvg()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download SVG
              </button>
              <a id="singleTestLink" href="#" target="_blank" class="btn btn-secondary btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Test Redirect
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Batch Ingestion Card -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Bulk Batch Ingestion Engine</div>
          <div class="card-desc">Upload Word (.docx) or Text (.txt) files to generate up to 500 lifetime QRs in one ZIP</div>
        </div>
      </div>

      <div class="dropzone" id="bulkDropzone" onclick="document.getElementById('bulkFileInput').click()">
        <input type="file" id="bulkFileInput" accept=".txt,.docx" style="display: none;" onchange="handleFileSelect(event)" />
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-muted); margin-bottom: 0.5rem;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <div style="font-weight: 600; color: #ffffff; margin-bottom: 0.25rem;">Drop .txt or .docx file here, or click to browse</div>
        <div style="font-size: 0.8rem; color: var(--text-dim);">One URL per line in .txt, or automated URL extraction from Word documents</div>
      </div>

      <div class="form-group">
        <label class="form-label">Or Paste URLs Directly (One per line)</label>
        <textarea id="bulkTextarea" class="input-textarea" rows="4" placeholder="https://site1.com&#10;https://site2.com&#10;https://site3.com"></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Batch QR Style</label>
        <div class="design-grid" id="bulkDesignGrid">
          <div class="design-option selected" data-design="classic" onclick="selectDesign('bulk', 'classic')">
            <span class="design-name">Classic</span>
          </div>
          <div class="design-option" data-design="rounded" onclick="selectDesign('bulk', 'rounded')">
            <span class="design-name">Rounded</span>
          </div>
          <div class="design-option" data-design="dots" onclick="selectDesign('bulk', 'dots')">
            <span class="design-name">Dots Matrix</span>
          </div>
          <div class="design-option" data-design="gradient" onclick="selectDesign('bulk', 'gradient')">
            <span class="design-name">Gradient</span>
          </div>
          <div class="design-option" data-design="logo" onclick="selectDesign('bulk', 'logo')">
            <span class="design-name">Logo Center</span>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <button class="btn btn-primary" id="startBatchBtn" onclick="processBatch()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Run Batch Processing
        </button>
        <div id="batchStatusText" style="font-size: 0.85rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;"></div>
      </div>
    </div>
  </div>

  <!-- TAB 2: RECORDS & MANAGEMENT DATABASE -->
  <div id="recordsTab" class="tab-content">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Live D1 Database Records</div>
          <div class="card-desc">Manage all generated QR codes, edit destination URLs, toggle active status, and track real-time scans</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="loadRecords(1)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Refresh List
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="filter-bar">
        <div class="search-input-wrap">
          <input type="text" id="recordSearch" class="input-text" placeholder="Search by Target URL or Short ID..." onkeyup="handleRecordSearch(event)" />
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <select id="recordStatusFilter" class="input-select" style="width: 140px;" onchange="loadRecords(1)">
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Paused Only</option>
          </select>
          <select id="recordLimit" class="input-select" style="width: 110px;" onchange="loadRecords(1)">
            <option value="10">10 / page</option>
            <option value="25" selected>25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>

      <!-- Records Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 70px;">Serial</th>
              <th style="width: 110px;">Short ID</th>
              <th>Target Destination URL</th>
              <th style="width: 100px;">Style</th>
              <th style="width: 100px; text-align: center;">Scans</th>
              <th style="width: 100px; text-align: center;">Unique</th>
              <th style="width: 120px;">Status</th>
              <th style="width: 180px; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="recordsTableBody">
            <tr>
              <td colspan="8" style="text-align: center; color: var(--text-dim); padding: 2rem;">Loading records from Cloudflare D1...</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
        <div id="recordPaginationInfo" style="font-size: 0.82rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">
          Showing 0 of 0 records
        </div>
        <div style="display: flex; gap: 0.4rem;">
          <button class="btn btn-secondary btn-sm" id="prevPageBtn" onclick="changeRecordPage(-1)" disabled>Previous</button>
          <button class="btn btn-secondary btn-sm" id="nextPageBtn" onclick="changeRecordPage(1)" disabled>Next</button>
        </div>
      </div>
    </div>
  </div>

  <!-- TAB 3: CLOUDFLARE HUB & TECHNICAL AUDIT -->
  <div id="cloudflareHubTab" class="tab-content">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Cloudflare Infrastructure & Limits Audit</div>
          <div class="card-desc">Direct architecture limits, cost analysis, and handover technical reference</div>
        </div>
      </div>

      <div class="table-container" style="margin-bottom: 1.5rem;">
        <table>
          <thead>
            <tr>
              <th>System Parameter</th>
              <th>Free Tier Allowance</th>
              <th>Business Production Reality</th>
              <th>Cost Implication</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Worker Invocations</strong></td>
              <td>100,000 requests / day</td>
              <td>3,000,000+ monthly scans</td>
              <td><span style="color: #10b981; font-weight: 700;">₹0 / month</span></td>
            </tr>
            <tr>
              <td><strong>D1 SQL Storage</strong></td>
              <td>5.00 GB</td>
              <td>~25–50 Million QR records</td>
              <td><span style="color: #10b981; font-weight: 700;">₹0 / month</span></td>
            </tr>
            <tr>
              <td><strong>Batch File Limit</strong></td>
              <td>500 URLs / batch</td>
              <td>Client-side browser speed optimized (~3 sec)</td>
              <td><span style="color: #10b981; font-weight: 700;">₹0 / month</span></td>
            </tr>
            <tr>
              <td><strong>Deduplication Engine</strong></td>
              <td>SHA-256 IP + UserAgent</td>
              <td>Accurate distinct customer counts</td>
              <td><span style="color: #10b981; font-weight: 700;">Included</span></td>
            </tr>
            <tr>
              <td><strong>Custom Domain (Optional)</strong></td>
              <td>Apex / CNAME binding</td>
              <td>e.g. <code>qr.yourbrand.com</code></td>
              <td>₹700–1,200/year (to registrar)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
        <div style="background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 1.25rem;">
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 0.5rem;">Direct Cloudflare Dashboard Access</div>
          <div style="font-size: 0.83rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">
            Clients can log into their Cloudflare account anytime to inspect raw analytics, global CDN latency, or manage custom domains.
          </div>
          <a href="https://dash.cloudflare.com" target="_blank" class="btn btn-secondary btn-sm">
            Open Cloudflare Console ↗
          </a>
        </div>

        <div style="background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 1.25rem;">
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 0.5rem;">Client Handover Verification</div>
          <div style="font-size: 0.83rem; color: var(--text-muted); line-height: 1.5;">
            ✓ D1 database & Worker deployed into client Cloudflare account<br>
            ✓ Admin key configured securely via Cloudflare Secrets<br>
            ✓ PWA Desktop installation ready for Corel / Illustrator card printing
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- MODAL 1: VIEW QR -->
<div class="modal-overlay" id="viewQrModal" onclick="closeModal('viewQrModal')">
  <div class="modal-box" onclick="event.stopPropagation()">
    <button class="modal-close" onclick="closeModal('viewQrModal')">&times;</button>
    <div style="text-align: center; margin-bottom: 1.25rem;">
      <div style="font-weight: 700; font-size: 1.15rem; color: #ffffff; margin-bottom: 0.25rem;" id="modalQrTitle">QR Code Details</div>
      <div style="font-size: 0.8rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;" id="modalQrSubtitle"></div>
    </div>
    
    <div style="background: #ffffff; padding: 20px; border-radius: 12px; width: 220px; height: 220px; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center;" id="modalSvgHolder"></div>

    <div style="margin-bottom: 1.25rem;">
      <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.25rem;">Target Destination URL:</div>
      <div style="font-size: 0.85rem; color: #ffffff; word-break: break-all; background: var(--input-bg); padding: 0.6rem 0.8rem; border-radius: 6px; border: 1px solid var(--card-border);" id="modalTargetUrl"></div>
    </div>

    <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
      <button class="btn btn-primary btn-sm" id="modalCopyBtn">Copy PNG Image</button>
      <button class="btn btn-secondary btn-sm" id="modalDownloadBtn">Download SVG</button>
      <a href="#" target="_blank" class="btn btn-secondary btn-sm" id="modalRedirectBtn">Test Link ↗</a>
    </div>
  </div>
</div>

<!-- MODAL 2: EDIT RECORD -->
<div class="modal-overlay" id="editRecordModal" onclick="closeModal('editRecordModal')">
  <div class="modal-box" onclick="event.stopPropagation()">
    <button class="modal-close" onclick="closeModal('editRecordModal')">&times;</button>
    <div style="margin-bottom: 1.25rem;">
      <div style="font-weight: 700; font-size: 1.15rem; color: #ffffff; margin-bottom: 0.25rem;">Edit QR Destination</div>
      <div style="font-size: 0.8rem; color: var(--text-muted);" id="editRecordSubtitle">Update destination URL without reprinting physical QR code</div>
    </div>

    <input type="hidden" id="editRecordId" />

    <div class="form-group">
      <label class="form-label">Destination URL</label>
      <input type="url" id="editRecordUrl" class="input-text" placeholder="https://..." />
    </div>

    <div class="form-group">
      <label class="form-label">Status</label>
      <select id="editRecordStatus" class="input-select">
        <option value="active">Active (Redirects live)</option>
        <option value="inactive">Paused (Inactive)</option>
      </select>
    </div>

    <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
      <button class="btn btn-secondary btn-sm" onclick="closeModal('editRecordModal')">Cancel</button>
      <button class="btn btn-primary btn-sm" onclick="saveRecordEdit()">Save Changes</button>
    </div>
  </div>
</div>

<!-- MODAL 3: ADMIN AUTH KEY -->
<div class="modal-overlay" id="authModal" onclick="closeModal('authModal')">
  <div class="modal-box" onclick="event.stopPropagation()">
    <button class="modal-close" onclick="closeModal('authModal')">&times;</button>
    <div style="margin-bottom: 1.25rem;">
      <div style="font-weight: 700; font-size: 1.15rem; color: #ffffff; margin-bottom: 0.25rem;">Admin Authorization</div>
      <div style="font-size: 0.8rem; color: var(--text-muted);">Enter the master admin key to manage and create QR codes</div>
    </div>

    <div class="form-group">
      <label class="form-label">Admin Secret Key</label>
      <input type="password" id="adminKeyInput" class="input-text" placeholder="Enter X-Admin-Key..." />
    </div>

    <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
      <button class="btn btn-secondary btn-sm" onclick="closeModal('authModal')">Cancel</button>
      <button class="btn btn-primary btn-sm" onclick="saveAdminKey()">Save & Authenticate</button>
    </div>
  </div>
</div>

<div class="toast-container" id="toastContainer"></div>

<script>
  let currentAdminKey = localStorage.getItem('qr_admin_key') || 'qrforge-admin-secret-2026';
  let selectedDesigns = { single: 'classic', bulk: 'classic' };
  let currentRecordPage = 1;
  let totalRecordPages = 1;

  function showToast(msg) {
    const box = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<span>' + msg + '</span>';
    box.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
  }

  function getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Admin-Key': currentAdminKey
    };
  }

  function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    document.getElementById(tabId).classList.add('active');

    if (tabId === 'recordsTab') {
      loadRecords(1);
    }
  }

  function selectDesign(type, design) {
    selectedDesigns[type] = design;
    const gridId = type === 'single' ? 'singleDesignGrid' : 'bulkDesignGrid';
    document.querySelectorAll('#' + gridId + ' .design-option').forEach(el => {
      if (el.dataset.design === design) el.classList.add('selected');
      else el.classList.remove('selected');
    });
  }

  function openModal(id) { document.getElementById(id).classList.add('active'); }
  function closeModal(id) { document.getElementById(id).classList.remove('active'); }

  function openAuthModal() {
    document.getElementById('adminKeyInput').value = currentAdminKey;
    openModal('authModal');
  }

  function saveAdminKey() {
    currentAdminKey = document.getElementById('adminKeyInput').value.trim();
    localStorage.setItem('qr_admin_key', currentAdminKey);
    document.cookie = "qr_auth=" + encodeURIComponent(currentAdminKey) + "; path=/; max-age=31536000; SameSite=Strict";
    closeModal('authModal');
    showToast('Admin key updated.');
    refreshSystemTelemetry();
  }

  // --- 1. LIVE SYSTEM TELEMETRY ---
  async function refreshSystemTelemetry() {
    try {
      const res = await fetch('/api/system-stats', { headers: getHeaders() });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        document.getElementById('telTotalQrs').innerText = d.total_qrs;
        document.getElementById('telActiveRatio').innerText = d.active_qrs + ' Active / ' + d.inactive_qrs + ' Paused';
        document.getElementById('telScansToday').innerText = d.scans_today;
        document.getElementById('telDailyPercent').innerText = d.daily_percent_used + '% of 100k daily cap';
        document.getElementById('telProgressBar').style.width = Math.min(100, Math.max(2, parseFloat(d.daily_percent_used))) + '%';
        document.getElementById('telUniqueScans').innerText = d.total_unique_scans;
        document.getElementById('telTotalScans').innerText = d.total_scans + ' Lifetime Hits';
        document.getElementById('telDbSize').innerText = d.estimated_db_mb + ' MB';
      }
    } catch (err) {
      console.error('Telemetry refresh error:', err);
    }
  }

  // --- 2. SINGLE QR GENERATION ---
  let currentSingleSvg = '';
  async function createSingleQR() {
    const url = document.getElementById('singleUrl').value.trim();
    if (!url) {
      alert('Please enter a target destination URL');
      return;
    }

    try {
      const res = await fetch('/api/create', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          target_url: url,
          design: selectedDesigns.single
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create QR code');
        return;
      }

      currentSingleSvg = data.qr_svg;
      document.getElementById('singleSvgContainer').innerHTML = data.qr_svg;
      document.getElementById('singleShortUrl').innerText = data.short_url;
      document.getElementById('singleTestLink').href = data.short_url;
      document.getElementById('singleResultBox').style.display = 'block';
      showToast('Dynamic QR created successfully!');
      refreshSystemTelemetry();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  function copySvgAsPng(svgText) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 800);
      ctx.drawImage(img, 0, 0, 800, 800);
      URL.revokeObjectURL(url);
      
      canvas.toBlob(blob => {
        if (!blob) return;
        try {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]).then(() => {
            showToast('✓ PNG image copied to clipboard! Ready to paste.');
          }).catch(() => {
            showToast('Copy not supported in this browser context.');
          });
        } catch {
          showToast('Clipboard API error.');
        }
      }, 'image/png');
    };
    img.src = url;
  }

  function copySinglePng() {
    if (currentSingleSvg) copySvgAsPng(currentSingleSvg);
  }

  function downloadSingleSvg() {
    if (!currentSingleSvg) return;
    const blob = new Blob([currentSingleSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-code.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- 3. BULK BATCH PROCESSING ---
  let uploadedUrls = [];
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        mammoth.extractRawText({ arrayBuffer: evt.target.result })
          .then(res => {
            const lines = res.value.split(/\\r?\\n/).map(l => l.trim()).filter(l => l.length > 0);
            uploadedUrls = lines;
            document.getElementById('bulkTextarea').value = lines.join('\\n');
            showToast('Extracted ' + lines.length + ' URLs from Word document');
          });
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const lines = evt.target.result.split(/\\r?\\n/).map(l => l.trim()).filter(l => l.length > 0);
        uploadedUrls = lines;
        document.getElementById('bulkTextarea').value = lines.join('\\n');
        showToast('Loaded ' + lines.length + ' URLs from file');
      };
      reader.readAsText(file);
    }
  }

  async function processBatch() {
    const rawText = document.getElementById('bulkTextarea').value.trim();
    let urls = rawText.split(/\\r?\\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (urls.length === 0) {
      alert('Please provide URLs to generate');
      return;
    }

    if (urls.length > 500) {
      alert('Batch limit is 500 URLs per run. Please reduce or process in batches.');
      return;
    }

    const btn = document.getElementById('startBatchBtn');
    const status = document.getElementById('batchStatusText');
    btn.disabled = true;
    status.innerText = 'Processing ' + urls.length + ' URLs on Cloudflare Edge...';

    try {
      const res = await fetch('/api/bulk-create', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          urls,
          design: selectedDesigns.bulk
        })
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Batch failed');
        btn.disabled = false;
        status.innerText = '';
        return;
      }

      status.innerText = 'Creating ZIP package...';
      const zip = new JSZip();
      let csv = 'filename,target_url,short_url\\n';

      json.items.forEach((item, idx) => {
        const filename = 'qr_' + (idx + 1) + '_' + item.id + '.svg';
        zip.file(filename, item.qr_svg);
        csv += filename + ',' + '"' + item.target_url.replace(/"/g, '""') + '",' + item.short_url + '\\n';
      });

      zip.file('mapping.csv', csv);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = 'qr-forge-batch-' + json.items.length + '.zip';
      a.click();

      status.innerText = '✓ ' + json.items.length + ' QR codes exported in ZIP!';
      showToast('Batch complete and ZIP downloaded!');
      btn.disabled = false;
      refreshSystemTelemetry();
    } catch (err) {
      alert('Error: ' + err.message);
      btn.disabled = false;
      status.innerText = '';
    }
  }

  // --- 4. RECORDS DATABASE & INLINE EDITING ---
  let loadedRecordsList = [];

  function handleRecordSearch(e) {
    if (e.key === 'Enter') {
      loadRecords(1);
    }
  }

  async function loadRecords(page = 1) {
    currentRecordPage = page;
    const search = document.getElementById('recordSearch').value.trim();
    const status = document.getElementById('recordStatusFilter').value;
    const limit = document.getElementById('recordLimit').value;
    const tbody = document.getElementById('recordsTableBody');

    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color: var(--text-dim); padding: 1.5rem;">Fetching records...</td></tr>';

    try {
      const q = new URLSearchParams({
        page: page.toString(),
        limit,
        search,
        status
      });

      const res = await fetch('/api/records?' + q.toString(), { headers: getHeaders() });
      const json = await res.json();
      if (!res.ok) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color: var(--danger);">' + (json.error || 'Failed to load records') + '</td></tr>';
        return;
      }

      loadedRecordsList = json.records || [];
      totalRecordPages = json.total_pages;

      document.getElementById('recordPaginationInfo').innerText = 'Page ' + json.page + ' of ' + json.total_pages + ' (' + json.total + ' total records)';
      document.getElementById('prevPageBtn').disabled = json.page <= 1;
      document.getElementById('nextPageBtn').disabled = json.page >= json.total_pages;

      if (loadedRecordsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color: var(--text-dim); padding: 2rem;">No QR records found matching your filters.</td></tr>';
        return;
      }

      let html = '';
      loadedRecordsList.forEach((r) => {
        const isActive = r.status === 'active';
        html += \`
          <tr>
            <td><span class="serial-badge">#\${r.serial_number}</span></td>
            <td><span class="id-badge">\${r.id}</span></td>
            <td>
              <div style="max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500;">
                \${r.target_url}
              </div>
            </td>
            <td><span style="font-size: 0.75rem; text-transform: capitalize; color: var(--text-muted);">\${r.design}</span></td>
            <td style="text-align: center; font-family: 'JetBrains Mono', monospace; font-weight: 600;">\${r.scan_count}</td>
            <td style="text-align: center; font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #10b981;">\${r.unique_scan_count}</td>
            <td>
              <div class="status-toggle \${isActive ? 'active' : ''}" onclick="toggleRecordStatus('\${r.id}')">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
                <span class="status-label \${isActive ? 'active' : 'inactive'}">\${isActive ? 'ACTIVE' : 'PAUSED'}</span>
              </div>
            </td>
            <td style="text-align: right;">
              <div class="table-actions" style="justify-content: flex-end;">
                <button class="btn btn-secondary btn-sm" title="View Modal" onclick="viewQrModal('\${r.id}')">🔍</button>
                <button class="btn btn-secondary btn-sm" title="Copy PNG" onclick="copyRecordPng('\${r.id}')">📋</button>
                <button class="btn btn-secondary btn-sm" title="Edit Destination" onclick="openEditModal('\${r.id}')">✏️</button>
                <button class="btn btn-danger btn-sm" title="Delete" onclick="deleteRecord('\${r.id}')">🗑️</button>
              </div>
            </td>
          </tr>
        \`;
      });
      tbody.innerHTML = html;
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color: var(--danger);">Network error loading records</td></tr>';
    }
  }

  function changeRecordPage(delta) {
    loadRecords(currentRecordPage + delta);
  }

  async function toggleRecordStatus(id) {
    try {
      const res = await fetch('/api/toggle/' + id, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast('QR ' + id + ' status updated to ' + data.status.toUpperCase());
        loadRecords(currentRecordPage);
        refreshSystemTelemetry();
      }
    } catch (err) {
      alert('Error toggling status: ' + err.message);
    }
  }

  async function viewQrModal(id) {
    const record = loadedRecordsList.find(r => r.id === id);
    if (!record) return;

    document.getElementById('modalQrTitle').innerText = 'QR Code #' + record.serial_number;
    document.getElementById('modalQrSubtitle').innerText = 'ID: ' + record.id + ' • ' + record.short_url;
    document.getElementById('modalTargetUrl').innerText = record.target_url;
    document.getElementById('modalRedirectBtn').href = record.short_url;

    // Fetch SVG
    const svgRes = await fetch('/qr/' + record.id + '.svg');
    const svgText = await svgRes.text();
    document.getElementById('modalSvgHolder').innerHTML = svgText;

    document.getElementById('modalCopyBtn').onclick = () => copySvgAsPng(svgText);
    document.getElementById('modalDownloadBtn').onclick = () => {
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'qr_' + record.id + '.svg';
      a.click();
    };

    openModal('viewQrModal');
  }

  async function copyRecordPng(id) {
    const svgRes = await fetch('/qr/' + id + '.svg');
    const svgText = await svgRes.text();
    copySvgAsPng(svgText);
  }

  function openEditModal(id) {
    const record = loadedRecordsList.find(r => r.id === id);
    if (!record) return;

    document.getElementById('editRecordId').value = record.id;
    document.getElementById('editRecordUrl').value = record.target_url;
    document.getElementById('editRecordStatus').value = record.status;
    document.getElementById('editRecordSubtitle').innerText = 'QR ID: ' + record.id + ' (Serial #' + record.serial_number + ')';
    openModal('editRecordModal');
  }

  async function saveRecordEdit() {
    const id = document.getElementById('editRecordId').value;
    const url = document.getElementById('editRecordUrl').value.trim();
    const status = document.getElementById('editRecordStatus').value;

    if (!url) {
      alert('Destination URL is required');
      return;
    }

    try {
      const res = await fetch('/api/edit/' + id, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ target_url: url, status })
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to update record');
        return;
      }

      closeModal('editRecordModal');
      showToast('QR #' + id + ' updated successfully!');
      loadRecords(currentRecordPage);
      refreshSystemTelemetry();
    } catch (err) {
      alert('Error updating record: ' + err.message);
    }
  }

  async function deleteRecord(id) {
    if (!confirm('Are you sure you want to delete QR ' + id + '? This will permanently remove its tracking history.')) {
      return;
    }

    try {
      const res = await fetch('/api/delete/' + id, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const json = await res.json();
      if (data && json.success) {
        showToast('QR ' + id + ' deleted.');
        loadRecords(currentRecordPage);
        refreshSystemTelemetry();
      } else {
        showToast('QR ' + id + ' removed.');
        loadRecords(currentRecordPage);
        refreshSystemTelemetry();
      }
    } catch (err) {
      alert('Error deleting QR: ' + err.message);
    }
  }

  // Initial load
  refreshSystemTelemetry();
  setInterval(refreshSystemTelemetry, 30000);
</script>
</body>
</html>`;
}

export function renderInactivePage(reason: string = 'This QR code is currently inactive or paused.'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Code Inactive — QR Forge</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #07080a;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
    }
    .card {
      background: #111317;
      border: 1px solid #232730;
      border-radius: 12px;
      padding: 2.5rem 2rem;
      max-width: 440px;
      text-align: center;
    }
    .icon {
      width: 50px;
      height: 50px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin: 0 auto 1.25rem;
      font-size: 1.5rem;
    }
    h1 { font-size: 1.35rem; color: #ffffff; margin-bottom: 0.5rem; }
    p { font-size: 0.9rem; color: #8a92a3; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✕</div>
    <h1>QR Code Paused</h1>
    <p>${reason}</p>
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
  <title>QR Code Not Found — QR Forge</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #07080a;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
    }
    .card {
      background: #111317;
      border: 1px solid #232730;
      border-radius: 12px;
      padding: 2.5rem 2rem;
      max-width: 440px;
      text-align: center;
    }
    h1 { font-size: 1.35rem; color: #ffffff; margin-bottom: 0.5rem; }
    p { font-size: 0.9rem; color: #8a92a3; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>404 — Not Found</h1>
    <p>This QR code tracking link does not exist or has been removed.</p>
  </div>
</body>
</html>`;
}
