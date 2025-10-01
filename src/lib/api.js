// src/lib/api.js
export async function fetchJSON(url, opts = {}) {
  const started = Date.now();
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
    body: opts.body && typeof opts.body !== 'string' ? JSON.stringify(opts.body) : opts.body,
  }).catch(err => {
    const e = new Error(`NETWORK FAIL ${opts.method || 'GET'} ${url}: ${err?.message || err}`);
    e.cause = err;
    throw e;
  });

  const text = await res.text();
  const ct = res.headers.get('content-type') || '';
  const took = Date.now() - started;

  if (!res.ok) {
    const snippet = text.slice(0, 2000);
    throw new Error(
      `HTTP ${res.status} ${res.statusText} ${opts.method || 'GET'} ${url} (${took}ms)\n` +
      `Headers: ${JSON.stringify(Object.fromEntries(res.headers.entries()))}\n` +
      `Body: ${snippet}`
    );
  }

  return ct.includes('application/json') ? (text ? JSON.parse(text) : null) : text;
}

