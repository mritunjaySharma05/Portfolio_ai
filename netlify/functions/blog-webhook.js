// Receives Hashnode's webhook the moment a post is published/updated/
// deleted, and stores a small normalized list in Netlify Blobs. The
// portfolio reads from that list (see blog-feed.js) instead of ever
// fetching Hashnode directly — Hashnode's Cloudflare protection blocks
// all server-side/automated requests to the blog itself, so pushing
// data to us on publish is the only reliable way to keep this live.
//
// Setup (see README notes / conversation): create a webhook in your
// Hashnode publication's dashboard pointing at this function's URL,
// selecting Post Published / Post Updated / Post Deleted, then put the
// generated secret in Netlify's env vars as HASHNODE_WEBHOOK_SECRET.

const { createHmac, timingSafeEqual } = require('crypto');
const { getStore } = require('@netlify/blobs');

const MAX_POSTS = 10;
const SIGNATURE_MAX_AGE_SECONDS = 300;
const PUBLICATION_HOST = 'mritunjaysharma05.hashnode.dev';

function slugify(title) {
  return (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function verifySignature(header, rawBody, secret) {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(',').map(p => p.split('='))
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (ageSeconds > SIGNATURE_MAX_AGE_SECONDS) return false;

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return false;
  }
  const signedString = `${timestamp}.${JSON.stringify(payload)}`;
  const expected = createHmac('sha256', secret).update(signedString).digest('hex');

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const secret = process.env.HASHNODE_WEBHOOK_SECRET;
  if (!secret) {
    return { statusCode: 500, body: 'HASHNODE_WEBHOOK_SECRET is not configured' };
  }

  const signatureHeader = event.headers['x-hashnode-signature'] || event.headers['X-Hashnode-Signature'];
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : (event.body || '');

  if (!verifySignature(signatureHeader, rawBody, secret)) {
    return { statusCode: 401, body: 'Invalid signature' };
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { eventType, post } = payload;
  if (!post || !post.id) {
    return { statusCode: 400, body: 'Missing post data' };
  }

  const store = getStore('blog');
  const existing = (await store.get('posts', { type: 'json' })) || [];
  const withoutThisPost = existing.filter(p => p.id !== post.id);

  if (eventType === 'post_deleted') {
    await store.setJSON('posts', withoutThisPost);
    return { statusCode: 200, body: 'Removed' };
  }

  const normalized = {
    id: post.id,
    title: post.title || '',
    excerpt: post.brief || post.subtitle || '',
    url: `https://${PUBLICATION_HOST}/${slugify(post.title)}`,
    publishedAt: post.publishedAt || post.updatedAt || new Date().toISOString(),
  };

  const updated = [normalized, ...withoutThisPost]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, MAX_POSTS);

  await store.setJSON('posts', updated);

  return { statusCode: 200, body: 'OK' };
};
