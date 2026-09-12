// Serves the blog post list the portfolio displays. Reads from Netlify
// Blobs, populated by blog-webhook.js whenever Hashnode notifies us of
// a publish/update/delete — we don't fetch Hashnode directly here.
//
// (Previously this function fetched https://mritunjaysharma05.hashnode.dev
// /rss.xml server-side, but Hashnode's Cloudflare protection now blocks
// every automated request to the blog with a bot-challenge page, so that
// approach stopped working entirely. Blobs + webhook sidesteps it.)

const { getStore } = require('@netlify/blobs');

exports.handler = async function () {
  try {
    const store = getStore('blog');
    const posts = (await store.get('posts', { type: 'json' })) || [];
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({ posts }),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ posts: [] }) };
  }
};
