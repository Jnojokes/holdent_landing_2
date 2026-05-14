// api/reviews.js
// Vercel Serverless Function — proxy verso Google Places API
// Tiene la GOOGLE_PLACES_API_KEY lato server (non esposta nel browser).

const VALID_CLINICS = ['gemini', 'pentagon'];

const memCache = new Map();
const CACHE_TTL_MS = 86400 * 1000; // 24h

export default async function handler(req, res) {
  const clinic = String(req.query.clinic || 'gemini').toLowerCase().trim();

  // 1) Validazione parametro clinic
  if (!VALID_CLINICS.includes(clinic)) {
    return res.status(400).json({
      error: 'invalid_clinic',
      message: 'Parametro clinic non valido. Usa: ' + VALID_CLINICS.join(', '),
      received: clinic,
    });
  }

  // 2) Verifica chiave API configurata
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return res.status(500).json({
      error: 'missing_api_key',
      message: 'GOOGLE_PLACES_API_KEY non configurata. Aggiungila in Vercel -> Settings -> Environment Variables e fai redeploy.',
    });
  }

  // 3) Verifica place_id configurato per la clinica richiesta
  const envVarName = 'GOOGLE_PLACE_ID_' + clinic.toUpperCase();
  const placeId = process.env[envVarName];

  if (!placeId) {
    return res.status(500).json({
      error: 'missing_place_id',
      message: 'Env var ' + envVarName + ' non configurata o vuota. Aggiungila in Vercel -> Settings -> Environment Variables e fai redeploy.',
      missing_env: envVarName,
    });
  }

  // 4) Check cache in-memory
  const cached = memCache.get(clinic);
  if (cached && Date.now() < cached.expires) {
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200');
    return res.status(200).json(cached.data);
  }

  // 5) Chiamata a Google Places API
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'name,rating,user_ratings_total,reviews,url');
    url.searchParams.set('language', 'it');
    url.searchParams.set('reviews_sort', 'newest');
    url.searchParams.set('key', process.env.GOOGLE_PLACES_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(502).json({
        error: 'google_api_error',
        google_status: data.status,
        message: data.error_message || ('Google Places ha risposto con status: ' + data.status),
        hint: data.status === 'REQUEST_DENIED'
          ? 'Verifica che la GOOGLE_PLACES_API_KEY sia valida e che la "Places API" sia abilitata nel progetto Google Cloud.'
          : data.status === 'INVALID_REQUEST'
          ? 'Probabilmente il place_id non e valido.'
          : data.status === 'NOT_FOUND'
          ? 'Il place_id non corrisponde a nessun posto su Google.'
          : undefined,
      });
    }

    const payload = {
      name: data.result.name,
      rating: data.result.rating,
      total: data.result.user_ratings_total,
      url: data.result.url,
      place_id: placeId,
      write_review_url: 'https://search.google.com/local/writereview?placeid=' + placeId,
      all_reviews_url: 'https://search.google.com/local/reviews?placeid=' + placeId,
      reviews: (data.result.reviews || []).map((r) => ({
        author_name: r.author_name,
        profile_photo_url: r.profile_photo_url,
        rating: r.rating,
        relative_time_description: r.relative_time_description,
        text: r.text,
        time: r.time,
      })),
    };

    memCache.set(clinic, { data: payload, expires: Date.now() + CACHE_TTL_MS });

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200');
    return res.status(200).json(payload);
  } catch (err) {
    console.error('Reviews fetch failed:', err);
    return res.status(500).json({
      error: 'fetch_failed',
      message: err.message,
    });
  }
}
