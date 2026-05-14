# HolDent — Convenzione Dipendenti PA

Landing page statica con widget recensioni Google integrato via serverless function.

## Struttura

```
.
├── index.html              # Landing page (statica)
├── api/
│   └── reviews.js          # Serverless function — proxy verso Google Places
├── package.json
├── vercel.json
├── .env.example            # Template variabili d'ambiente
└── .gitignore
```

## Setup su Vercel

### 1. Push del repo su GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:tuo-user/holdent-pa.git
git push -u origin main
```

### 2. Importa il progetto su Vercel

- Vai su https://vercel.com/new
- Seleziona il repo GitHub
- Framework Preset: **Other** (Vercel rileva automaticamente la cartella `api/`)
- Build Command: lascia vuoto
- Output Directory: lascia vuoto (root)
- Clicca **Deploy**

### 3. Configura le variabili d'ambiente

Su Vercel → Settings → Environment Variables, aggiungi:

| Nome | Valore |
|---|---|
| `GOOGLE_PLACES_API_KEY` | La chiave Google Cloud |
| `GOOGLE_PLACE_ID_GEMINI` | Place ID di Clinica Gemini Brescia |
| `GOOGLE_PLACE_ID_PENTAGON` | Place ID di Clinica Pentagon Corte Franca |

Applica le env a Production, Preview, Development. Poi vai su **Deployments** e fai un redeploy per applicarle.

## Come ottenere chiave e Place ID

### Chiave Google Places API

1. Vai su https://console.cloud.google.com
2. Crea un progetto (es. "holdent-reviews")
3. Abilita **Places API** (non "Places API (New)" — usa la versione classica, compatibile con questo codice)
4. APIs & Services → Credentials → Create Credentials → API Key
5. Restringi la chiave: limita per HTTP referrer su `*.vercel.app/*` e sul dominio finale

### Place ID delle cliniche

Lancia da terminale (sostituisci `LA_TUA_KEY`):

```bash
curl "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Clinica%20Dentale%20Gemini%20Brescia&inputtype=textquery&fields=place_id,name,formatted_address&key=LA_TUA_KEY"

curl "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Clinica%20Dentale%20Pentagon%20Corte%20Franca&inputtype=textquery&fields=place_id,name,formatted_address&key=LA_TUA_KEY"
```

Copia il valore di `place_id` dalla risposta JSON.

## Test in locale

```bash
npm install -g vercel
vercel dev
```

Crea un file `.env.local` con le tre variabili (copia da `.env.example`).

## Note tecniche

- **Cache 24h**: l'endpoint `/api/reviews` cacha le risposte 24 ore (CDN + in-memory). Le quote Google Places sono protette.
- **Massimo 5 recensioni**: la Places API classica restituisce fino a 5 recensioni. Per averne di più serve la nuova Places API (New) con endpoint diversi — al momento il widget mostra le 5 più recenti.
- **Costo**: la Place Details API costa ~$17 per 1000 chiamate. Con cache 24h, anche con 10.000 visite/giorno fai 2 chiamate Google al giorno (una per clinica). Praticamente gratis dentro il free tier.

## Aggiornare i contenuti

I copy della landing sono direttamente in `index.html`. Modifica → commit → push: Vercel redeploya automaticamente.
