const http = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 3000;
const INDEX_FILE = path.join(__dirname, 'index.html');

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(payload));
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, 'http://localhost');
  if (requestUrl.pathname === '/healthz' && request.method === 'GET') {
    return sendJson(response, 200, { ok: true });
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    return sendJson(response, 405, { error: 'Method not allowed.' });
  }
  if (requestUrl.pathname !== '/' && requestUrl.pathname !== '/index.html') {
    return sendJson(response, 404, { error: 'Page not found.' });
  }

  try {
    const html = await readFile(INDEX_FILE);
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' https://images.unsplash.com data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    });
    response.end(request.method === 'HEAD' ? undefined : html);
  } catch {
    return sendJson(response, 500, { error: 'The website file could not be loaded.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('SpeakUp Research is running on port ' + PORT + '.');
});

