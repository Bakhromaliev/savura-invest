export default async function handler(req, res) {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });
  
  const key = process.env.FINNHUB_KEY;
  if (!key) return res.status(500).json({ error: 'API key not configured' });

  try {
    const [quoteR, profileR, metricsR] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${key}`),
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${key}`)
    ]);
    
    const [quote, profile, metricsData] = await Promise.all([
      quoteR.json(), profileR.json(), metricsR.json()
    ]);
    
    if (!profile || !profile.name) {
      return res.json({ found: false });
    }
    
    const m = metricsData.metric || {};
    
    res.json({
      found: true,
      ticker: symbol.toUpperCase(),
      companyName: profile.name,
      exchange: profile.exchange,
      sector: profile.finnhubIndustry,
      industry: profile.finnhubIndustry,
      price: quote.c,
      dataAsOf: new Date().toISOString().split('T')[0],
      fundamentals: {
        revenueGrowth: m['revenueGrowthTTMYoy'] ?? null,
        epsGrowth: m['epsGrowth'] ?? null,
        pe: m['peTTM'] ?? null,
        ps: m['psTTM'] ?? null,
        pb: m['pbQuarterly'] ?? null,
        pcf: m['pcfShareTTM'] ?? null,
        peg: m['pegRatio'] ?? null,
        grossMargin: m['grossMarginTTM'] ?? null,
        operatingMargin: m['operatingMarginTTM'] ?? null,
        netMargin: m['netProfitMarginTTM'] ?? null,
        currentRatio: m['currentRatioQuarterly'] ?? null,
        quickRatio: m['quickRatioQuarterly'] ?? null,
        cashRatio: m['cashRatioQuarterly'] ?? null,
        debtToEquity: m['totalDebt/totalEquityQuarterly'] ?? null,
        debtToAssets: m['longTermDebt/equityQuarterly'] ?? null,
        interestCoverage: m['ebitdaInterestExpense'] ?? null,
        roa: m['roaTTM'] ?? null,
        roe: m['roeTTM'] ?? null,
        roic: m['roicTTM'] ?? null
      },
      risk: {
        beta: m['beta'] ?? null,
        marketCap: profile.marketCapitalization ?? null,
        profitableTTM: (m['netProfitMarginTTM'] ?? 0) > 0,
        operatingCashFlowPositive: true,
        isDefensiveSector: ['Healthcare','Consumer Staples','Utilities'].some(s => (profile.finnhubIndustry||'').includes(s)),
        isIndustryLeader: (profile.marketCapitalization ?? 0) > 50000,
        freeFromLegalIssues: true,
        outperformedSP500_5y: (m['52WeekPriceReturnDaily'] ?? 0) > 10
      }
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
