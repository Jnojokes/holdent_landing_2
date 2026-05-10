# HolDent × Questura di Brescia — Landing Page

Landing page statica per la convenzione tra **HolDent** e la **Questura di Brescia**, dedicata ai dipendenti della Polizia di Stato e ai loro familiari.

- **Partnership ID:** QUESBRES2026
- **Tracking code:** QUEST2026
- **Versione:** WhatsApp/Phone only (NO FORM)

## Struttura

```
.
├── index.html          # Pagina principale
├── assets/             # Loghi e immagini
│   ├── holdent-logo.png
│   ├── stemma-polizia-stato.png
│   └── whatsapp-logo.png
└── README.md
```

## Tecnologie

Pagina statica HTML/CSS/JS — nessun build step richiesto.

- **Tailwind CSS** via CDN
- **Google Fonts:** Inter, Plus Jakarta Sans
- **Material Symbols Outlined**
- **Schema.org** (JSON-LD) per SEO
- **JavaScript vanilla** per FAQ accordion, smooth scroll e sticky WhatsApp button

## Come pubblicare

### Opzione 1 — GitHub Pages

1. Crea un nuovo repository su GitHub (es. `holdent-landing-questura`).
2. Carica i file di questo zip nella root del repo.
3. Vai in **Settings → Pages**.
4. Sotto **Source**, seleziona il branch `main` e cartella `/ (root)`.
5. Salva. La pagina sarà disponibile su `https://<username>.github.io/holdent-landing-questura/`.

### Opzione 2 — Netlify / Vercel / Cloudflare Pages

Trascina la cartella o collega il repo: nessuna configurazione richiesta (è statica).

### Opzione 3 — Locale

Apri direttamente `index.html` nel browser oppure servi la cartella con un server statico:

```bash
python3 -m http.server 8000
# Oppure
npx serve .
```

## TODO operativi prima del go-live

I seguenti placeholder devono essere sostituiti con dati reali (vedi commento finale in `index.html`):

1. **Numeri di telefono** — utility bar, hero CTA, footer cliniche, sticky WhatsApp.
2. **Logo Questura** — approvazione formale uso logo Polizia di Stato.
3. **Direttore sanitario** — inserire nome nel footer L.145.
4. **GA4** — sostituire `GA4_ID` ed eventi tracciati.
5. **SEO** — canonical URL, redirect 301, sitemap.xml.
6. **Asset opzionali** — foto cliniche se disponibili.
7. **Test pre-launch** — responsive, Lighthouse, Schema.org validation.

## Cliniche

- **Clinica Gemini** — Via Conicchio 19, 25136 Brescia (BS)
- **Clinica Pentagon** — Via Roma 78, 25040 Corte Franca (BS)
