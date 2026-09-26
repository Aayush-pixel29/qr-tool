import { Hono } from 'hono';
import { generateShortId, isValidUrl } from './utils';
import { generateQRCodeSvg, QRDesign } from './qr-render';
import { renderHomePage, renderInactivePage, renderNotFoundPage } from './views/html';

type Bindings = {
  DB: D1Database;
};

interface QRCodeRecord {
  id: string;
  target_url: string;
  design: QRDesign;
  max_scans: number | null;
  scan_count: number;
  status: 'active' | 'inactive';
  created_at: number;
}

const app = new Hono<{ Bindings: Bindings }>();

/**
 * 1. GET / → Serve the main HTML UI
 */
app.get('/', (c) => {
  return c.html(renderHomePage());
});

/**
 * 2. POST /api/create → Create a new dynamic QR code
 */
app.post('/api/create', async (c) => {
  try {
    const body = await c.req.json<{
      target_url: string;
      design?: QRDesign;
      max_scans?: number | null;
    }>();

    let targetUrl = (body.target_url || '').trim();
    if (!targetUrl) {
      return c.json({ error: 'Target URL is required' }, 400);
    }

    // Auto-prefix https:// if missing
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    if (!isValidUrl(targetUrl)) {
      return c.json({ error: 'Please enter a valid HTTP or HTTPS URL' }, 400);
    }

    const validDesigns: QRDesign[] = ['classic', 'rounded', 'dots', 'gradient', 'logo'];
    const design: QRDesign = validDesigns.includes(body.design as QRDesign) ? (body.design as QRDesign) : 'classic';

    let maxScans: number | null = null;
    if (typeof body.max_scans === 'number' && body.max_scans > 0) {
      maxScans = Math.floor(body.max_scans);
    }

    const id = generateShortId(8);
    const now = Date.now();

    // Insert into D1 database
    await c.env.DB.prepare(
      `INSERT INTO qr_codes (id, target_url, design, max_scans, scan_count, status, created_at)
       VALUES (?, ?, ?, ?, 0, 'active', ?)`
    )
      .bind(id, targetUrl, design, maxScans, now)
      .run();

    // Build the short redirect URL encoded inside the QR
    const requestUrl = new URL(c.req.url);
    const shortUrl = `${requestUrl.protocol}//${requestUrl.host}/r/${id}`;

    // Render SVG immediately
    const qrSvg = generateQRCodeSvg(shortUrl, design, 300);

    return c.json({
      id,
      short_url: shortUrl,
      target_url: targetUrl,
      design,
      max_scans: maxScans,
      qr_svg: qrSvg
    });
  } catch (err: any) {
    console.error('Error creating QR:', err);
    return c.json({ error: err.message || 'Internal Server Error' }, 500);
  }
});

/**
 * 3. GET /r/:id → Scan & redirect endpoint
 */
app.get('/r/:id', async (c) => {
  const id = c.req.param('id');
  if (!id) {
    return c.html(renderNotFoundPage(), 404);
  }

  // Look up QR in D1
  const qr = await c.env.DB.prepare('SELECT * FROM qr_codes WHERE id = ?')
    .bind(id)
    .first<QRCodeRecord>();

  if (!qr) {
    return c.html(renderNotFoundPage(), 404);
  }

  // Check if inactive
  if (qr.status === 'inactive') {
    return c.html(renderInactivePage('This QR code is no longer active'), 410);
  }

  const now = Date.now();
  const nextScanCount = qr.scan_count + 1;
  const isDeactivated = qr.max_scans !== null && nextScanCount >= qr.max_scans;
  const nextStatus = isDeactivated ? 'inactive' : 'active';

  // Log scan and update scan count & status atomically in D1 batch
  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO scan_log (qr_id, scanned_at) VALUES (?, ?)').bind(id, now),
    c.env.DB.prepare('UPDATE qr_codes SET scan_count = ?, status = ? WHERE id = ?').bind(nextScanCount, nextStatus, id)
  ]);

  // 302 redirect to the destination URL
  return c.redirect(qr.target_url, 302);
});

/**
 * 4. GET /qr/:file → Returns the raw SVG file for embedding/downloading (e.g. /qr/abcdef12.svg or /qr/abcdef12)
 */
app.get('/qr/:file', async (c) => {
  const file = c.req.param('file');
  if (!file) {
    return c.text('Not found', 404);
  }

  const id = file.replace(/\.svg$/i, '');

  const qr = await c.env.DB.prepare('SELECT * FROM qr_codes WHERE id = ?')
    .bind(id)
    .first<QRCodeRecord>();

  if (!qr) {
    return c.text('QR code not found', 404);
  }

  const requestUrl = new URL(c.req.url);
  const shortUrl = `${requestUrl.protocol}//${requestUrl.host}/r/${id}`;
  const svg = generateQRCodeSvg(shortUrl, qr.design, 300);

  return c.text(svg, 200, {
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600'
  });
});

/**
 * 5. GET /stats/:id → Dashboard metadata
 */
app.get('/stats/:id', async (c) => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'ID is required' }, 400);
  }

  const qr = await c.env.DB.prepare('SELECT * FROM qr_codes WHERE id = ?')
    .bind(id)
    .first<QRCodeRecord>();

  if (!qr) {
    return c.json({ error: 'QR Code not found' }, 404);
  }

  return c.json({
    id: qr.id,
    target_url: qr.target_url,
    design: qr.design,
    scan_count: qr.scan_count,
    max_scans: qr.max_scans,
    status: qr.status,
    created_at: qr.created_at
  });
});

export default app;
