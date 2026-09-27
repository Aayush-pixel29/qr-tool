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

/**
 * 8. GET /api/system-stats → Live Cloudflare telemetry & visual analytics chart data
 */
app.get('/api/system-stats', async (c) => {
  try {
    if (!isAuthorized(c)) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const qrStats = await c.env.DB.prepare(
      `SELECT 
        COUNT(*) as total_qrs,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_qrs,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_qrs,
        SUM(scan_count) as total_scans,
        SUM(unique_scan_count) as total_unique_scans
       FROM qr_codes`
    ).first<{
      total_qrs: number;
      active_qrs: number;
      inactive_qrs: number;
      total_scans: number;
      total_unique_scans: number;
    }>();

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayTimestamp = todayStart.getTime();

    const todayLog = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM scan_log WHERE scanned_at >= ?'
    )
      .bind(todayTimestamp)
      .first<{ count: number }>();

    // 7-day daily scan history
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const { results: dailyScans } = await c.env.DB.prepare(
      `SELECT 
        strftime('%Y-%m-%d', scanned_at / 1000, 'unixepoch') as day,
        COUNT(*) as count
       FROM scan_log 
       WHERE scanned_at >= ?
       GROUP BY day
       ORDER BY day ASC`
    ).bind(sevenDaysAgo).all<{ day: string; count: number }>();

    // 7-day QR creation history
    const { results: dailyCreations } = await c.env.DB.prepare(
      `SELECT 
        strftime('%Y-%m-%d', created_at / 1000, 'unixepoch') as day,
        COUNT(*) as count
       FROM qr_codes 
       WHERE created_at >= ?
       GROUP BY day
       ORDER BY day ASC`
    ).bind(sevenDaysAgo).all<{ day: string; count: number }>();

    // Style distribution breakdown
    const { results: styleBreakdown } = await c.env.DB.prepare(
      `SELECT design, COUNT(*) as count FROM qr_codes GROUP BY design`
    ).all<{ design: string; count: number }>();

    // Top 5 most active QR codes
    const { results: topQrs } = await c.env.DB.prepare(
      `SELECT id, target_url, scan_count, unique_scan_count, design, status 
       FROM qr_codes 
       ORDER BY scan_count DESC 
       LIMIT 5`
    ).all<{ id: string; target_url: string; scan_count: number; unique_scan_count: number; design: string; status: string }>();

    const totalQrs = qrStats?.total_qrs || 0;
    const activeQrs = qrStats?.active_qrs || 0;
    const inactiveQrs = qrStats?.inactive_qrs || 0;
    const totalScans = qrStats?.total_scans || 0;
    const totalUniqueScans = qrStats?.total_unique_scans || 0;
    const scansToday = todayLog?.count || 0;

    // Estimate storage: ~200 bytes per QR record + ~100 bytes per scan log
    const estimatedDbBytes = (totalQrs * 200) + (totalScans * 100);
    const estimatedDbMb = (estimatedDbBytes / (1024 * 1024)).toFixed(3);

    // Cloudflare Free limits
    const cfDailyLimit = 100000;
    const cfD1LimitGb = 5;

    return c.json({
      success: true,
      data: {
        total_qrs: totalQrs,
        active_qrs: activeQrs,
        inactive_qrs: inactiveQrs,
        total_scans: totalScans,
        total_unique_scans: totalUniqueScans,
        scans_today: scansToday,
        estimated_db_mb: estimatedDbMb,
        cf_daily_limit: cfDailyLimit,
        cf_d1_limit_gb: cfD1LimitGb,
        daily_percent_used: ((scansToday / cfDailyLimit) * 100).toFixed(2),
        cost_status: '₹0 / month (100% Free Tier Covered)',
        charts: {
          daily_scans: dailyScans || [],
          daily_creations: dailyCreations || [],
          style_breakdown: styleBreakdown || [],
          top_qrs: topQrs || []
        }
      }
    });
  } catch (err: any) {
    console.error('Error fetching system stats:', err);
    return c.json({ error: err.message || 'Internal Server Error' }, 500);
  }
});

/**
 * 9. GET /api/records → Fetch paginated QR records with search and filter
 */
app.get('/api/records', async (c) => {
  try {
    if (!isAuthorized(c)) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
    const limit = Math.min(100, Math.max(5, parseInt(c.req.query('limit') || '25', 10)));
    const offset = (page - 1) * limit;
    const search = (c.req.query('search') || '').trim();
    const status = c.req.query('status') || 'all';

    let countQuery = 'SELECT COUNT(*) as total FROM qr_codes WHERE 1=1';
    let dataQuery = 'SELECT * FROM qr_codes WHERE 1=1';
    const params: any[] = [];

    if (search) {
      countQuery += ' AND (target_url LIKE ? OR id LIKE ?)';
      dataQuery += ' AND (target_url LIKE ? OR id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status === 'active' || status === 'inactive') {
      countQuery += ' AND status = ?';
      dataQuery += ' AND status = ?';
      params.push(status);
    }

    const totalRow = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();
    const totalRecords = totalRow?.total || 0;

    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const dataParams = [...params, limit, offset];

    const { results } = await c.env.DB.prepare(dataQuery).bind(...dataParams).all<QRCodeRecord>();

    const requestUrl = new URL(c.req.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    const enriched = (results || []).map((r, index) => ({
      ...r,
      serial_number: totalRecords - offset - index,
      short_url: `${baseUrl}/r/${r.id}`,
      svg_url: `${baseUrl}/qr/${r.id}.svg`
    }));

    return c.json({
      success: true,
      total: totalRecords,
      page,
      limit,
      total_pages: Math.ceil(totalRecords / limit) || 1,
      records: enriched
    });
  } catch (err: any) {
    console.error('Error fetching records:', err);
    return c.json({ error: err.message || 'Internal Server Error' }, 500);
  }
});

/**
 * 10. POST /api/edit/:id → Edit target URL, design, or status of a QR code
 */
app.post('/api/edit/:id', async (c) => {
  try {
    if (!isAuthorized(c)) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const body = await c.req.json<{
      target_url?: string;
      status?: 'active' | 'inactive';
      design?: QRDesign;
    }>();

    const existing = await c.env.DB.prepare('SELECT * FROM qr_codes WHERE id = ?')
      .bind(id)
      .first<QRCodeRecord>();

    if (!existing) {
      return c.json({ error: 'QR Code not found' }, 404);
    }

    let targetUrl = existing.target_url;
    if (body.target_url) {
      let trimmed = body.target_url.trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        trimmed = 'https://' + trimmed;
      }
      if (!isValidUrl(trimmed)) {
        return c.json({ error: 'Invalid destination URL format' }, 400);
      }
      targetUrl = trimmed;
    }

    let status = existing.status;
    if (body.status === 'active' || body.status === 'inactive') {
      status = body.status;
    }

    let design = existing.design;
    const validDesigns: QRDesign[] = ['classic', 'rounded', 'dots', 'gradient', 'logo'];
    if (body.design && validDesigns.includes(body.design)) {
      design = body.design;
    }

    await c.env.DB.prepare(
      'UPDATE qr_codes SET target_url = ?, status = ?, design = ? WHERE id = ?'
    )
      .bind(targetUrl, status, design, id)
      .run();

    return c.json({
      success: true,
      id,
      target_url: targetUrl,
      status,
      design
    });
  } catch (err: any) {
    console.error('Error updating QR:', err);
    return c.json({ error: err.message || 'Internal Server Error' }, 500);
  }
});

/**
 * 11. DELETE /api/delete/:id → Delete a QR code and its scan logs
 */
app.delete('/api/delete/:id', async (c) => {
  try {
    if (!isAuthorized(c)) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    await c.env.DB.batch([
      c.env.DB.prepare('DELETE FROM scan_log WHERE qr_id = ?').bind(id),
      c.env.DB.prepare('DELETE FROM qr_codes WHERE id = ?').bind(id)
    ]);

    return c.json({ success: true, message: `QR Code ${id} and logs deleted.` });
  } catch (err: any) {
    console.error('Error deleting QR:', err);
    return c.json({ error: err.message || 'Internal Server Error' }, 500);
  }
});

export default app;
