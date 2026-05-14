// api/reviews.js
// Vercel Serverless Function — proxy verso Google Places API
// Tiene la GOOGLE_PLACES_API_KEY lato server (non esposta nel browser).

const PLACE_IDS = {
  gemini: process.env.GOOGLE_PLACE_ID_GEMINI,
  pentagon: process.env.GOOGLE_PLACE_ID_PENTAGON,
};

// Cache in-memory per istanza serverless (sopravvive tra invocazioni warm).
// Per cache più robusta usiamo anche l'header Cache-Control verso il CDN Vercel.
const memCache = new Map();
const CACHE_TTL_MS = 86400 * 1000; // 24h

export default async function handler(req, res) {
  const clinic = String(req.query.clinic || 'gemini').toLowerCase();
  const placeId = PLACE_IDS[clinic];

  if (!placeId) {
    return res.status(400).json({
      error: 'invalid_clinic',
      message: 'Clinic must be one of: ' + Object.keys(PLACE_IDS).join(', '),
    });
  }

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return res.status(500).json({
      error: 'missing_api_key',
      message: 'GOOGLE_PLACES_API_KEY non configurata nelle env vars Vercel.',
    });
  }

  // Check in-memory cache
  const cached = memCache.get(clinic);
  if (cached && Date.now() < cached.expires) {
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200');
    return res.status(200).json(cached.data);
  }

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
      return res.status(500).json({
        error: data.status,
        message: data.error_message || 'Google Places API error',
      });
    }

    const payload = {
      name: data.result.name,
      rating: data.result.rating,
      total: data.result.user_ratings_total,
      url: data.result.url,
      place_id: placeId,
      // Deep link al form di scrittura recensione su Google
      write_review_url: 'https://search.google.com/local/writereview?placeid=' + placeId,
      // Deep link alla lista completa recensioni
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

    // CDN cache: 24h fresh + 12h stale-while-revalidate
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
