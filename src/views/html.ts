export function renderHomePage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Forge — Dynamic QR Codes with Manual Controls & Bulk Batch Generator</title>
  <meta name="description" content="Dynamic QR Code generator with real-time unique customer tracking, batch .txt/.docx processing, manual active/inactive switches, and ZIP export.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  
  <!-- Mammoth for .docx extraction & JSZip for batch zip export -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  
  <style>
    :root {
      --bg-dark: #090d16;
      --card-bg: rgba(18, 24, 38, 0.88);
      --card-border: rgba(255, 255, 255, 0.09);
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --accent: #ec4899;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --input-bg: rgba(15, 23, 42, 0.75);
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
      padding: 2rem 1rem 5rem;
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.16) 0%, transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(236, 72, 153, 0.13) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.08) 0%, transparent 60%);
      background-attachment: fixed;
    }

    .container {
      width: 100%;
      max-width: 1080px;
    }

    header {
      text-align: center;
      margin-bottom: 2rem;
      position: relative;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.14);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #818cf8;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .auth-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .auth-badge:hover {
      background: rgba(16, 185, 129, 0.2);
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
      font-size: 1.05rem;
      max-width: 650px;
      margin: 0 auto;
      line-height: 1.55;
    }

    /* Tabs */
    .tabs-nav {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
      background: rgba(15, 23, 42, 0.6);
      padding: 0.35rem;
      border-radius: 14px;
      border: 1px solid var(--card-border);
      max-width: 520px;
      margin-left: auto;
      margin-right: auto;
    }

    .tab-btn {
      flex: 1;
      padding: 0.7rem 1.25rem;
      background: transparent;
      border: none;
      border-radius: 10px;
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .tab-btn:hover {
      color: #fff;
    }

    .tab-btn.active {
      background: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
      color: #fff;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
    }

    .tab-pane {
      display: none;
    }

    .tab-pane.active {
      display: block;
    }

    /* Cards */
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

    input, select, textarea {
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

    textarea {
      resize: vertical;
      min-height: 140px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      line-height: 1.5;
    }

    input:focus, select:focus, textarea:focus {
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
      width: 240px;
      height: 240px;
      background: #ffffff;
      border-radius: 20px;
      padding: 12px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
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
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.5rem;
      width: 100%;
      font-size: 0.775rem;
      color: var(--text-muted);
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      text-align: center;
      align-items: center;
    }

    .meta-val {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #fff;
      display: block;
      margin-top: 0.2rem;
    }

    /* Bulk Upload Styles */
    .dropzone {
      border: 2px dashed rgba(99, 102, 241, 0.35);
      border-radius: 14px;
      padding: 1.5rem 1rem;
      text-align: center;
      background: rgba(15, 23, 42, 0.5);
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 1.25rem;
    }

    .dropzone:hover, .dropzone.dragover {
      border-color: var(--primary);
      background: rgba(99, 102, 241, 0.08);
    }

    .file-input {
      display: none;
    }

    .file-info-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.25);
      color: #38bdf8;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      font-size: 0.8rem;
      margin-top: 0.75rem;
    }

    /* Switch Component */
    .switch-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 38px;
      height: 20px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #334155;
      transition: .25s ease;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.12);
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .25s ease;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #10b981;
    }

    input:checked + .slider:before {
      transform: translateX(18px);
    }

    /* Results Table */
    .results-section {
      margin-top: 2rem;
    }

    .table-container {
      overflow-x: auto;
      margin-top: 1rem;
      border-radius: 12px;
      border: 1px solid var(--card-border);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;
    }

    th {
      background: rgba(15, 23, 42, 0.95);
      padding: 0.85rem 1rem;
      color: var(--text-muted);
      font-weight: 600;
      border-bottom: 1px solid var(--card-border);
      white-space: nowrap;
    }

    td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      vertical-align: middle;
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .table-thumb {
      width: 46px;
      height: 46px;
      background: #fff;
      border-radius: 8px;
      padding: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .table-thumb svg {
      width: 100%;
      height: 100%;
    }

    .btn-zip {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #fff;
      padding: 0.85rem 1.5rem;
      border-radius: 12px;
      border: none;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
      transition: all 0.2s;
    }

    .btn-zip:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 25px -5px rgba(16, 185, 129, 0.55);
    }

    /* Modal / Auth Dialog */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 1rem;
    }

    .modal-overlay.show {
      display: flex;
    }

    .modal-card {
      background: #111827;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 2rem;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 25px 50px rgba(0,0,0,0.7);
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
    <div class="top-bar">
      <div class="brand-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/>
        </svg>
        Cloudflare Workers + D1 Edge Engine
      </div>
      <div id="auth-status-badge" class="auth-badge" onclick="openAuthModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span id="auth-status-text">Admin Key Active</span>
      </div>
    </div>

    <header>
      <h1>QR Forge</h1>
      <p class="subtitle">Generate high-reliability dynamic QR codes with real-time customer tracking, manual active/inactive toggles, and bulk ZIP export.</p>
    </header>

    <!-- Navigation Tabs -->
    <div class="tabs-nav">
      <button class="tab-btn active" data-tab="single-tab">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        Single QR
      </button>
      <button class="tab-btn" data-tab="bulk-tab">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Bulk Batch (.txt / .docx)
      </button>
      <button class="tab-btn" data-tab="analytics-tab">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        Analytics & Toggle
      </button>
    </div>

    <!-- TAB 1: Single QR Creation -->
    <div id="single-tab" class="tab-pane active">
      <div class="grid-layout">
        <!-- Left: Create Form -->
        <div class="glass-card">
          <h2 class="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
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
              <input type="hidden" id="single-design" name="design" value="classic" />
              <div class="design-options">
                <button type="button" class="design-btn active" data-style="classic" data-form="single">
                  <span>⬛ Classic</span>
                </button>
                <button type="button" class="design-btn" data-style="rounded" data-form="single">
                  <span>🔘 Rounded</span>
                </button>
                <button type="button" class="design-btn" data-style="dots" data-form="single">
                  <span>⚪ Dots</span>
                </button>
                <button type="button" class="design-btn" data-style="gradient" data-form="single">
                  <span>🌈 Gradient</span>
                </button>
                <button type="button" class="design-btn" data-style="logo" data-form="single">
                  <span>🎯 Logo Cut</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="max_scans">
                Unique Customer Cap
                <span class="label-hint">(Optional — empty for lifetime unlimited)</span>
              </label>
              <input type="number" id="max_scans" name="max_scans" min="1" placeholder="e.g. 500 (empty = lifetime unlimited)" />
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
        <div class="glass-card preview-container">
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
                Test Scan
              </a>
            </div>

            <div class="meta-row">
              <div style="display:flex; align-items:center; justify-content:center; gap:0.4rem;">
                <label class="switch">
                  <input type="checkbox" id="single-toggle-input" checked onchange="toggleSingleQrStatus(this)" />
                  <span class="slider"></span>
                </label>
                <span id="status-badge" class="status-badge status-active">Active</span>
              </div>
              <div>Unique: <span id="unique-scans-display" class="meta-val">0 / ∞</span></div>
              <div>Total Hits: <span id="raw-scans-display" class="meta-val">0</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Bulk Batch Generator -->
    <div id="bulk-tab" class="tab-pane">
      <div class="glass-card">
        <h2 class="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          Batch Import & Generator (Unlimited Lifetime QRs with Manual Switches)
        </h2>

        <!-- Dropzone -->
        <div class="dropzone" id="dropzone">
          <input type="file" id="file-input" class="file-input" accept=".txt,.docx" />
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:0.5rem;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <div style="font-weight:600; font-size:1rem; color:#fff;">Click or drag & drop .txt or .docx file here</div>
          <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem;">Supports plain text files (1 URL per line) or Word documents</div>
          <div id="file-info" style="display:none;" class="file-info-badge">
            <span id="file-name">file.txt</span> (<span id="detected-count">0 URLs detected</span>)
          </div>
        </div>

        <!-- Or Paste URLs -->
        <div class="form-group">
          <label for="bulk-urls-input">
            Or Paste URLs directly
            <span class="label-hint">(One URL per line)</span>
          </label>
          <textarea id="bulk-urls-input" placeholder="https://example.com/item-1&#10;https://example.com/item-2&#10;https://example.com/item-3"></textarea>
        </div>

        <div class="form-group">
          <label>Batch QR Code Design</label>
          <input type="hidden" id="bulk-design" name="design" value="classic" />
          <div class="design-options">
            <button type="button" class="design-btn active" data-style="classic" data-form="bulk">
              <span>⬛ Classic</span>
            </button>
            <button type="button" class="design-btn" data-style="rounded" data-form="bulk">
              <span>🔘 Rounded</span>
            </button>
            <button type="button" class="design-btn" data-style="dots" data-form="bulk">
              <span>⚪ Dots</span>
            </button>
            <button type="button" class="design-btn" data-style="gradient" data-form="bulk">
              <span>🌈 Gradient</span>
            </button>
            <button type="button" class="design-btn" data-style="logo" data-form="bulk">
              <span>🎯 Logo Cut</span>
            </button>
          </div>
        </div>

        <button type="button" class="btn-submit" id="bulk-submit-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Generate Batch QR Codes
        </button>

        <!-- Bulk Results & ZIP Download -->
        <div id="bulk-results-panel" class="results-section" style="display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.25rem;">
            <div>
              <h3 style="font-size:1.15rem; font-weight:700; color:#fff;">Batch Ready (<span id="batch-total-count">0</span> QRs Generated)</h3>
              <p style="font-size:0.8rem; color:var(--text-muted);">Lifetime unlimited scans. Use the toggles to pause/resume any QR manually at any time.</p>
            </div>
            <button type="button" class="btn-zip" id="download-zip-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download All as ZIP (SVGs + CSV)
            </button>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="width: 45px;">#</th>
                  <th style="width: 65px;">QR</th>
                  <th>Destination URL</th>
                  <th>Short Tracking Link</th>
                  <th style="width: 130px; text-align: center;">Status Switch</th>
                  <th style="width: 120px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="bulk-table-body"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: Analytics Lookup -->
    <div id="analytics-tab" class="tab-pane">
      <div class="glass-card">
        <h2 class="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
          </svg>
          QR Analytics & Manual Switch Control
        </h2>
        <div style="display:flex; gap:0.75rem; margin-bottom:1.5rem;">
          <input type="text" id="stats-id-input" placeholder="Enter QR ID (e.g. 8-character ID or full short link)" autocomplete="off" />
          <button type="button" class="btn-submit" id="lookup-btn" style="width:auto; padding:0 1.5rem; margin-top:0;">Check Stats</button>
        </div>

        <div class="stats-result" id="stats-result" style="background:rgba(15, 23, 42, 0.5); border:1px solid rgba(255, 255, 255, 0.08); border-radius:12px; padding:1.25rem; display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
            <strong id="stats-id-title" style="font-family:'JetBrains Mono'; color:#38bdf8;"></strong>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span id="stats-status-badge" class="status-badge"></span>
              <button type="button" class="btn-action btn-test" id="stats-toggle-btn" style="padding:0.35rem 0.75rem; font-size:0.75rem;" onclick="toggleCurrentLookupQr()">Toggle Status</button>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:1rem; margin-top:0.75rem;">
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.75rem;">
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.25rem;">Distinct Customers</div>
              <div style="font-size:1.2rem; font-weight:700; color:#34d399; font-family:'JetBrains Mono', monospace;" id="stats-unique-count">0</div>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.75rem;">
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.25rem;">Total Raw Hits</div>
              <div style="font-size:1.2rem; font-weight:700; color:#fff; font-family:'JetBrains Mono', monospace;" id="stats-scan-count">0</div>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.75rem;">
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.25rem;">Scan Cap</div>
              <div style="font-size:1.2rem; font-weight:700; color:#fff; font-family:'JetBrains Mono', monospace;" id="stats-max-scans">Unlimited (Lifetime)</div>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.75rem;">
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.25rem;">Design Style</div>
              <div style="font-size:1.2rem; font-weight:700; color:#fff; font-family:'JetBrains Mono', monospace; text-transform:capitalize;" id="stats-design">-</div>
            </div>
          </div>
          <div style="margin-top:0.85rem; font-size:0.8rem; color:var(--text-muted); word-break:break-all;">
            Target: <a id="stats-target-link" href="#" target="_blank" style="color:#a5b4fc;"></a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Admin Auth Modal -->
  <div id="auth-modal" class="modal-overlay">
    <div class="modal-card">
      <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:0.5rem; color:#fff;">Admin Access Key</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.25rem;">Enter your Admin Key to authorize QR creation & batch uploads.</p>
      <input type="password" id="admin-key-input" placeholder="Enter Admin Key" style="margin-bottom:1rem;" />
      <div style="display:flex; gap:0.5rem;">
        <button type="button" class="btn-submit" style="flex:1;" onclick="saveAdminKey()">Save Key</button>
        <button type="button" class="btn-action btn-test" onclick="closeAuthModal()">Close</button>
      </div>
    </div>
  </div>

  <div id="toast" class="toast">Copied to clipboard!</div>

  <script>
    let generatedBatchItems = [];
    let currentSingleId = null;
    let currentLookupId = null;
    let currentLookupStatus = 'active';

    // Admin Key Management
    function getStoredAdminKey() {
      return localStorage.getItem('qr_admin_key') || 'qrforge-admin-secret-2026';
    }

    function openAuthModal() {
      document.getElementById('admin-key-input').value = getStoredAdminKey();
      document.getElementById('auth-modal').classList.add('show');
    }

    function closeAuthModal() {
      document.getElementById('auth-modal').classList.remove('show');
    }

    function saveAdminKey() {
      const key = document.getElementById('admin-key-input').value.trim();
      if (key) {
        localStorage.setItem('qr_admin_key', key);
        showToast('Admin key saved successfully!');
      }
      closeAuthModal();
    }

    // Tabs logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });

    // Style picker logic for single & bulk
    document.querySelectorAll('.design-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const formType = btn.dataset.form;
        document.querySelectorAll(\`.design-btn[data-form="\${formType}"]\`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(\`\${formType}-design\`).value = btn.dataset.style;
      });
    });

    // Toast helper
    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // Single QR submission
    const singleForm = document.getElementById('create-form');
    const singleSubmitBtn = document.getElementById('submit-btn');
    const qrBox = document.getElementById('qr-box');
    const outputDetails = document.getElementById('output-details');
    const shortUrlDisplay = document.getElementById('short-url-display');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const testBtn = document.getElementById('test-btn');
    const statusBadge = document.getElementById('status-badge');
    const singleToggleInput = document.getElementById('single-toggle-input');
    const uniqueScansDisplay = document.getElementById('unique-scans-display');
    const rawScansDisplay = document.getElementById('raw-scans-display');

    singleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const target_url = document.getElementById('target_url').value.trim();
      const design = document.getElementById('single-design').value;
      const max_scans_val = document.getElementById('max_scans').value.trim();
      const max_scans = max_scans_val ? parseInt(max_scans_val, 10) : null;

      if (!target_url) return;

      singleSubmitBtn.disabled = true;
      singleSubmitBtn.innerHTML = 'Generating...';

      try {
        const res = await fetch('/api/create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Admin-Key': getStoredAdminKey()
          },
          body: JSON.stringify({ target_url, design, max_scans })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to generate QR');
        }

        const data = await res.json();
        currentSingleId = data.id;
        qrBox.innerHTML = data.qr_svg;
        outputDetails.style.display = 'block';
        shortUrlDisplay.textContent = data.short_url;
        testBtn.href = data.short_url;

        const blobUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data.qr_svg);
        downloadBtn.href = blobUri;
        downloadBtn.setAttribute('download', 'qr-' + data.id + '.svg');

        statusBadge.textContent = 'Active';
        statusBadge.className = 'status-badge status-active';
        singleToggleInput.checked = true;
        uniqueScansDisplay.textContent = '0 / ' + (max_scans ? max_scans : '∞');
        rawScansDisplay.textContent = '0';

        showToast('Dynamic QR Code Generated!');
      } catch (err) {
        alert(err.message || 'Error creating QR code');
      } finally {
        singleSubmitBtn.disabled = false;
        singleSubmitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> Generate QR Code';
      }
    });

    // Single QR toggle
    async function toggleSingleQrStatus(checkbox) {
      if (!currentSingleId) return;
      const targetStatus = checkbox.checked ? 'active' : 'inactive';
      try {
        const res = await fetch('/api/toggle/' + currentSingleId, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Admin-Key': getStoredAdminKey()
          },
          body: JSON.stringify({ status: targetStatus })
        });
        const data = await res.json();
        if (data.success) {
          statusBadge.textContent = data.status === 'active' ? 'Active' : 'Inactive';
          statusBadge.className = 'status-badge ' + (data.status === 'active' ? 'status-active' : 'status-inactive');
          showToast(\`QR #\${currentSingleId} is now \${data.status.toUpperCase()}\`);
        }
      } catch (err) {
        alert('Failed to toggle status: ' + err.message);
        checkbox.checked = !checkbox.checked;
      }
    }

    copyBtn.addEventListener('click', async () => {
      const url = shortUrlDisplay.textContent;
      if (url && url !== 'https://...') {
        await navigator.clipboard.writeText(url);
        showToast('Short URL copied to clipboard!');
      }
    });

    // Helper: Extract valid URLs from text
    function extractUrlsFromText(text) {
      const lines = text.split(/\\r?\\n/);
      const urls = [];
      for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        const matches = line.match(/https?:\\/\\/[^\\s"'>]+/gi);
        if (matches) {
          urls.push(...matches);
        } else if (line.startsWith('http://') || line.startsWith('https://')) {
          urls.push(line);
        }
      }
      return [...new Set(urls)];
    }

    // Dropzone & File parsing
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileNameSpan = document.getElementById('file-name');
    const detectedCountSpan = document.getElementById('detected-count');
    const bulkUrlsInput = document.getElementById('bulk-urls-input');

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });

    async function handleFile(file) {
      const ext = file.name.split('.').pop().toLowerCase();
      fileNameSpan.textContent = file.name;
      fileInfo.style.display = 'inline-flex';

      if (ext === 'docx') {
        if (typeof mammoth === 'undefined') {
          alert('Mammoth.js library is loading, please try again in a second.');
          return;
        }
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const urls = extractUrlsFromText(result.value);
        bulkUrlsInput.value = urls.join('\\n');
        detectedCountSpan.textContent = urls.length + ' URLs detected';
        showToast(\`Extracted \${urls.length} URLs from \${file.name}\`);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          const urls = extractUrlsFromText(text);
          bulkUrlsInput.value = urls.join('\\n');
          detectedCountSpan.textContent = urls.length + ' URLs detected';
          showToast(\`Extracted \${urls.length} URLs from \${file.name}\`);
        };
        reader.readAsText(file);
      }
    }

    // Bulk creation submission
    const bulkSubmitBtn = document.getElementById('bulk-submit-btn');
    const bulkResultsPanel = document.getElementById('bulk-results-panel');
    const bulkTableBody = document.getElementById('bulk-table-body');
    const batchTotalCount = document.getElementById('batch-total-count');
    const downloadZipBtn = document.getElementById('download-zip-btn');

    bulkSubmitBtn.addEventListener('click', async () => {
      const rawText = bulkUrlsInput.value;
      const urls = extractUrlsFromText(rawText);

      if (urls.length === 0) {
        alert('Please enter or import at least one valid HTTP/HTTPS URL.');
        return;
      }

      if (urls.length > 500) {
        alert('Maximum batch size is 500 URLs per run. Please split into smaller batches.');
        return;
      }

      const design = document.getElementById('bulk-design').value;
      bulkSubmitBtn.disabled = true;
      bulkSubmitBtn.innerHTML = 'Generating ' + urls.length + ' QR Codes...';

      try {
        const res = await fetch('/api/bulk-create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Admin-Key': getStoredAdminKey()
          },
          body: JSON.stringify({ urls, design })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Batch creation failed');
        }

        const data = await res.json();
        generatedBatchItems = data.items;

        batchTotalCount.textContent = data.items.length;
        bulkTableBody.innerHTML = '';

        data.items.forEach((item, index) => {
          const tr = document.createElement('tr');
          const cleanSvgBlob = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(item.qr_svg);
          tr.innerHTML = \`
            <td style="font-weight:700; color:var(--text-muted);">\${index + 1}</td>
            <td>
              <div class="table-thumb">\${item.qr_svg}</div>
            </td>
            <td style="max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              <a href="\${item.target_url}" target="_blank" style="color:#f8fafc; text-decoration:none;">\${item.target_url}</a>
            </td>
            <td style="font-family:'JetBrains Mono'; font-size:0.8rem; color:#38bdf8;">
              \${item.short_url}
            </td>
            <td style="text-align:center;">
              <div class="switch-wrapper" style="justify-content:center;">
                <label class="switch">
                  <input type="checkbox" checked onchange="toggleBatchRowStatus('\${item.id}', this)" />
                  <span class="slider"></span>
                </label>
                <span id="batch-status-label-\${item.id}" style="font-size:0.75rem; font-weight:700; color:#34d399;">Active</span>
              </div>
            </td>
            <td style="text-align:right; white-space:nowrap;">
              <a href="\${cleanSvgBlob}" download="qr-\${index + 1}-\${item.id}.svg" class="copy-btn" style="text-decoration:none; margin-right:4px;">Download</a>
              <button type="button" class="copy-btn" onclick="navigator.clipboard.writeText('\${item.short_url}'); showToast('Copied link #\${index + 1}');">Copy</button>
            </td>
          \`;
          bulkTableBody.appendChild(tr);
        });

        bulkResultsPanel.style.display = 'block';
        bulkResultsPanel.scrollIntoView({ behavior: 'smooth' });
        showToast(\`Successfully created \${data.items.length} lifetime QR codes!\`);
      } catch (err) {
        alert(err.message || 'Error processing batch');
      } finally {
        bulkSubmitBtn.disabled = false;
        bulkSubmitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Generate Batch QR Codes';
      }
    });

    // Toggle status for batch row
    async function toggleBatchRowStatus(id, checkbox) {
      const targetStatus = checkbox.checked ? 'active' : 'inactive';
      const label = document.getElementById('batch-status-label-' + id);
      try {
        const res = await fetch('/api/toggle/' + id, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Admin-Key': getStoredAdminKey()
          },
          body: JSON.stringify({ status: targetStatus })
        });
        const data = await res.json();
        if (data.success) {
          if (label) {
            label.textContent = data.status === 'active' ? 'Active' : 'Inactive';
            label.style.color = data.status === 'active' ? '#34d399' : '#f87171';
          }
          showToast(\`QR #\${id} is now \${data.status.toUpperCase()}\`);
        }
      } catch (err) {
        alert('Toggle failed: ' + err.message);
        checkbox.checked = !checkbox.checked;
      }
    }

    // Helper: Slugify string
    function slugify(text) {
      return text.toLowerCase().replace(/^https?:\\/\\//, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 30) || 'qr';
    }

    // Batch ZIP Download
    downloadZipBtn.addEventListener('click', async () => {
      if (!generatedBatchItems || generatedBatchItems.length === 0) return;

      if (typeof JSZip === 'undefined') {
        alert('JSZip is loading, please try again.');
        return;
      }

      downloadZipBtn.disabled = true;
      downloadZipBtn.innerHTML = 'Zipping files...';

      try {
        const zip = new JSZip();
        const svgFolder = zip.folder('qr-codes');
        let csvContent = 'Index,ID,Target_URL,Short_Tracking_URL,Filename\\n';

        generatedBatchItems.forEach((item, index) => {
          const num = index + 1;
          const slug = slugify(item.target_url);
          const filename = \`\${num}-\${slug}.svg\`;
          svgFolder.file(filename, item.qr_svg);
          csvContent += \`"\${num}","\${item.id}","\${item.target_url.replace(/"/g, '""')}","\${item.short_url}","\${filename}"\\n\`;
        });

        zip.file('mapping.csv', csvContent);

        const content = await zip.generateAsync({ type: 'blob' });
        const downloadUrl = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = \`qr-forge-batch-\${Date.now()}.zip\`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        showToast('ZIP Archive Downloaded Successfully!');
      } catch (err) {
        alert('Failed to generate ZIP: ' + err.message);
      } finally {
        downloadZipBtn.disabled = false;
        downloadZipBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download All as ZIP (SVGs + CSV)';
      }
    });

    // Analytics lookup
    const lookupBtn = document.getElementById('lookup-btn');
    const statsIdInput = document.getElementById('stats-id-input');
    const statsResult = document.getElementById('stats-result');

    lookupBtn.addEventListener('click', async () => {
      let rawId = statsIdInput.value.trim();
      if (!rawId) return;

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
        currentLookupId = data.id;
        currentLookupStatus = data.status;

        statsResult.style.display = 'block';
        document.getElementById('stats-id-title').textContent = 'ID: ' + data.id;
        
        updateLookupBadge(data.status);

        document.getElementById('stats-unique-count').textContent = data.unique_scan_count || 0;
        document.getElementById('stats-scan-count').textContent = data.scan_count || 0;
        document.getElementById('stats-max-scans').textContent = data.max_scans ? data.max_scans : 'Unlimited (Lifetime)';
        document.getElementById('stats-design').textContent = data.design || 'classic';
        
        const targetLink = document.getElementById('stats-target-link');
        targetLink.href = data.target_url;
        targetLink.textContent = data.target_url;
      } catch (err) {
        alert(err.message || 'Lookup failed');
      } finally {
        lookupBtn.disabled = false;
      }
    });

    function updateLookupBadge(status) {
      const badge = document.getElementById('stats-status-badge');
      badge.textContent = status;
      badge.className = 'status-badge ' + (status === 'active' ? 'status-active' : 'status-inactive');
    }

    async function toggleCurrentLookupQr() {
      if (!currentLookupId) return;
      const targetStatus = currentLookupStatus === 'active' ? 'inactive' : 'active';
      try {
        const res = await fetch('/api/toggle/' + currentLookupId, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Admin-Key': getStoredAdminKey()
          },
          body: JSON.stringify({ status: targetStatus })
        });
        const data = await res.json();
        if (data.success) {
          currentLookupStatus = data.status;
          updateLookupBadge(data.status);
          showToast(\`QR #\${currentLookupId} is now \${data.status.toUpperCase()}\`);
        }
      } catch (err) {
        alert('Toggle failed: ' + err.message);
      }
    }
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
    <p>${reason}. This campaign has been paused or deactivated by the organizer.</p>
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
