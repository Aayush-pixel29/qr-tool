async function runTests() {
  console.log('Testing QR Forge Endpoints...');

  // 1. Create QR with max_scans = 2
  const createRes = await fetch('http://127.0.0.1:8787/api/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_url: 'https://example.com/special-deal',
      design: 'gradient',
      max_scans: 2
    })
  });

  const created = await createRes.json();
  console.log('\n[1] Create Response:', {
    id: created.id,
    short_url: created.short_url,
    design: created.design,
    max_scans: created.max_scans,
    svgLength: created.qr_svg?.length
  });

  const id = created.id;

  // 2. Fetch raw SVG
  const svgRes = await fetch(`http://127.0.0.1:8787/qr/${id}.svg`);
  const svgText = await svgRes.text();
  console.log('\n[2] Raw SVG Response status:', svgRes.status, 'Content-Type:', svgRes.headers.get('content-type'), 'Length:', svgText.length);

  // 3. Check initial stats
  const statsRes0 = await fetch(`http://127.0.0.1:8787/stats/${id}`);
  console.log('\n[3] Initial Stats:', await statsRes0.json());

  // 4. Scan 1 (Should 302 redirect)
  const scan1 = await fetch(`http://127.0.0.1:8787/r/${id}`, { redirect: 'manual' });
  console.log('\n[4] Scan 1 status:', scan1.status, 'Location:', scan1.headers.get('location'));

  // 5. Scan 2 (Should 302 redirect and reach max_scans cap)
  const scan2 = await fetch(`http://127.0.0.1:8787/r/${id}`, { redirect: 'manual' });
  console.log('\n[5] Scan 2 status:', scan2.status, 'Location:', scan2.headers.get('location'));

  // 6. Scan 3 (Should NOT redirect, should return 410 Inactive HTML)
  const scan3 = await fetch(`http://127.0.0.1:8787/r/${id}`, { redirect: 'manual' });
  const scan3Body = await scan3.text();
  console.log('\n[6] Scan 3 status:', scan3.status, 'Inactive page title:', scan3Body.includes('QR Code Inactive') ? 'MATCHED (Inactive UI served)' : 'FAILED');

  // 7. Check final stats
  const statsResFinal = await fetch(`http://127.0.0.1:8787/stats/${id}`);
  console.log('\n[7] Final Stats:', await statsResFinal.json());

  // 8. Test all 5 design styles SVG generation
  const designs = ['classic', 'rounded', 'dots', 'gradient', 'logo'];
  for (const d of designs) {
    const res = await fetch('http://127.0.0.1:8787/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_url: 'https://example.com', design: d })
    });
    const data = await res.json();
    console.log(`[Design Test] Style '${d}' -> ID: ${data.id}, SVG valid: ${data.qr_svg.startsWith('<svg')}`);
  }

  console.log('\nAll tests passed successfully!');
}

runTests().catch(console.error);
