# MarketSense 📊

> Tableau de bord d'aide à l'investissement, inspiré de Finary.
> Données live via backend Python + APIs gratuites · Thème sombre/clair.

---

## Architecture

```
GitHub Pages (frontend)       Railway / Render (backend Python)
      │                                  │
      │  index.html + style.css + app.js │  FastAPI + yfinance + FRED
      │                                  │
      └──────── appelle ─────────────────┘
                /api/indicators
```

---

## Étape 1 — Frontend (GitHub Pages)

1. Créer un repo GitHub (ex. `marketsense`)
2. Uploader `index.html`, `style.css`, `app.js`
3. `Settings → Pages → Deploy from branch → main → Save`
4. Site live sur `https://[username].github.io/marketsense/`

---

## Étape 2 — Backend (Railway, gratuit)

### Option A — Via GitHub

1. Pusher le dossier `backend/` dans votre repo
2. Sur Railway : `New Project → Deploy from GitHub repo`
3. Si backend dans un sous-dossier : `Settings → Source → Root Directory → backend`
4. Copier l'URL générée (ex. `https://marketsense-xxx.up.railway.app`)

### Option B — Railway CLI

```bash
cd backend
npm install -g @railway/cli
railway login && railway init && railway up
```

### Variables d'environnement (optionnelles)

| Variable | Utilité | Obtenir |
|---|---|---|
| `FRED_API_KEY` | CPI + taux réels live | [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html) (gratuit) |

### Vérifier

`https://votre-app.railway.app/` doit afficher `{"status": "ok", ...}`

---

## Étape 3 — Connecter frontend ↔ backend

Dans l'app → ⚙ → coller l'URL Railway → **Enregistrer**.

---

## Ce qui devient live avec le backend

- RSI, MACD, MM50, MM200, Golden Cross, Bollinger, ATR (S&P 500)
- VIX, Shiller CAPE (scrape multpl.com)
- Taux réels TIPS 10y, Inflation CPI (FRED)
- DXY, Or, Argent, Platine, Palladium, Cuivre (yfinance)
- Uranium ETF (URA comme proxy)

## Toujours live sans backend

- Crypto Fear & Greed (Alternative.me)
- BTC Dominance, RSI BTC, MACD BTC, Pi Cycle Top (CoinGecko)
- Hash Rate BTC (Blockchain.info)

---

## Structure

```
marketsense/
├── index.html
├── style.css
├── app.js
├── README.md
└── backend/
    ├── main.py         ← FastAPI + cache 1h
    ├── indicators.py   ← Toute la logique de données
    ├── requirements.txt
    ├── Procfile
    └── railway.toml
```

## Licence

MIT
