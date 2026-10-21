/* MarketSense — données par défaut des indicateurs + fiches pédagogiques (chargé avant app.js) */
'use strict';

/* ══════════════════════════════════════════════════════════════════
   DONNÉES PAR DÉFAUT
   ══════════════════════════════════════════════════════════════════ */
function defaultData() {
  const data = {
    bourse: [
      { name: 'Momentum', indicators: [
        { id:'rsi_spx',   name:'RSI S&P 500 (14j)',     val:58, sig:'neutral', w:2, raw:'—',       unit:'',        source:'live',      desc:'RSI S&P 500 — chargement en cours via le backend.' },
        { id:'macd_spx',  name:'MACD S&P 500',          val:50, sig:'neutral', w:2, raw:'—',       unit:'',        source:'live',      desc:'MACD S&P 500 — chargement en cours via le backend.' },
        { id:'stoch',     name:'Stochastique (14,3)',    val:65, sig:'neutral', w:1, raw:'—',       unit:'',        source:'live',      desc:'Stochastique S&P 500 — chargement via le backend.' },
      ]},
      { name: 'Tendance', indicators: [
        { id:'mm50',      name:'Prix vs MM50',           val:78, sig:'buy',     w:2, raw:'—',       unit:'',        source:'live',      desc:'Prix S&P 500 vs MM50 — chargement en cours.' },
        { id:'mm200',     name:'Prix vs MM200',          val:83, sig:'buy',     w:3, raw:'—',       unit:'',        source:'live',      desc:'Prix S&P 500 vs MM200 — chargement en cours.' },
        { id:'cross',     name:'Golden / Death Cross',   val:80, sig:'buy',     w:2, raw:'—',       unit:'',        source:'live',      desc:'Croisement MM50/MM200 — chargement en cours.' },
      ]},
      { name: 'Volatilité', indicators: [
        { id:'vix',       name:'VIX (Cboe)',             val:38, sig:'neutral', w:2, raw:'—',       unit:'',        source:'live',      desc:'VIX — chargement en cours via le backend.' },
        { id:'bollinger', name:'Bollinger Bands',        val:55, sig:'neutral', w:1, raw:'—',       unit:'',        source:'live',      desc:'Bandes de Bollinger S&P 500 — chargement en cours.' },
        { id:'atr',       name:'ATR (volatilité hist.)', val:42, sig:'neutral', w:1, raw:'—',       unit:'',        source:'live',      desc:'ATR S&P 500 — chargement en cours.' },
      ]},
      { name: 'Sentiment', indicators: [
        { id:'fg_spx',    name:'Fear & Greed Index',     val:65, sig:'neutral', w:3, raw:'65',      unit:'/100',    source:'live', desc:'Indice CNN Fear & Greed. (données simulées — API privée CNN)' },
        { id:'putcall',   name:'Put / Call Ratio',       val:48, sig:'neutral', w:2, raw:'—',       unit:'',        source:'live',      desc:'Ratio Put/Call equity (CBOE) — chargement via le backend.' },
        { id:'aaii',      name:'AAII Sentiment',         val:60, sig:'neutral', w:1, raw:'—',       unit:'',        source:'live',      desc:'Sentiment AAII hebdomadaire — chargement via le backend.' },
      ]},
      { name: 'MSCI World — CW8 (Amundi)', indicators: [
        { id:'rsi_cw8',   name:'RSI CW8 (14j)',         val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'RSI Amundi MSCI World UCITS ETF (CW8) — chargement.' },
        { id:'macd_cw8',  name:'MACD CW8',              val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'MACD CW8 — chargement via le backend.' },
        { id:'mm50_cw8',  name:'CW8 vs MM50',           val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'CW8 vs moyenne mobile 50j — tendance court terme.' },
        { id:'mm200_cw8', name:'CW8 vs MM200',          val:50, sig:'neutral', w:3, raw:'—', unit:'', source:'live', desc:'CW8 vs moyenne mobile 200j — tendance long terme MSCI World.' },
        { id:'stoch_cw8', name:'Stochastique CW8',      val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'Stochastique CW8 — chargement via le backend.' },
      ]},
      { name: 'S&P 500 ETF — ESE (Amundi)', indicators: [
        { id:'rsi_ese',   name:'RSI ESE (14j)',          val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'RSI Amundi S&P 500 UCITS ETF (ESE) — chargement.' },
        { id:'macd_ese',  name:'MACD ESE',               val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'MACD ESE — chargement via le backend.' },
        { id:'mm50_ese',  name:'ESE vs MM50',            val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'ESE vs moyenne mobile 50j — tendance court terme S&P 500.' },
        { id:'mm200_ese', name:'ESE vs MM200',           val:50, sig:'neutral', w:3, raw:'—', unit:'', source:'live', desc:'ESE vs moyenne mobile 200j — tendance long terme S&P 500 ETF.' },
        { id:'stoch_ese', name:'Stochastique ESE',       val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'Stochastique ESE — chargement via le backend.' },
      ]},
      { name: 'Marchés Émergents — PAEEM (Amundi)', indicators: [
        { id:'rsi_paeem',   name:'RSI PAEEM (14j)',      val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'RSI Amundi MSCI Emerging Markets UCITS ETF (PAEEM) — chargement.' },
        { id:'macd_paeem',  name:'MACD PAEEM',           val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'MACD PAEEM — chargement via le backend.' },
        { id:'mm50_paeem',  name:'PAEEM vs MM50',        val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'PAEEM vs moyenne mobile 50j — tendance court terme.' },
        { id:'mm200_paeem', name:'PAEEM vs MM200',       val:50, sig:'neutral', w:3, raw:'—', unit:'', source:'live', desc:'PAEEM vs moyenne mobile 200j — tendance long terme marchés émergents.' },
        { id:'stoch_paeem', name:'Stochastique PAEEM',   val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'Stochastique PAEEM — chargement via le backend.' },
      ]},
      { name: 'Asie Pac. ex-Japon — PAASI (Amundi)', indicators: [
        { id:'rsi_paasi',   name:'RSI PAASI (14j)',      val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'RSI Amundi MSCI AC Asia Pacific ex Japan UCITS ETF (PAASI) — chargement.' },
        { id:'macd_paasi',  name:'MACD PAASI',           val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'MACD PAASI — chargement via le backend.' },
        { id:'mm50_paasi',  name:'PAASI vs MM50',        val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'PAASI vs moyenne mobile 50j — tendance court terme.' },
        { id:'mm200_paasi', name:'PAASI vs MM200',       val:50, sig:'neutral', w:3, raw:'—', unit:'', source:'live', desc:'PAASI vs moyenne mobile 200j — tendance long terme Asie.' },
        { id:'stoch_paasi', name:'Stochastique PAASI',   val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'Stochastique PAASI — chargement via le backend.' },
      ]},
      { name: 'Macro & Crédit', indicators: [
        { id:'yield_curve', name:'Courbe des taux (10a − 3m)', val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'Courbe des taux 10 ans − 3 mois (FRED) — chargement via le backend.' },
        { id:'hy_spread', name:'Écart de crédit High Yield', val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'Écart de crédit haut rendement (FRED) — chargement via le backend.' },
        { id:'fin_stress', name:'Stress financier (St. Louis Fed)', val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'Indice de stress financier (FRED) — chargement via le backend.' },
        { id:'sahm', name:'Règle de Sahm (récession)', val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'Règle de Sahm (FRED) — chargement via le backend.' },
        { id:'fed_liq', name:'Liquidité Fed (bilan 3 mois)', val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'Bilan de la Fed sur 3 mois (FRED) — chargement via le backend.' },
      ]},
      { name: 'Largeur & Rotation', indicators: [
        { id:'breadth', name:'Largeur : S&P équipondéré vs pondéré', val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'RSP vs SPY sur 3 mois — chargement via le backend.' },
        { id:'rotation', name:'Rotation : cyclique vs défensif', val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'XLY vs XLP sur 3 mois — chargement via le backend.' },
        { id:'vix_term', name:'Structure du VIX (VIX/VIX3M)', val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'Structure par terme du VIX — chargement via le backend.' },
        { id:'skew', name:'Indice SKEW (risque de krach)', val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'Indice SKEW Cboe — chargement via le backend.' },
      ]},
      { name: 'Valorisation', indicators: [
        { id:'erp',       name:'Prime de risque actions (CAPE − taux réel)', val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'Prime de risque des actions (rendement CAPE moins taux réel) — chargement via le backend.' },
        { id:'cape',      name:'Shiller CAPE',           val:22, sig:'sell',    w:3, raw:'—',       unit:'x',       source:'live',      desc:'Shiller CAPE — chargement en cours (scrape multpl.com).' },
        { id:'pe_fwd',    name:'P/E Trailing S&P 500',  val:38, sig:'neutral', w:2, raw:'—',       unit:'x',       source:'live',      desc:'P/E Trailing S&P 500 (SPY) — chargement via le backend.' },
      ]},
    ],
    crypto: [
      { name: 'Métriques On-Chain', indicators: [
        { id:'mvrv',     name:'MVRV Z-Score',           val:50, sig:'neutral', w:3, raw:'—',        unit:'',     source:'simulated', desc:'MVRV Z-Score (Bitbo) — indisponible, API Bitbo payante (clé requise).' },
        { id:'nupl',     name:'NUPL',                   val:50, sig:'neutral', w:3, raw:'—',        unit:'',     source:'simulated', desc:'Net Unrealized Profit/Loss (Bitbo) — indisponible, API Bitbo payante (clé requise).' },
        { id:'sopr',     name:'SOPR',                   val:50, sig:'neutral', w:2, raw:'—',        unit:'',     source:'simulated', desc:'Spent Output Profit Ratio (Bitbo) — indisponible, API Bitbo payante (clé requise).' },
        { id:'cdd',      name:'Coin Days Destroyed',    val:50, sig:'neutral', w:2, raw:'—',        unit:'',     source:'simulated', desc:'Coin Days Destroyed (Bitbo) — indisponible, API Bitbo payante (clé requise).' },
        { id:'nvt',      name:'NVT Signal',             val:50, sig:'neutral', w:2, raw:'—',        unit:'',     source:'simulated', desc:'Network Value to Transactions (Bitbo) — indisponible, API Bitbo payante (clé requise).' },
        { id:'hashrate', name:'Hash Rate BTC',          val:88, sig:'buy',     w:2, raw:'—',        unit:'EH/s', source:'live', desc:'Hash Rate BTC en temps réel (Blockchain.info).' },
      ]},
      { name: 'On-Chain gratuit & Flux', indicators: [
        { id:'mvrv_ratio', name:'MVRV Bitcoin (ratio)', val:50, sig:'neutral', w:3, raw:'—', unit:'x', source:'live', desc:'MVRV Bitcoin (Coin Metrics) — chargement via le backend.' },
        { id:'ls_ratio', name:'Long / Short BTC (OKX)', val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'Ratio long/short BTC (OKX) — chargement via le backend.' },
        { id:'stablecoins', name:'Offre de stablecoins (30 j)', val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'Offre de stablecoins (DefiLlama) — chargement via le backend.' },
      ]},
      { name: 'Sentiment Crypto', indicators: [
        { id:'cfg',      name:'Crypto Fear & Greed',    val:50, sig:'neutral', w:3, raw:'—',        unit:'/100', source:'live', desc:'Indice Alternative.me — chargement en cours.' },
        { id:'btcdom',   name:'Bitcoin Dominance',      val:54, sig:'neutral', w:1, raw:'—',        unit:'%',    source:'live', desc:'Dominance BTC (CoinGecko) — chargement en cours.' },
        { id:'funding',  name:'Funding Rate Perps',     val:55, sig:'neutral', w:2, raw:'—',        unit:'/8h',  source:'live', desc:'Funding Rate BTC perps (Binance) — chargement.' },
      ]},
      { name: 'Indicateurs de Cycle', indicators: [
        { id:'picycle',  name:'Pi Cycle Top',           val:28, sig:'buy',     w:3, raw:'—',        unit:'',     source:'live', desc:'Pi Cycle calculé depuis les prix BTC (CoinGecko) — chargement.' },
        { id:'puell',    name:'Puell Multiple',         val:50, sig:'neutral', w:2, raw:'—',        unit:'',     source:'simulated', desc:'Puell Multiple (Bitbo) — indisponible, API Bitbo payante (clé requise).' },
        { id:'mayer',    name:'Mayer Multiple',         val:50, sig:'neutral', w:2, raw:'—',        unit:'x',    source:'live', desc:'Prix BTC / MM200 (Bitbo / yfinance) — chargement.' },
        { id:'rainbow',  name:'Rainbow Chart Zone',     val:52, sig:'neutral', w:1, raw:'—',        unit:'',     source:'live', desc:'Rainbow Chart BTC (log-régression) — chargement.' },
      ]},
      { name: 'Indicateurs Sociaux', indicators: [
        { id:'google_trends',  name:'Google Trends "Bitcoin"', val:50, sig:'neutral', w:2, raw:'—', unit:'/100', source:'live', desc:'Intérêt de recherche Google pour "Bitcoin" (90j) — chargement.' },
        { id:'coinbase_rank',  name:'Coinbase — App Store',    val:50, sig:'neutral', w:2, raw:'—', unit:' Finance', source:'live', desc:'Classement Coinbase App Store Finance US — chargement.' },
        { id:'binance_rank',   name:'Binance — App Store',     val:50, sig:'neutral', w:2, raw:'—', unit:' Finance', source:'live', desc:'Classement Binance App Store Finance US — chargement.' },
      ]},
      { name: 'Halving & Cycles BTC', indicators: [
        { id:'days_since_halving', name:'Jours depuis le halving', val:30, sig:'buy', w:3, raw:'—', unit:'', source:'live', desc:'Jours écoulés depuis le halving 4 (20 avril 2024) — chargement.' },
        { id:'days_until_halving', name:'Jours avant le halving',  val:20, sig:'buy', w:2, raw:'—', unit:'', source:'live', desc:'Jours restants avant le halving 5 (~avril 2028) — chargement.' },
        { id:'cycle_progress',     name:'Progression du cycle',    val:25, sig:'buy', w:2, raw:'—', unit:'', source:'live', desc:'% du cycle post-halving H4 écoulé — chargement.' },
      ]},
      { name: 'Analyse Technique BTC', indicators: [
        { id:'btcrsi',       name:'RSI Bitcoin Journalier',  val:50, sig:'neutral', w:2, raw:'—', unit:'',    source:'live', desc:'RSI BTC (14j) depuis les prix CoinGecko — chargement.' },
        { id:'btcrsim',      name:'RSI Bitcoin Mensuel',     val:50, sig:'neutral', w:3, raw:'—', unit:'',    source:'live', desc:'RSI mensuel BTC — signal clé de cycle.' },
        { id:'btcmacd',      name:'MACD Bitcoin',            val:50, sig:'neutral', w:2, raw:'—', unit:'',    source:'live', desc:'MACD BTC depuis les prix CoinGecko — chargement.' },
        { id:'bollinger_btc',name:'Bollinger Bands BTC',     val:50, sig:'neutral', w:1, raw:'—', unit:'',    source:'live', desc:'Position BTC dans ses bandes de Bollinger — chargement.' },
        { id:'atr_btc',      name:'Volatilité ATR BTC',      val:40, sig:'neutral', w:1, raw:'—', unit:'% du prix', source:'live', desc:'ATR Bitcoin — niveau de volatilité actuel.' },
        { id:'btcsupp',      name:'Support / Résistance',    val:72, sig:'buy',     w:1, raw:'Au-dessus', unit:'', source:'simulated', desc:'Bitcoin au-dessus de ses supports clés. (données simulées)' },
      ]},
      { name: 'Ethereum (ETH)', indicators: [
        { id:'rsi_eth',      name:'RSI ETH (14j)',           val:50, sig:'neutral', w:2, raw:'—', unit:'',       source:'live', desc:'RSI Ethereum — chargement via le backend.' },
        { id:'macd_eth',     name:'MACD ETH',                val:50, sig:'neutral', w:2, raw:'—', unit:'',       source:'live', desc:'MACD Ethereum — chargement via le backend.' },
        { id:'mm50_eth',     name:'ETH vs MM50',             val:50, sig:'neutral', w:1, raw:'—', unit:'',       source:'live', desc:'ETH vs moyenne mobile 50j — chargement.' },
        { id:'mm200_eth',    name:'ETH vs MM200',            val:50, sig:'neutral', w:3, raw:'—', unit:'',       source:'live', desc:'ETH vs moyenne mobile 200j — tendance long terme.' },
        { id:'bollinger_eth',name:'Bollinger ETH',           val:50, sig:'neutral', w:1, raw:'—', unit:'',       source:'live', desc:'Position ETH dans ses bandes de Bollinger.' },
        { id:'vs_btc_eth',   name:'ETH vs BTC (90j)',        val:50, sig:'neutral', w:2, raw:'—', unit:' vs BTC',source:'live', desc:'Performance ETH relative à Bitcoin sur 90j.' },
      ]},
      { name: 'Solana (SOL)', indicators: [
        { id:'rsi_sol',      name:'RSI SOL (14j)',           val:50, sig:'neutral', w:2, raw:'—', unit:'',       source:'live', desc:'RSI Solana — chargement via le backend.' },
        { id:'macd_sol',     name:'MACD SOL',                val:50, sig:'neutral', w:2, raw:'—', unit:'',       source:'live', desc:'MACD Solana — chargement via le backend.' },
        { id:'mm50_sol',     name:'SOL vs MM50',             val:50, sig:'neutral', w:1, raw:'—', unit:'',       source:'live', desc:'SOL vs moyenne mobile 50j — chargement.' },
        { id:'mm200_sol',    name:'SOL vs MM200',            val:50, sig:'neutral', w:3, raw:'—', unit:'',       source:'live', desc:'SOL vs moyenne mobile 200j — tendance long terme.' },
        { id:'bollinger_sol',name:'Bollinger SOL',           val:50, sig:'neutral', w:1, raw:'—', unit:'',       source:'live', desc:'Position SOL dans ses bandes de Bollinger.' },
        { id:'vs_btc_sol',   name:'SOL vs BTC (90j)',        val:50, sig:'neutral', w:2, raw:'—', unit:' vs BTC',source:'live', desc:'Performance Solana relative à Bitcoin sur 90j.' },
        { id:'sol_tvl', name:'SOL — capitaux déposés (30j)', val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'TVL Solana, variation 30 jours — chargement.' },
        { id:'sol_dex', name:'SOL — volume DEX (7j vs 30j)', val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'Volume des DEX Solana — chargement.' },
        { id:'sol_stable', name:'SOL — stablecoins (30j)', val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'Stablecoins sur Solana, variation 30 jours — chargement.' },
        { id:'sol_funding', name:'SOL — funding à levier (7j)', val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'Funding Hyperliquid de SOL — chargement.' },
      ]},
      { name: 'Hyperliquid (HYPE)', indicators: [
        { id:'rsi_hype',      name:'RSI HYPE (14j)',         val:50, sig:'neutral', w:2, raw:'—', unit:'',       source:'live', desc:'RSI Hyperliquid (HYPE) — chargement via le backend.' },
        { id:'macd_hype',     name:'MACD HYPE',              val:50, sig:'neutral', w:2, raw:'—', unit:'',       source:'live', desc:'MACD HYPE — chargement via le backend.' },
        { id:'mm50_hype',     name:'HYPE vs MM50',           val:50, sig:'neutral', w:1, raw:'—', unit:'',       source:'live', desc:'HYPE vs MM50 — tendance court terme.' },
        { id:'bollinger_hype',name:'Bollinger HYPE',         val:50, sig:'neutral', w:1, raw:'—', unit:'',       source:'live', desc:'Position HYPE dans ses bandes de Bollinger.' },
        { id:'vs_btc_hype',   name:'HYPE vs BTC (90j)',      val:50, sig:'neutral', w:2, raw:'—', unit:' vs BTC',source:'live', desc:'Performance HYPE relative à Bitcoin sur 90j.' },
        { id:'hype_rev', name:'HYPE — revenus du protocole (30j)', val:50, sig:'neutral', w:3, raw:'—', unit:'', source:'live', desc:'Revenus Hyperliquid, variation 30 jours — chargement.' },
        { id:'hype_tvl', name:'HYPE — capitaux déposés (30j)', val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'TVL Hyperliquid, variation 30 jours — chargement.' },
        { id:'hype_funding', name:'HYPE — funding à levier (7j)', val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'Funding Hyperliquid de HYPE — chargement.' },
        { id:'mm200_hype', name:'HYPE vs MM200', val:50, sig:'neutral', w:3, raw:'—', unit:'', source:'live', desc:'HYPE vs moyenne mobile 200j — tendance long terme.' },
      ]},
    ],
    matieres: [
      { name: 'Macro & Dollar', indicators: [
        { id:'dxy',           name:'Dollar Index (DXY)',       val:30, sig:'buy',     w:3, raw:'—', unit:'',          source:'live',      desc:'DXY — chargement via le backend.' },
        { id:'realrates',     name:'Taux réels (TIPS 10y)',    val:72, sig:'buy',     w:3, raw:'—', unit:'',          source:'live',      desc:'Taux réels TIPS 10y (FRED) — chargement.' },
        { id:'infl_be',       name:'Inflation anticipée 10 ans', val:50, sig:'neutral', w:2, raw:'—', unit:'', source:'live', desc:'Inflation anticipée à 10 ans (FRED) — chargement via le backend.' },
        { id:'fed_liq',       name:'Liquidité Fed (bilan 3 mois)', val:50, sig:'neutral', w:1, raw:'—', unit:'', source:'live', desc:'Bilan de la Fed sur 3 mois (FRED) — chargement via le backend.' },
        { id:'cpi',           name:'Inflation CPI (USA)',      val:62, sig:'buy',     w:2, raw:'—', unit:'',          source:'live',      desc:'Inflation CPI annualisée (FRED) — chargement.' },
      ]},
      { name: 'Or (GC=F)', indicators: [
        { id:'rsi_gold',      name:'RSI Or (14j)',             val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'RSI Or — chargement.' },
        { id:'macd_gold',     name:'MACD Or',                  val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'MACD Or — chargement.' },
        { id:'mm50_gold',     name:'Or vs MM50',               val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'Or vs MM50 — tendance court terme.' },
        { id:'mm200_gold',    name:'Or vs MM200',              val:50, sig:'neutral', w:3, raw:'—', unit:'',          source:'live', desc:'Or vs MM200 — tendance long terme.' },
        { id:'perf1y_gold',   name:'Performance Or 1 an',      val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'Performance Or sur 12 mois.' },
        { id:'goldsil',       name:'Ratio Or / Argent',        val:78, sig:'buy',     w:2, raw:'—', unit:'',          source:'live', desc:'Ratio Or/Argent — moy. historique ~65:1.' },
        { id:'cbgold',        name:'Achats Banques Centrales', val:88, sig:'buy',     w:3, raw:'Records', unit:'',    source:'simulated', desc:'Achats records banques centrales (WGC 2024). (données simulées)' },
      ]},
      { name: 'Argent (SI=F)', indicators: [
        { id:'rsi_silver',    name:'RSI Argent (14j)',         val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'RSI Argent — chargement.' },
        { id:'macd_silver',   name:'MACD Argent',              val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'MACD Argent — chargement.' },
        { id:'mm50_silver',   name:'Argent vs MM50',           val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'Argent vs MM50 — tendance court terme.' },
        { id:'mm200_silver',  name:'Argent vs MM200',          val:50, sig:'neutral', w:3, raw:'—', unit:'',          source:'live', desc:'Argent vs MM200 — tendance long terme.' },
        { id:'perf1y_silver', name:'Performance Argent 1 an',  val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'Performance Argent sur 12 mois.' },
      ]},
      { name: 'Petrole & Energie', indicators: [
        { id:'rsi_wti',       name:'RSI Petrole WTI (14j)',    val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'RSI Petrole WTI (CL=F) — chargement.' },
        { id:'macd_wti',      name:'MACD WTI',                 val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'MACD Petrole WTI — chargement.' },
        { id:'mm50_wti',      name:'WTI vs MM50',              val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'WTI vs MM50 — tendance court terme.' },
        { id:'mm200_wti',     name:'WTI vs MM200',             val:50, sig:'neutral', w:3, raw:'—', unit:'',          source:'live', desc:'WTI vs MM200 — tendance long terme.' },
        { id:'perf1y_wti',    name:'Performance WTI 1 an',     val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'Performance WTI sur 12 mois.' },
        { id:'rsi_brent',     name:'RSI Brent (14j)',          val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'RSI Petrole Brent (BZ=F) — chargement.' },
        { id:'macd_brent',    name:'MACD Brent',               val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'MACD Brent — chargement.' },
        { id:'mm200_brent',   name:'Brent vs MM200',           val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'Brent vs MM200 — tendance long terme.' },
        { id:'rsi_ng',        name:'RSI Gaz Naturel (14j)',    val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'RSI Gaz Naturel (NG=F) — chargement.' },
        { id:'macd_ng',       name:'MACD Gaz Naturel',         val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'MACD Gaz Naturel — chargement.' },
        { id:'mm200_ng',      name:'Gaz Naturel vs MM200',     val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'Gaz Naturel vs MM200 — tendance long terme.' },
        { id:'gold_oil_ratio',name:'Ratio Or / Petrole',       val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'Ratio Or/Petrole — signal macro (> 30 = deflationniste).' },
      ]},
      { name: 'Uranium & Nucleaire', indicators: [
        { id:'rsi_ura',       name:'RSI URA ETF (14j)',        val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'RSI Uranium ETF (URA) — chargement.' },
        { id:'macd_ura',      name:'MACD URA',                 val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'MACD URA ETF — chargement.' },
        { id:'mm200_ura',     name:'URA vs MM200',             val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'URA vs MM200 — tendance long terme.' },
        { id:'perf1y_ura',    name:'Performance URA 1 an',     val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'Performance URA ETF sur 12 mois.' },
        { id:'rsi_urnm',      name:'RSI URNM (14j)',           val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'RSI Sprott Uranium Miners ETF (URNM) — chargement.' },
        { id:'macd_urnm',     name:'MACD URNM',                val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'MACD URNM — chargement.' },
        { id:'mm200_urnm',    name:'URNM vs MM200',            val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'URNM vs MM200 — tendance long terme.' },
        { id:'rsi_ccj',       name:'RSI Cameco CCJ (14j)',     val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'RSI Cameco Corp (CCJ) — plus grand producteur mondial.' },
        { id:'macd_ccj',      name:'MACD Cameco',              val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'MACD Cameco — chargement.' },
        { id:'mm200_ccj',     name:'Cameco vs MM200',          val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'Cameco vs MM200 — tendance long terme.' },
        { id:'nuclear',       name:'Demande Nucleaire',        val:88, sig:'buy',     w:3, raw:'60+', unit:' reacteurs', source:'simulated', desc:'60+ reacteurs en construction mondiale. (donnees simulees)' },
      ]},
      { name: 'Platine & Palladium', indicators: [
        { id:'rsi_platinum',  name:'RSI Platine (14j)',        val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'RSI Platine (PL=F) — chargement.' },
        { id:'macd_platinum', name:'MACD Platine',             val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'MACD Platine — chargement.' },
        { id:'mm200_platinum',name:'Platine vs MM200',         val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'Platine vs MM200 — tendance long terme.' },
        { id:'perf1y_platinum',name:'Perf Platine 1 an',      val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'Performance Platine sur 12 mois.' },
        { id:'rsi_palladium', name:'RSI Palladium (14j)',      val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'RSI Palladium (PA=F) — chargement.' },
        { id:'mm200_palladium',name:'Palladium vs MM200',      val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'Palladium vs MM200 — tendance long terme.' },
        { id:'platpall',      name:'Ratio Platine / Palladium',val:76, sig:'buy',     w:2, raw:'—', unit:'',          source:'live', desc:'Ratio Platine vs Palladium — chargement.' },
      ]},
      { name: 'Metaux Industriels', indicators: [
        { id:'rsi_copper',    name:'RSI Cuivre (14j)',         val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'RSI Cuivre (HG=F) — chargement.' },
        { id:'macd_copper',   name:'MACD Cuivre',              val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'MACD Cuivre — chargement.' },
        { id:'mm50_copper',   name:'Cuivre vs MM50',           val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'Cuivre vs MM50 — tendance court terme.' },
        { id:'mm200_copper',  name:'Cuivre vs MM200',          val:50, sig:'neutral', w:3, raw:'—', unit:'',          source:'live', desc:'Cuivre vs MM200 — thermometre de la croissance mondiale.' },
        { id:'perf1y_copper', name:'Perf Cuivre 1 an',        val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'Performance Cuivre sur 12 mois.' },
        { id:'rsi_alum',      name:'RSI Aluminium (14j)',      val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'RSI Aluminium (ALI=F) — chargement.' },
        { id:'macd_alum',     name:'MACD Aluminium',           val:50, sig:'neutral', w:1, raw:'—', unit:'',          source:'live', desc:'MACD Aluminium — chargement.' },
        { id:'mm200_alum',    name:'Aluminium vs MM200',       val:50, sig:'neutral', w:2, raw:'—', unit:'',          source:'live', desc:'Aluminium vs MM200 — tendance long terme.' },
      ]},
    ],

  };
  // Horizon : 'c' = court terme (momentum, sentiment, volatilité), 'l' = long terme (tendance de fond, valorisation, macro)
  const SHORT_IDS = new Set(['vix','vix_term','skew','putcall','aaii','fg_spx','cfg','funding','ls_ratio',
    'google_trends','coinbase_rank','binance_rank','btcrsi','btcmacd','rotation','btcsupp','atr_btc']);
  for (const tab of ['bourse','crypto','matieres']) {
    for (const g of data[tab]) for (const i of g.indicators) {
      i.h = (SHORT_IDS.has(i.id) || /^(rsi|macd|stoch|bollinger|atr|mm50|vs_btc)/.test(i.id)) ? 'c' : 'l';
    }
  }
  // Familles d'indicateurs corrélés : le poids cumulé d'une famille est plafonné (fc) pour qu'un même message
  // (ex. tendance de l'indice mondial, du S&P 500 et de ses ETF) ne compte pas dix fois dans le vote.
  const FAMILIES = [
    ['bourse',   'eq_tech',         16, i => /^(rsi|macd|stoch|mm50|mm200|cross|bollinger|atr)(_cw8|_ese|_paeem|_paasi|_spx)?$/.test(i.id)],
    ['bourse',   'macro_stress',     4, i => ['yield_curve','hy_spread','fin_stress','sahm'].includes(i.id)],
    ['bourse',   'valuation',        5, i => ['cape','pe_fwd','erp'].includes(i.id)],
    ['crypto',   'alt_tech',        10, i => /_(eth|sol|hype)$/.test(i.id)],
    ['crypto',   'sol_chain',        8, i => /^sol_/.test(i.id)],
    ['crypto',   'hype_chain',       8, i => /^hype_/.test(i.id)],
    ['crypto',   'btc_tech',         6, i => ['btcrsi','btcrsim','btcmacd','bollinger_btc','atr_btc','btcsupp'].includes(i.id)],
    ['crypto',   'halving',          3, i => /halving|cycle_progress/.test(i.id)],
    ['matieres', 'uranium',          8, i => /_(ura|urnm|ccj)$/.test(i.id)],
    ['matieres', 'oil',              8, i => /_(wti|brent|ng)$/.test(i.id)],
    ['matieres', 'precious_tech',   12, i => /_(gold|silver|platinum|palladium)$/.test(i.id)],
    ['matieres', 'industrial_tech',  8, i => /_(copper|alum)$/.test(i.id)],
    ['matieres', 'inflation_macro',  5, i => ['realrates','infl_be','cpi'].includes(i.id)],
  ];
  for (const [tab, fam, cap, test] of FAMILIES) {
    for (const g of data[tab]) for (const i of g.indicators) if (test(i)) { i.f = fam; i.fc = cap; }
  }
  return data;
}

/* ══════════════════════════════════════════════════════════════════
   TOOLTIP avec explications pédagogiques
   ══════════════════════════════════════════════════════════════════ */
const INDICATOR_INFO = {
  rsi_spx:{what:"Le RSI mesure la vélocité des variations de prix sur 14 jours, de 0 à 100.",why:"Il permet de détecter les excès de marché. L'un des indicateurs les plus utilisés par les traders professionnels depuis 1978.",how:"< 30 : survendu, rebond probable. > 70 : suracheté, correction possible. Zone 30-70 : neutre.",creator:"J. Welles Wilder Jr. (1978)"},
  macd_spx:{what:"Différence entre EMA 12j et EMA 26j. La ligne de signal est l'EMA 9j du MACD.",why:"Combine tendance et momentum. Le croisement avec sa ligne de signal est un des signaux de retournement les plus fiables.",how:"MACD > ligne signal : haussier. En dessous : baissier. La divergence MACD/prix anticipe les retournements.",creator:"Gerald Appel (1979)"},
  vix:{what:"Mesure la volatilité implicite attendue du S&P 500 sur 30 jours, calculée sur les prix d'options.",why:"Reflète l'anxiété institutionnelle. Un VIX élevé = panique = opportunité contrariante. Un VIX bas signale la complaisance, mais le test rétroactif n'en fait pas un signal de vente fiable.",how:"< 15 : complaisance. 15-25 : normal. > 30 : peur, opportunité contrariante. > 40 : capitulation, points d'achat historiques.",creator:"CBOE (1993)"},
  cape:{what:"Divise le cours S&P 500 par la moyenne des bénéfices réels des 10 dernières années, éliminant les biais cycliques.",why:"Shiller a prouvé qu'un CAPE élevé prédit des rendements futurs faibles sur 10 ans. Confirmé historiquement.",how:"Moy. historique ~16x. > 30 : marchés chers. > 40 : bulle. < 12 : attractif. Peut rester élevé en période de taux bas.",creator:"Robert Shiller, Yale (1988)"},
  fg_spx:{what:"Agrège 7 indicateurs CNN : momentum, force des actions, options Put/Call, junk bonds, demande de valeur refuge, volatilité.",why:"Quantifie l'irrationnalité du marché. 'Soyez avide quand les autres ont peur' (Buffett). Exploite les extrêmes émotionnels.",how:"0-24 : peur extrême → opportunité. 25-49 : peur. 50-74 : cupidité. 75-100 : cupidité extrême → prudence.",creator:"CNN Money"},
  putcall:{what:"Compare le volume d'options Put (vente) aux options Call (achat).",why:"Les options révèlent les anticipations institutionnelles. Excès de puts = peur déjà dans les prix = signal contrariant positif.",how:"> 1.0 : excès de puts, haussier contrariant. < 0.7 : excès de calls, euphorie dangereuse. ~0.85 : équilibré.",creator:"CBOE"},
  bollinger:{what:"Deux bandes à ±2 écarts-types de la MM20. 95% des prix restent dans les bandes.",why:"Mesurent la volatilité relative. La compression des bandes précède les grands mouvements directionnels.",how:"Position > 80% : surachat technique. < 20% : survente. Compression = mouvement fort imminent (direction inconnue).",creator:"John Bollinger (1980s)"},
  mvrv:{what:"Compare la capitalisation BTC (Market Value) à la valeur réalisée (coût moyen de tous les BTC). Z-Score normalise l'écart.",why:"L'un des meilleurs indicateurs on-chain pour identifier bulles et capitulations. Mesure si les holders sont globalement en profit.",how:"Z > 7 : bulle (vente). Z 2-7 : optimisme. Z 0-2 : neutre. Z < 0 : capitulation, achat historique majeur.",creator:"David Puell & Murad Mahmudov"},
  nupl:{what:"Mesure le pourcentage net de BTC en profit non réalisé parmi tous les détenteurs.",why:"En euphorie, tout le monde est en profit → pression vendeuse latente. En capitulation → signal de fond de marché.",how:"< 0 : capitulation. 0-0.25 : espoir. 0.25-0.5 : optimisme. 0.5-0.75 : excitation. > 0.75 : euphorie → distribuer.",creator:"Glassnode"},
  sopr:{what:"Ratio profit/perte des BTC déplacés chaque jour. SOPR > 1 = vendeurs en profit.",why:"Quand SOPR < 1, les holders vendent à perte → capitulation → fond de marché historique.",how:"> 1.14 : distribution forte. ≈ 1 : équilibre sain. < 0.98 : capitulation → opportunité historique.",creator:"Renato Shirakashi / Glassnode"},
  cdd:{what:"Pondère les mouvements BTC par leur ancienneté. 1 BTC immobile 100j qui bouge = 100 coin days destroyed.",why:"Détecte les 'anciens holders' (baleines, early adopters). Quand ils bougent après longtemps → souvent pour prendre profits aux sommets.",how:"CDD très élevé : anciens holders distribuent → sommet potentiel. Faible : ils conservent → signal haussier.",creator:"Glassnode"},
  nvt:{what:"Network Value to Transactions. Le 'P/E du Bitcoin' : capitalisation / volume de transactions blockchain.",why:"Mesure si le réseau est correctement valorisé vs son activité réelle. NVT élevé = prix déconnecté de l'utilisation.",how:"< 50 : réseau activement utilisé, solide fondamentalement. 50-150 : normal. > 150 : surévaluation potentielle.",creator:"Willy Woo"},
  picycle:{what:"Croisement MM111 avec 2×MM350. Ces nombres approximent π (Pi ≈ 3.14), d'où le nom.",why:"A prédit les 3 derniers sommets de cycle BTC avec une précision de quelques jours. Signal de fin de bull market.",how:"MM111 < 2×MM350 : pas de signal, favorable. Croisement : signal de sommet historique → réduire drastiquement l'exposition.",creator:"Harold Christopher Burger"},
  puell:{what:"Compare les revenus journaliers des mineurs à leur moyenne 365j. Mesure la profitabilité relative du minage.",why:"Les mineurs sont des vendeurs naturels. Revenus très élevés → pression vendeuse max. Revenus très bas → fond de marché.",how:"> 4 : distribution (vente). 0.5-4 : normal. < 0.5 : mineurs en détresse → accumulation historique.",creator:"David Puell"},
  rainbow:{what:"Modélise le prix BTC sur une régression logarithmique depuis 2009, avec 9 bandes de couleur.",why:"BTC suit une croissance logarithmique avec cycles de 4 ans. Visualise où le prix se situe dans le cycle long terme.",how:"Zones 1-2 (bleu) : achat exceptionnel. 3-4 : accumuler. 5 : conserver. 6-7 : vigilance. 8-9 (rouge) : vendre.",creator:"Über Holger (modèle log)"},
  mayer:{what:"Prix BTC actuel divisé par sa MM200. Mesure l'écart entre le prix et sa tendance long terme.",why:"La MM200 est la référence universelle. Trace Mayer a calculé que > 2.4 correspond aux bulles, < 1.0 aux opportunités.",how:"< 0.8 : sous la MM200, achat historique. 0.8-1.5 : neutre. > 2.4 : zone de vente historique. Moyenne historique ≈ 1.34.",creator:"Trace Mayer"},
  btcrsim:{what:"RSI calculé sur les clôtures mensuelles BTC plutôt que journalières.",why:"Filtre le bruit et capte les signaux de cycle. Historiquement, RSI mensuel > 90 = proche d'un sommet majeur.",how:"> 90 : sommet de cycle probable, réduire l'exposition. 70-90 : bull market avancé. 40-70 : sain. < 40 : survente mensuelle.",creator:"Analyse technique classique"},
  hashrate:{what:"Puissance de calcul totale du réseau Bitcoin en Exahash/seconde.",why:"Les mineurs investissent des millions. Hash Rate en hausse = ils anticipent des prix futurs plus élevés. ATH Hash Rate = confiance professionnelle maximale.",how:"Croissant : signal haussier. Chute soudaine : capitulation des mineurs (souvent aux fonds de bear market).",creator:"Blockchain.info (temps réel)"},
  cfg:{what:"Agrège 5 facteurs : volatilité (25%), momentum (25%), réseaux sociaux (15%), dominance BTC (10%), Google Trends (10%).",why:"Les marchés crypto amplifient peur et FOMO. Cet indice quantifie ces extrêmes émotionnels pour les exploiter de manière contrariante.",how:"0-24 : peur extrême → accumulation. 25-49 : peur. 50-74 : cupidité. 75-100 : cupidité extrême → distribuer.",creator:"Alternative.me"},
  funding:{what:"Taux d'intérêt payé entre longs et courts sur les futures perpétuels, rééquilibré toutes les 8h.",why:"Mesure l'excès spéculatif en temps réel. Funding positif élevé = longs surpayent = risque de liquidations en cascade.",how:"> 0.05%/8h : excès de longs, prudence. 0-0.05% : neutre. Négatif : excès de shorts, compression possible.",creator:"BitMEX (pionnier, 2014)"},
  dxy:{what:"Mesure le dollar contre 6 devises majeures (EUR 57.6%, JPY 13.6%, GBP 11.9%, CAD 9.1%, SEK 4.2%, CHF 3.6%).",why:"Les matières premières sont libellées en dollars. Dollar fort → commodités plus chères pour les acheteurs étrangers → baisse demande.",how:"DXY en hausse : pression sur les matières premières. En baisse : soutien structurel. MM200 = frontière clé.",creator:"ICE Futures US"},
  yield_curve:{what:"Écart de rendement entre les obligations d'État américaines à 10 ans et à 3 mois (FRED, T10Y3M).",why:"Quand les taux courts dépassent les taux longs (courbe inversée), une récession a suivi dans presque tous les cas depuis les années 1960.",how:"Négatif : signal d'alerte de récession. Entre 0 et 0,5 : à surveiller. Au-dessus de 0,5 : pas de signal.",creator:"Fed de New York / FRED"},
  hy_spread:{what:"Prime de rendement exigée sur les obligations d'entreprises à haut risque par rapport aux emprunts d'État (ICE BofA, via FRED).",why:"Le marché du crédit anticipe souvent les difficultés des actions : l'écart s'élargit avant les corrections.",how:"Sous 4 % : appétit pour le risque. Au-delà de 5,5 % : stress de crédit, prudence.",creator:"ICE BofA / FRED"},
  fin_stress:{what:"Indice composite de 18 séries (taux, spreads, volatilité) mesurant le stress du système financier. 0 = niveau moyen.",why:"Résume en un chiffre la tension sur les marchés financiers.",how:"Négatif : conditions détendues. Au-dessus de 1,5 : stress élevé.",creator:"Fed de St. Louis"},
  sahm:{what:"Règle de récession : hausse de 0,5 pt du chômage moyen sur 3 mois par rapport à son plus bas des 12 derniers mois.",why:"Elle s'est déclenchée au début de chaque récession américaine depuis 1970.",how:"En dessous de 0,3 : pas de signal. Au-dessus de 0,5 : récession probablement engagée.",creator:"Claudia Sahm"},
  fed_liq:{what:"Variation du bilan de la Banque centrale américaine sur 3 mois (FRED, WALCL).",why:"Quand la Fed injecte de la liquidité, les actifs risqués et les matières premières en profitent généralement.",how:"Hausse : favorable. Baisse prolongée (resserrement quantitatif) : vent contraire.",creator:"Réserve fédérale"},
  breadth:{what:"Compare la performance du S&P 500 équipondéré (RSP) à celle du S&P 500 classique (SPY) sur 3 mois.",why:"Si l'indice monte grâce à quelques géants seulement, la hausse est fragile.",how:"RSP devant SPY : marché large et sain. RSP très en retard : concentration risquée.",creator:"Analyse de largeur de marché"},
  rotation:{what:"Compare la consommation cyclique (XLY) à la consommation défensive (XLP) sur 3 mois.",why:"Les investisseurs achètent le cyclique quand ils sont confiants et le défensif quand ils se protègent.",how:"XLY devant : appétit pour le risque. XLP devant : prudence.",creator:"Analyse sectorielle"},
  vix_term:{what:"Rapport entre le VIX (30 jours) et le VIX3M (3 mois).",why:"En temps normal la volatilité future est plus chère que l'actuelle. Un renversement trahit une panique immédiate.",how:"Sous 0,9 : calme. Au-dessus de 1,05 : stress aigu.",creator:"Cboe"},
  skew:{what:"Indice Cboe mesurant le coût des options de protection contre un krach (queue de distribution).",why:"Une demande forte de protection montre que les institutionnels craignent un choc.",how:"Au-dessus de 150 : couvertures massives. Sous 120 : peu de crainte. Signal faible à utiliser en complément.",creator:"Cboe"},
  mvrv_ratio:{what:"Capitalisation de Bitcoin divisée par sa valeur réalisée (coût moyen d'acquisition de tous les BTC), source Coin Metrics.",why:"Mesure le gain latent moyen des détenteurs : bas, ils ne vendent pas ; haut, ils prennent leurs profits.",how:"Sous 1 : zone d'accumulation historique. Au-dessus de 3 : euphorie, sommet probable.",creator:"Coin Metrics"},
  ls_ratio:{what:"Rapport entre comptes acheteurs et vendeurs à découvert sur les contrats perpétuels BTC d'OKX.",why:"Un positionnement trop unilatéral expose à des liquidations en cascade.",how:"Au-dessus de 2 : trop de longs, risque de chute. Sous 0,8 : trop de shorts, rebond possible.",creator:"OKX"},
  stablecoins:{what:"Variation sur 30 jours de l'offre totale de stablecoins (USDT, USDC…), source DefiLlama.",why:"Les stablecoins sont la poudre sèche du marché crypto : leur émission précède souvent les achats.",how:"Hausse : capitaux entrants, favorable. Baisse : sorties de capitaux.",creator:"DefiLlama"},
  infl_be:{what:"Inflation moyenne anticipée par le marché pour les 10 prochaines années, déduite des obligations indexées (FRED, T10YIE).",why:"L'or et les matières premières servent de protection quand l'inflation anticipée monte.",how:"Au-dessus de 2,6 % : favorable aux matières premières. Sous 1,8 % : peu de soutien.",creator:"Fed de St. Louis / FRED"},
  realrates:{what:"Taux nominaux MOINS l'inflation anticipée. Mesuré directement par les TIPS (obligations indexées inflation).",why:"L'or ne génère pas de revenus. Son coût d'opportunité dépend des taux réels. Taux réels négatifs = détenir de l'or est rationnel.",how:"< 0% : très favorable à l'or. 0-1% : neutre. > 2% : pression sur l'or. Chaque +1% de taux réels = -10-15% sur l'or.",creator:"Réserve Fédérale / FRED"},
  goldsil:{what:"Nombre d'onces d'argent pour acheter une once d'or. Fluctue entre ~40 et ~120 historiquement.",why:"Quand le ratio est élevé, l'argent est sous-évalué vs l'or et tend à surperformer lors du prochain cycle haussier.",how:"> 80 : argent bon marché, le favoriser. 60-80 : normal. < 60 : argent cher vs or. Moy. historique ~50-60.",creator:"Analyse historique des métaux"},
  gold_oil_ratio:{what:"Prix de l'or divisé par le prix du pétrole WTI. Indique combien de barils achète une once d'or.",why:"Indicateur macroéconomique : en expansion, le pétrole s'apprécie plus (ratio bas). En récession, l'or surperforme (ratio haut).",how:"< 15 : expansion, favorable aux actifs risqués. 15-30 : normal. > 30 : stress économique ou récession.",creator:"Analyse macroéconomique"},
  platpall:{what:"Compare Platine et Palladium, tous deux utilisés dans les convertisseurs catalytiques automobiles.",why:"Historiquement Pt > Pd. Depuis 2018 inversé (diesel→essence). La transition VE réduira les deux. Normalisations attendues.",how:"Ratio < 1 (Pt < Pd) : platine à décote historique, potentiel de rattrapage. > 1 : normalisation en cours.",creator:"London Platinum & Palladium Market"},

  /* ── ETFs boursiers ──────────────────────────────────────────── */
  rsi_cw8:  {what:"RSI 14 jours de l'ETF Amundi MSCI World (CW8), couvrant ~1600 grandes et moyennes capitalisations dans 23 pays développés.",why:"Le MSCI World représente l'essentiel de la capitalisation boursière mondiale développée. C'est le baromètre d'un portefeuille diversifié international.",how:"< 30 : marché mondial survendu, opportunité. > 70 : suracheté. La MM200 est le signal de tendance long terme le plus fiable pour ce type d'ETF.",creator:"Amundi / MSCI"},
  macd_cw8: {what:"MACD de l'ETF CW8 (Amundi MSCI World).",why:"Détecte les retournements de tendance sur les marchés développés mondiaux. Signal clé pour les investisseurs long terme.",how:"Positif : tendance haussière mondiale confirmée. Négatif : tendance baissière. À croiser avec la MM200.",creator:"Amundi / MSCI"},
  mm200_cw8:{what:"Position du CW8 par rapport à sa moyenne mobile 200 jours.",why:"La MM200 est le filtre de tendance long terme par excellence. Au-dessus = bull market. En dessous = bear market.",how:"Au-dessus : rester investi. En dessous : prudence, envisager de réduire l'exposition.",creator:"Analyse technique"},
  rsi_ese:  {what:"RSI 14 jours de l'ETF Amundi S&P 500 (ESE), répliquant les 500 plus grandes entreprises américaines.",why:"Le S&P 500 est l'indice le plus suivi au monde. Son RSI capte les excès du marché américain, dominant mondial.",how:"< 30 : marché US survendu. > 70 : suracheté. En tendance haussière forte, le RSI peut rester > 70 plusieurs mois.",creator:"Amundi / S&P Dow Jones Indices"},
  mm200_ese:{what:"Position de l'ESE (S&P 500 ETF) par rapport à sa MM200.",why:"La MM200 du S&P 500 est LA frontière surveillée par tous les gérants institutionnels. Franchissement = signal majeur.",how:"Au-dessus : bull market US intact. En dessous avec pente descendante : bear market → prudence importante.",creator:"Analyse technique"},
  rsi_paeem:{what:"RSI 14 jours de l'ETF Amundi MSCI Emerging Markets (PAEEM), couvrant 24 marchés émergents.",why:"Les marchés émergents offrent une croissance supérieure mais avec plus de volatilité. Un RSI bas peut offrir des opportunités.",how:"< 30 : marchés émergents survendus, potentiel intéressant. > 70 : suracheté. Très sensible au dollar (DXY) et aux taux.",creator:"Amundi / MSCI"},
  mm200_paeem:{what:"Position du PAEEM par rapport à sa MM200.",why:"Les émergents sous leur MM200 sont souvent pénalisés par un dollar fort ou des flux sortants. Signal de tendance essentiel.",how:"Au-dessus : dynamique positive sur les émergents. En dessous : flux sortants, dollar fort → réduire l'exposition.",creator:"Analyse technique"},
  rsi_paasi:{what:"RSI 14 jours de l'ETF Amundi MSCI Asia Pacific ex Japan (PAASI).",why:"L'Asie (Chine, Inde, Corée, Taïwan...) représente le moteur de croissance mondial de demain. Forte pondération technologie.",how:"< 30 : Asie survendue, potentiel de rebond. > 70 : suracheté. Très sensible aux tensions géopolitiques et au cycle Chine.",creator:"Amundi / MSCI"},
  mm200_paasi:{what:"Position du PAASI (Asie Pac. ex-Japon) par rapport à sa MM200.",why:"Filtre de tendance long terme sur les marchés asiatiques. Déterminant pour les décisions d'allocation géographique.",how:"Au-dessus : dynamique asiatique positive. En dessous : ralentissement ou risques régionaux → prudence.",creator:"Analyse technique"},

  /* ── Altcoins ────────────────────────────────────────────────── */
  rsi_eth:{what:"RSI 14 jours d'Ethereum (ETH-USD), la deuxième plus grande cryptomonnaie.",why:"Ethereum est la plateforme de smart contracts dominante (DeFi, NFT, Layer 2). Son RSI détecte les excès spéculatifs sur cet actif à forte volatilité.",how:"< 30 : ETH survendu, opportunité. > 70 : suracheté. Les cycles d'ETH sont corrélés à BTC mais amplifiés.",creator:"Analyse technique / CoinGecko"},
  vs_btc_eth:{what:"Performance relative d'Ethereum vs Bitcoin sur 90 jours.",why:"Mesure si ETH surperforme ou sous-performe BTC. Quand ETH surperforme, c'est souvent le signal d'une phase 'altseason'.",how:"Positif (ETH > BTC) : rotation vers les altcoins en cours. Négatif : BTC dominant, altcoins en retrait.",creator:"Analyse de marché"},
  sol_tvl:{what:"Variation sur 30 jours de la valeur déposée dans les applications DeFi de Solana (TVL).",why:"Le capital qui entre dans un écosystème précède souvent l'intérêt du marché pour son token ; son départ signale un désintérêt.",how:"> +10 % : l'écosystème attire (haussier). < −10 % : fuite de capitaux. Attention : la TVL est aussi gonflée par le prix du token lui-même.",creator:"DefiLlama"},
  sol_dex:{what:"Volume d'échange sur les plateformes décentralisées Solana : moyenne des 7 derniers jours comparée aux 30 jours précédents.",why:"Le volume mesure l'activité réelle et la spéculation. Il confirme (ou contredit) un mouvement de prix.",how:"> +20 % : activité en hausse. < −30 % : intérêt qui retombe. Un volume explosif après une longue hausse peut aussi marquer un sommet : à lire avec le RSI.",creator:"DefiLlama"},
  sol_stable:{what:"Variation sur 30 jours des stablecoins (dollars numériques) présents sur Solana.",why:"Les stablecoins sont la « poudre sèche » : leur arrivée finance les achats futurs, leur départ prive le marché de liquidité.",how:"> +3 % : liquidité fraîche. < −2 % : liquidité qui part.",creator:"DefiLlama"},
  sol_funding:{what:"Taux de financement moyen sur 7 jours des contrats perpétuels SOL d'Hyperliquid, annualisé.",why:"Quand tout le monde est long avec du levier, il paie les vendeurs : un funding très élevé précède souvent des purges (liquidations en cascade). Un funding négatif indique un pessimisme extrême.",how:"≈ +11 % : neutre. > +60 % : longs surchargés, prudence. < −5 % : vendeurs surchargés, rebond possible. Indicateur contrariant.",creator:"Hyperliquid"},
  hype_rev:{what:"Revenus du protocole Hyperliquid sur 30 jours, comparés aux 30 jours précédents.",why:"Hyperliquid reverse la quasi-totalité de ses revenus au rachat de HYPE : revenus en hausse = pression d'achat structurelle sur le token.",how:"> +15 % : rachats en hausse (haussier). < −25 % : rachats en baisse. Les revenus suivent l'activité de trading, donc la volatilité du marché.",creator:"DefiLlama"},
  hype_tvl:{what:"Variation sur 30 jours des capitaux déposés sur Hyperliquid (TVL).",why:"Mesure la confiance des traders dans la plateforme : plus de dépôts = plus de capacité de trading et donc de revenus.",how:"> +10 % : afflux de capitaux. < −10 % : retraits. Sensible au prix du HYPE lui-même.",creator:"DefiLlama"},
  hype_funding:{what:"Taux de financement moyen sur 7 jours des contrats perpétuels HYPE d'Hyperliquid, annualisé.",why:"HYPE est le token de la plateforme de perpétuels : son propre positionnement à levier est un thermomètre de la spéculation.",how:"≈ +11 % : neutre. > +60 % : euphorie à levier, risque de purge. < −5 % : pessimisme extrême. Indicateur contrariant.",creator:"Hyperliquid"},
  mm200_hype:{what:"Position du cours de HYPE par rapport à sa moyenne mobile 200 jours.",why:"Filtre de tendance de long terme : au-dessus, tendance haussière installée.",how:"Au-dessus : haussier. En dessous : baissier. Nécessite 200 jours d'historique.",creator:"Analyse technique"},
  rsi_sol:{what:"RSI 14 jours de Solana (SOL-USD), blockchain haute performance.",why:"Solana est une des blockchains à la croissance la plus rapide. Très volatile, son RSI identifie les points extrêmes de spéculation.",how:"< 30 : SOL survendu. > 70 : suracheté. SOL est très corrélé à BTC/ETH mais amplifie fortement les mouvements.",creator:"Analyse technique / CoinGecko"},
  vs_btc_sol:{what:"Performance relative de Solana vs Bitcoin sur 90 jours.",why:"Indicateur de force relative. SOL surperformant BTC = marché risk-on, appétit pour les altcoins à fort bêta.",how:"Fortement positif : SOL en phase spéculative. Négatif : rotation vers BTC (risk-off crypto).",creator:"Analyse de marché"},
  rsi_hype:{what:"RSI 14 jours de Hyperliquid (HYPE), token du DEX perpétuel le plus utilisé.",why:"HYPE est lié à l'écosystème DeFi et aux volumes de trading décentralisé. Token récent (2024) à très forte volatilité.",how:"< 30 : survendu, potentiel rebond. > 70 : suracheté. Données limitées (token < 1 an) → interprétation avec prudence.",creator:"Analyse technique / CoinGecko"},
  vs_btc_hype:{what:"Performance relative de HYPE vs Bitcoin sur 90 jours.",why:"Mesure si le secteur DeFi/DEX surperforme BTC. Signal d'intérêt pour les actifs DeFi spéculatifs.",how:"Très positif : intérêt fort pour les DEX et DeFi. Négatif : rotation vers des actifs plus sûrs.",creator:"Analyse de marché"},

  /* ── Uranium & énergie ───────────────────────────────────────── */
  rsi_ura:{what:"RSI 14 jours du URA ETF (Global X Uranium ETF), panier de sociétés liées à l'uranium.",why:"L'uranium est en déficit structurel d'offre. Le RSI de l'ETF capte les excès de spéculation sur ce secteur de niche à fort potentiel.",how:"< 30 : secteur uranium survendu. > 70 : suracheté après une hausse. La tendance long terme reste haussière (demande nucléaire).",creator:"Global X / Analyse technique"},
  rsi_urnm:{what:"RSI 14 jours du URNM (Sprott Uranium Miners ETF), le plus pur proxy des mineurs d'uranium.",why:"URNM est concentré sur les producteurs purs (Cameco, Kazatomprom) contrairement à URA plus diversifié. Signal direct sur le secteur.",how:"< 30 : mineurs uranium survendus, opportunité. > 70 : excès spéculatif. Plus volatil que URA.",creator:"Sprott Asset Management"},
  rsi_ccj:{what:"RSI 14 jours de Cameco Corp (CCJ), le plus grand producteur d'uranium occidental.",why:"Cameco est le baromètre du secteur uranium. Contrôle ~15% de la production mondiale. Son RSI reflète la santé du secteur.",how:"< 30 : Cameco survendu, opportunité d'entrée sur le leader du secteur. > 70 : excès spéculatif.",creator:"Analyse technique / yfinance"},
  rsi_wti:{what:"RSI 14 jours du pétrole WTI (West Texas Intermediate), référence américaine du pétrole brut.",why:"Le pétrole est le commodity le plus influent sur l'économie mondiale. Son RSI capte les déséquilibres offre/demande à court terme.",how:"< 30 : pétrole survendu (souvent lié à une récession ou excès d'offre). > 70 : suracheté (tensions géopolitiques, OPEC).",creator:"NYMEX / CME Group"},
  mm200_wti:{what:"Position du WTI par rapport à sa moyenne mobile 200 jours.",why:"La MM200 du pétrole sépare les régimes haussiers (favorable à l'inflation) des régimes baissiers (désinflation).",how:"Au-dessus : tendance haussière, favorable aux actifs réels. En dessous : pression déflationniste.",creator:"Analyse technique"},
  rsi_brent:{what:"RSI 14 jours du pétrole Brent, référence internationale du brut.",why:"Le Brent est la référence de 2/3 des échanges mondiaux de pétrole. Différentiel avec WTI reflète les dynamiques géopolitiques.",how:"< 30 : survendu. > 70 : suracheté. À surveiller avec le DXY et les décisions OPEC+.",creator:"ICE Futures Europe"},
  rsi_ng:{what:"RSI 14 jours du Gaz Naturel (Natural Gas Futures, NG=F).",why:"Le gaz est extrêmement volatil — le RSI est particulièrement utile pour identifier les excès sur ce marché saisonnier.",how:"< 30 : gaz survendu (souvent en été). > 70 : suracheté (hiver, tensions géopolitiques). Saisonnalité forte.",creator:"NYMEX / CME Group"},

  /* ── Métaux industriels ──────────────────────────────────────── */
  rsi_copper:{what:"RSI 14 jours du cuivre (HG=F), le métal le plus utilisé dans la transition énergétique.",why:"Le cuivre est le 'Dr. Copper' — son prix prédit l'activité économique mondiale. Un RSI bas peut offrir une entrée sur ce métal structurellement demandé.",how:"< 30 : cuivre survendu, opportunité. > 70 : suracheté. Demande structurelle par EVs, IA, réseaux électriques.",creator:"CME Group / LME"},
  mm200_copper:{what:"Position du cuivre par rapport à sa MM200.",why:"La MM200 du cuivre est un baromètre de la croissance mondiale. Au-dessus = expansion économique. En dessous = ralentissement.",how:"Au-dessus : croissance mondiale confirmée, favorable aux actifs risqués. En dessous : signal de ralentissement.",creator:"Analyse technique"},
  rsi_gold:{what:"RSI 14 jours de l'or (GC=F, Gold Futures).",why:"L'or est la valeur refuge ultime. Son RSI identifie les moments où la peur ou la cupidité ont poussé le prix à un extrême.",how:"< 30 : or survendu, accumulation opportune. > 70 : or suracheté à court terme, mais tendance haussière peut continuer si contexte macro favorable.",creator:"COMEX / CME Group"},
  perf1y_gold:{what:"Performance de l'or sur les 12 derniers mois.",why:"La performance annuelle de l'or reflète le contexte macro global : inflation, géopolitique, confiance dans les banques centrales.",how:"> +15% : tendance haussière forte. 0-15% : appréciation modérée. Négatif : or sous pression (taux réels élevés ou dollar fort).",creator:"COMEX / CME Group"},
};
