/**
 * /api/health — 서비스 상태 확인
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    ok: true,
    service: 'ICF-LM API',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    gas_configured: !!process.env.GAS_WEBHOOK_URL,
  });
}
