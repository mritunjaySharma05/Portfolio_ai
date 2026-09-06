// Fetches the Hashnode RSS feed server-side and passes it straight through.
// Runs same-origin with the site, so the browser needs no CORS proxy, and we
// control the cache window ourselves (short, so new posts show up fast)
// instead of relying on a third-party proxy's own caching policy.

const RSS_URL = 'https://mritunjaysharma05.hashnode.dev/rss.xml';

exports.handler = async function () {
  try {
    const res = await fetch(RSS_URL);
    if (!res.ok) {
      return { statusCode: 502, body: 'Upstream feed error' };
    }
    const body = await res.text();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=120, s-maxage=120',
      },
      body,
    };
  } catch (err) {
    return { statusCode: 502, body: 'Fetch failed' };
  }
};
