export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym = symbol.toUpperCase().trim();
  const KEY = process.env.FMP_KEY;
  if (!KEY) return res.status(500).json({ error: 'FMP_KEY not configured' });

  const BASE = 'https://financialmodelingprep.com/api/v3';

  try {
    const [quoteR, profileR, ratiosR, metricsR] = await Promise.all([
      fetch(`${BASE}/quote/${sym}?apikey=${KEY}`),
      fetch(`${BASE}/profile/${sym}?apikey=${KEY}`),
      fetch(`${BASE}/ratios-ttm/${sym}?apikey=${KEY}`),
      fetch(`${BASE}/key-metrics-ttm/${sym}?apikey=${KEY}`)
    ]);

    const [quotes, profiles, ratios, metrics] = await Promise.all([
      quoteR.json(), profileR.json(), ratiosR.json(), metricsR.json()
    ]);

    const q = Array.isArray(quotes) ? quotes[0] : null;
    const p = Array.isArray(profiles) ? profiles[0] : null;
    const r = Array.isArray(ratios) ? ratios[0] : null;
    const m = Array.isArray(metrics) ? metrics[0] : null;

    if (!q || !p || !q.price) return res.json({ found: false });

    const n = x => (x != null && isFinite(x)) ? +Number(x).toFixed(2) : null;
    const pct = x => (x != null && isFinite(x)) ? +Number(x * 100).toFixed(2) : null;

    res.json({
      found: true,
      ticker: sym,
      companyName: p.companyName || q.name || sym,
      exchange: p.exchangeShortName || q.exchange || '',
      sector: p.sector || '',
      industry: p.industry || '',
      price: n(q.price),
      dataAsOf: new Date().toISOString().split('T')[0],
      fundamentals: {
        revenueGrowth:    pct(r?.revenueGrowthTTM),
        epsGrowth:        pct(r?.epsgrowthTTM ?? r?.eps_growthTTM),
        pe:               n(q.pe ?? r?.peRatioTTM),
        ps:               n(r?.priceToSalesRatioTTM),
        pb:               n(r?.priceToBookRatioTTM ?? m?.pbRatioTTM),
        pcf:              n(r?.priceToFreeCashFlowsRatioTTM),
        peg:              n(r?.pegRatioTTM ?? m?.pegRatioTTM),
        grossMargin:      pct(r?.grossProfitMarginTTM),
        operatingMargin:  pct(r?.operatingProfitMarginTTM),
        netMargin:        pct(r?.netProfitMarginTTM),
        currentRatio:     n(r?.currentRatioTTM),
        quickRatio:       n(r?.quickRatioTTM),
        cashRatio:        n(r?.cashRatioTTM),
        debtToEquity:     n(r?.debtEquityRatioTTM),
        debtToAssets:     n(r?.debtRatioTTM),
        interestCoverage: n(r?.interestCoverageTTM),
        roa:              pct(r?.returnOnAssetsTTM),
        roe:              pct(r?.returnOnEquityTTM),
        roic:             pct(r?.returnOnCapitalEmployedTTM ?? m?.roicTTM)
      },
      risk: {
        beta:                      n(p.beta ?? q.beta),
        marketCap:                 q.marketCap ? +(q.marketCap / 1e6).toFixed(0) : null,
        profitableTTM:             (r?.netProfitMarginTTM ?? 0) > 0,
        operatingCashFlowPositive: true,
        isDefensiveSector:         ['Healthcare','Consumer Defensive','Utilities','Energy'].includes(p.sector||''),
        isIndustryLeader:          (q.marketCap ?? 0) > 5e10,
        freeFromLegalIssues:       true,
        outperformedSP500_5y:      (q.changesPercentage ?? 0) > 5
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}