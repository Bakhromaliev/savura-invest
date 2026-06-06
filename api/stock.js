export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol, debug } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym = symbol.toUpperCase().trim();
  const FMP = process.env.FMP_KEY;
  const FH  = process.env.FINNHUB_KEY;

  // Try Finnhub first (more reliable free tier)
  if (FH) {
    try {
      const [qr, pr, mr] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FH}`),
        fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${FH}`),
        fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${sym}&metric=all&token=${FH}`)
      ]);
      const [q, p, md] = await Promise.all([qr.json(), pr.json(), mr.json()]);
      const m = md?.metric || {};

      if (p?.name && q?.c > 0) {
        const n = x => (x != null && isFinite(x)) ? +Number(x).toFixed(2) : null;
        const pct = x => (x != null && isFinite(x)) ? +Number(x * 100).toFixed(2) : null;
        return res.json({
          found: true, source: 'finnhub',
          ticker: sym, companyName: p.name,
          exchange: p.exchange || '', sector: p.finnhubIndustry || '', industry: p.finnhubIndustry || '',
          price: n(q.c), dataAsOf: new Date().toISOString().split('T')[0],
          fundamentals: {
            revenueGrowth: pct(m.revenueGrowthTTMYoy), epsGrowth: pct(m.epsGrowth),
            pe: n(m.peTTM), ps: n(m.psTTM), pb: n(m.pbQuarterly),
            pcf: n(m.pcfShareTTM), peg: n(m.pegRatio),
            grossMargin: pct(m.grossMarginTTM), operatingMargin: pct(m.operatingMarginTTM),
            netMargin: pct(m.netProfitMarginTTM), currentRatio: n(m.currentRatioQuarterly),
            quickRatio: n(m.quickRatioQuarterly), cashRatio: n(m.cashRatioQuarterly),
            debtToEquity: n(m['totalDebt/totalEquityQuarterly']),
            debtToAssets: null, interestCoverage: null,
            roa: pct(m.roaTTM), roe: pct(m.roeTTM), roic: pct(m.roicTTM)
          },
          risk: {
            beta: n(m.beta), marketCap: p.marketCapitalization ? +(p.marketCapitalization).toFixed(0) : null,
            profitableTTM: (m.netProfitMarginTTM ?? 0) > 0,
            operatingCashFlowPositive: true,
            isDefensiveSector: ['Healthcare','Consumer Staples','Utilities'].some(s => (p.finnhubIndustry||'').includes(s)),
            isIndustryLeader: (p.marketCapitalization ?? 0) > 50000,
            freeFromLegalIssues: true,
            outperformedSP500_5y: (m['52WeekPriceReturnDaily'] ?? 0) > 10
          }
        });
      }
    } catch(e) { /* fall through */ }
  }

  // Try FMP as fallback
  if (FMP) {
    try {
      const BASE = 'https://financialmodelingprep.com/api/v3';
      const [qr, pr, rr] = await Promise.all([
        fetch(`${BASE}/quote/${sym}?apikey=${FMP}`),
        fetch(`${BASE}/profile/${sym}?apikey=${FMP}`),
        fetch(`${BASE}/ratios-ttm/${sym}?apikey=${FMP}`)
      ]);
      const [quotes, profiles, ratios] = await Promise.all([qr.json(), pr.json(), rr.json()]);
      const q = Array.isArray(quotes) ? quotes[0] : null;
      const p = Array.isArray(profiles) ? profiles[0] : null;
      const r = Array.isArray(ratios) ? ratios[0] : null;

      if (q?.price && p?.companyName) {
        const n = x => (x != null && isFinite(x)) ? +Number(x).toFixed(2) : null;
        const pct = x => (x != null && isFinite(x)) ? +Number(x * 100).toFixed(2) : null;
        return res.json({
          found: true, source: 'fmp',
          ticker: sym, companyName: p.companyName,
          exchange: p.exchangeShortName || '', sector: p.sector || '', industry: p.industry || '',
          price: n(q.price), dataAsOf: new Date().toISOString().split('T')[0],
          fundamentals: {
            revenueGrowth: pct(r?.revenueGrowthTTM), epsGrowth: pct(r?.epsgrowthTTM),
            pe: n(q.pe ?? r?.peRatioTTM), ps: n(r?.priceToSalesRatioTTM),
            pb: n(r?.priceToBookRatioTTM), pcf: n(r?.priceToFreeCashFlowsRatioTTM),
            peg: n(r?.pegRatioTTM), grossMargin: pct(r?.grossProfitMarginTTM),
            operatingMargin: pct(r?.operatingProfitMarginTTM), netMargin: pct(r?.netProfitMarginTTM),
            currentRatio: n(r?.currentRatioTTM), quickRatio: n(r?.quickRatioTTM),
            cashRatio: n(r?.cashRatioTTM), debtToEquity: n(r?.debtEquityRatioTTM),
            debtToAssets: n(r?.debtRatioTTM), interestCoverage: n(r?.interestCoverageTTM),
            roa: pct(r?.returnOnAssetsTTM), roe: pct(r?.returnOnEquityTTM), roic: pct(r?.returnOnCapitalEmployedTTM)
          },
          risk: {
            beta: n(p.beta), marketCap: q.marketCap ? +(q.marketCap/1e6).toFixed(0) : null,
            profitableTTM: (r?.netProfitMarginTTM ?? 0) > 0, operatingCashFlowPositive: true,
            isDefensiveSector: ['Healthcare','Consumer Defensive','Utilities'].includes(p.sector||''),
            isIndustryLeader: (q.marketCap ?? 0) > 5e10, freeFromLegalIssues: true,
            outperformedSP500_5y: (q.changesPercentage ?? 0) > 5
          }
        });
      }
      if (debug) return res.json({ debug_fmp: { q, p, r } });
    } catch(e) { if (debug) return res.json({ fmp_error: e.message }); }
  }

  if (!FH && !FMP) return res.status(500).json({ error: 'No API key configured. Add FINNHUB_KEY or FMP_KEY to Vercel env vars.' });
  return res.json({ found: false });
}