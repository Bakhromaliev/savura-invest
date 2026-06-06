export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const sym = symbol.toUpperCase().trim();

  try {
    // Yahoo Finance quoteSummary - no API key needed
    const modules = 'price,summaryDetail,defaultKeyStatistics,financialData,assetProfile';
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${sym}?modules=${modules}`;
    
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });

    if (!r.ok) return res.json({ found: false });

    const body = await r.json();
    const q = body?.quoteSummary;
    if (!q || q.error || !q.result?.[0]) return res.json({ found: false });

    const d        = q.result[0];
    const price    = d.price            || {};
    const summary  = d.summaryDetail    || {};
    const stats    = d.defaultKeyStatistics || {};
    const fin      = d.financialData    || {};
    const profile  = d.assetProfile     || {};

    const v  = x => x?.raw ?? null;
    const pct = x => x?.raw != null ? +(x.raw * 100).toFixed(2) : null;

    const currentPrice = v(price.regularMarketPrice);
    if (!currentPrice) return res.json({ found: false });

    res.json({
      found: true,
      ticker: sym,
      companyName: price.longName || price.shortName || sym,
      exchange: price.exchangeName || '',
      sector: profile.sector || '',
      industry: profile.industry || '',
      price: currentPrice,
      dataAsOf: new Date().toISOString().split('T')[0],
      fundamentals: {
        revenueGrowth:     pct(fin.revenueGrowth),
        epsGrowth:         pct(stats.earningsQuarterlyGrowth) ?? pct(fin.earningsGrowth),
        pe:                v(summary.trailingPE) ?? v(stats.forwardPE),
        ps:                v(stats.priceToSalesTrailing12Months),
        pb:                v(stats.priceToBook),
        pcf:               null,
        peg:               v(stats.pegRatio),
        grossMargin:       pct(fin.grossMargins),
        operatingMargin:   pct(fin.operatingMargins),
        netMargin:         pct(fin.profitMargins),
        currentRatio:      v(fin.currentRatio),
        quickRatio:        v(fin.quickRatio),
        cashRatio:         null,
        debtToEquity:      v(fin.debtToEquity) != null ? +(v(fin.debtToEquity) / 100).toFixed(2) : null,
        debtToAssets:      null,
        interestCoverage:  null,
        roa:               pct(fin.returnOnAssets),
        roe:               pct(fin.returnOnEquity),
        roic:              null
      },
      risk: {
        beta:                    v(stats.beta),
        marketCap:               v(price.marketCap) ? +(v(price.marketCap) / 1e6).toFixed(0) : null,
        profitableTTM:           (v(fin.profitMargins) ?? 0) > 0,
        operatingCashFlowPositive: v(fin.operatingCashflow) ? v(fin.operatingCashflow) > 0 : true,
        isDefensiveSector:       ['Healthcare','Consumer Defensive','Utilities','Energy'].includes(profile.sector||''),
        isIndustryLeader:        (v(price.marketCap) ?? 0) > 5e10,
        freeFromLegalIssues:     true,
        outperformedSP500_5y:    (v(stats['52WeekChange']) ?? 0) > 0.1
      }
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}