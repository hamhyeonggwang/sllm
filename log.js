/**
 * /api/log  — Vercel Serverless Function
 * 분류 결과를 Google Apps Script 웹훅으로 중계하거나
 * 직접 Google Sheets API로 기록합니다.
 *
 * 환경변수 (Vercel Dashboard > Settings > Environment Variables):
 *   GAS_WEBHOOK_URL  — Google Apps Script 배포 URL
 */

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gasUrl = process.env.GAS_WEBHOOK_URL;
  if (!gasUrl) {
    return res.status(500).json({ error: 'GAS_WEBHOOK_URL 환경변수가 설정되지 않았습니다.' });
  }

  try {
    const body = req.body;

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp:   body.timestamp   || new Date().toISOString(),
        session_id:  body.session_id  || '',
        input_text:  body.input_text  || '',
        codes:       body.codes       || [],
        confidence:  body.confidence  || null,
        model:       body.model       || 'ICF-sLLM-v0.1',
        researcher:  body.researcher  || '',
        feedback:    body.feedback    || null,
        type:        body.type        || 'classification',
      }),
    });

    // GAS는 redirect를 반환할 수 있으므로 status만 체크
    if (response.ok || response.status === 302) {
      return res.status(200).json({ ok: true, saved: 'sheets' });
    }

    throw new Error(`GAS 응답 오류: ${response.status}`);
  } catch (err) {
    console.error('[ICF-LM] log error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
