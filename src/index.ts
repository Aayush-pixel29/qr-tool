import { Hono, Context } from 'hono';
import { generateShortId, isValidUrl, computeVisitorHash, constantTimeEquals } from './utils';
import { generateQRCodeSvg, QRDesign } from './qr-render';
import { renderHomePage, renderInactivePage, renderNotFoundPage } from './views/html';

type Bindings = {
  DB: D1Database;
  ADMIN_KEY?: string;
};

interface QRCodeRecord {
  id: string;
  target_url: string;
  design: QRDesign;
  max_scans: number | null;
  scan_count: number;
  unique_scan_count: number;
  status: 'active' | 'inactive';
  created_at: number;
}

const DEFAULT_ADMIN_KEY = 'qrforge-admin-secret-2026';

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Global Security Headers Middleware
 */
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
});

/**
 * Authentication Helper
 */
function isAuthorized(c: Context<{ Bindings: Bindings }>): boolean {
  const expectedKey = c.env.ADMIN_KEY || DEFAULT_ADMIN_KEY;
  const headerKey = c.req.header('X-Admin-Key') || '';
  const cookieHeader = c.req.header('Cookie') || '';
  
  let cookieKey = '';
  const cookieMatch = cookieHeader.match(/qr_auth=([^;]+)/);
  if (cookieMatch) {
    cookieKey = decodeURIComponent(cookieMatch[1]);
  }

  if (headerKey && constantTimeEquals(headerKey, expectedKey)) {
    return true;
  }
  if (cookieKey && constantTimeEquals(cookieKey, expectedKey)) {
    return true;
  }

  return !c.env.ADMIN_KEY || (headerKey === expectedKey);
}

/**
 * 1. GET / → Serve the main HTML UI
 */
app.get('/', (c) => {
  return c.html(renderHomePage());
});

/**
 * 2. POST /api/create → Create a single dynamic QR code
 */
app.post('/api/create', async (c) => {
  try {
    if (!isAuthorized(c)) {
      return c.json({ error: 'Unauthorized: Invalid or missing Admin Key' }, 401);
    }

    const body = await c.req.json<{
      target_url: string;
      design?: QRDesign;
      max_scans?: number | null;
    }>();

    let targetUrl = (body.target_url || '').trim();
    if (!targetUrl) {
      return c.json({ error: 'Target URL is required' }, 400);
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    if (!isValidUrl(targetUrl)) {
      return c.json({ error: 'Please enter a valid public HTTP or HTTPS URL (Private/Localhost URLs are prohibited)' }, 400);
    }

    const validDesigns: QRDesign[] = ['classic', 'rounded', 'dots', 'gradient', 'logo'];
    const design: QRDesign = validDesigns.includes(body.design as QRDesign) ? (body.design as QRDesign) : 'classic';

    let maxScans: number | null = null;
    if (typeof body.max_scans === 'number' && body.max_scans > 0) {
      maxScans = Math.floor(body.max_scans);
    }

    const id = generateShortId(8);
    const now = Date.now();

    await c.env.DB.prepare(
      `INSERT INTO qr_codes (id, target_url, design, max_scans, scan_count, unique_scan_count, status, created_at)
       VALUES (?, ?, ?, ?, 0, 0, 'active', ?)`
    )
      .bind(id, targetUrl, design, maxScans, now)
      .run();

    const requestUrl = new URL(c.req.url);
    const shortUrl = `${requestUrl.protocol}//${requestUrl.host}/r/${id}`;
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
 * 3. POST /api/bulk-create → Batch import and generate lifetime unlimited QR codes
 */
app.post('/api/bulk-create', async (c) => {
  try {
    if (!isAuthorized(c)) {
      return c.json({ error: 'Unauthorized: Invalid or missing Admin Key' }, 401);
    }

    const body = await c.req.json<{
      urls: string[];
      design?: QRDesign;
    }>();

    const rawUrls = Array.isArray(body.urls) ? body.urls : [];
    if (rawUrls.length === 0) {
      return c.json({ error: 'No URLs provided' }, 400);
    }

    if (rawUrls.length > 500) {
      return c.json({ error: 'Batch size exceeds maximum limit of 500 URLs per run' }, 400);
    }

    const validDesigns: QRDesign[] = ['classic', 'rounded', 'dots', 'gradient', 'logo'];
    const design: QRDesign = validDesigns.includes(body.design as QRDesign) ? (body.design as QRDesign) : 'classic';

    const validUrls: string[] = [];
    for (let u of rawUrls) {
      let trimmed = (u || '').trim();
      if (!trimmed) continue;
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        trimmed = 'https://' + trimmed;
      }
      if (isValidUrl(trimmed)) {
        validUrls.push(trimmed);
      }
    }

    if (validUrls.length === 0) {
      return c.json({ error: 'No valid public HTTP/HTTPS URLs found in batch' }, 400);
    }

    const requestUrl = new URL(c.req.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    const now = Date.now();
    const items: Array<{
      id: string;
      target_url: string;
      short_url: string;
      qr_svg: string;
      design: QRDesign;
    }> = [];

    const chunkSize = 50;
    for (let i = 0; i < validUrls.length; i += chunkSize) {
      const chunk = validUrls.slice(i, i + chunkSize);
      const statements = chunk.map((targetUrl) => {
        const id = generateShortId(8);
        const shortUrl = `${baseUrl}/r/${id}`;
        const qrSvg = generateQRCodeSvg(shortUrl, design, 300);

        items.push({
          id,
          target_url: targetUrl,
          short_url: shortUrl,
          qr_svg: qrSvg,
          design
        });

        // max_scans is explicitly NULL for unlimited lifetime scanning
        return c.env.DB.prepare(
          `INSERT INTO qr_codes (id, target_url, design, max_scans, scan_count, unique_scan_count, status, created_at)
           VALUES (?, ?, ?, NULL, 0, 0, 'active', ?)`
        ).bind(id, targetUrl, design, now);
      });

      await c.env.DB.batch(statements);
    }

    return c.json({
      success: true,
      total: items.length,
      items
    });
  } catch (err: any) {
    console.error('Error in bulk-create:', err);
    return c.json({ error: err.message || 'Internal Server Error' }, 500);
  }
});

/**
 * 4. GET /r/:id → Scan & redirect endpoint with Unique Customer Fingerprinting
 */
app.get('/r/:id', async (c) => {
  const id = c.req.param('id');
  if (!id) {
    return c.html(renderNotFoundPage(), 404);
  }

  const qr = await c.env.DB.prepare('SELECT * FROM qr_codes WHERE id = ?')
    .bind(id)
    .first<QRCodeRecord>();

  if (!qr) {
    return c.html(renderNotFoundPage(), 404);
  }

  if (qr.status === 'inactive') {
    return c.html(renderInactivePage('This QR code is currently paused or inactive'), 410);
  }

  const now = Date.now();
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';
  const userAgent = c.req.header('user-agent') || 'unknown';

  const visitorHash = await computeVisitorHash(ip, userAgent);

  const visitorLog = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM scan_log WHERE qr_id = ? AND visitor_hash = ?'
  )
    .bind(id, visitorHash)
    .first<{ count: number }>();

  const isUniqueVisitor = (visitorLog?.count || 0) === 0;
  const nextUniqueCount = isUniqueVisitor ? qr.unique_scan_count + 1 : qr.unique_scan_count;
  const nextScanCount = qr.scan_count + 1;

  const isDeactivated = qr.max_scans !== null && nextUniqueCount >= qr.max_scans;
  const nextStatus = isDeactivated ? 'inactive' : 'active';

  await c.env.DB.batch([
    c.env.DB.prepare(
      'INSERT INTO scan_log (qr_id, visitor_hash, scanned_at) VALUES (?, ?, ?)'
    ).bind(id, visitorHash, now),
    c.env.DB.prepare(
      'UPDATE qr_codes SET scan_count = ?, unique_scan_count = ?, status = ? WHERE id = ?'
    ).bind(nextScanCount, nextUniqueCount, nextStatus, id)
  ]);

  return c.redirect(qr.target_url, 302);
});

/**
 * 5. GET /qr/:file → Returns the raw SVG file for embedding/downloading
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
 * 6. GET /stats/:id → Dashboard metadata with unique customer metrics
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
    unique_scan_count: qr.unique_scan_count,
    max_scans: qr.max_scans,
    status: qr.status,
    created_at: qr.created_at
  });
});

/**
 * 7. POST /api/toggle/:id → Manually toggle or set QR code active/inactive status
 */
app.post('/api/toggle/:id', async (c) => {
  try {
    if (!isAuthorized(c)) {
      return c.json({ error: 'Unauthorized: Invalid or missing Admin Key' }, 401);
    }

    const id = c.req.param('id');
    if (!id) {
      return c.json({ error: 'QR ID is required' }, 400);
    }

    const qr = await c.env.DB.prepare('SELECT id, status FROM qr_codes WHERE id = ?')
      .bind(id)
      .first<{ id: string; status: 'active' | 'inactive' }>();

    if (!qr) {
      return c.json({ error: 'QR code not found' }, 404);
    }

    let nextStatus: 'active' | 'inactive';
    try {
      const body = await c.req.json<{ status?: 'active' | 'inactive' }>();
      if (body.status === 'active' || body.status === 'inactive') {
        nextStatus = body.status;
      } else {
        nextStatus = qr.status === 'active' ? 'inactive' : 'active';
      }
    } catch {
      nextStatus = qr.status === 'active' ? 'inactive' : 'active';
    }

    await c.env.DB.prepare('UPDATE qr_codes SET status = ? WHERE id = ?')
      .bind(nextStatus, id)
      .run();

    return c.json({
      success: true,
      id,
      status: nextStatus
    });
  } catch (err: any) {
    console.error('Error toggling QR status:', err);
    return c.json({ error: err.message || 'Internal Server Error' }, 500);
  }
});

export default app;
