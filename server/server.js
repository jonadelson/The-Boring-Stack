/* The Boring Stack's server — phase 3 begins.
 *
 * Zero dependencies: node:http and node:fs are the whole stack. For now it
 * does one job — serve the site's files, exactly as GitHub Pages has been
 * doing — so we can see precisely what a static host is before we teach
 * the server tricks a static host can't do.
 *
 * Run:  node server/server.js   →   http://localhost:3000
 *
 * Lesson 15 walks through this file.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

/* The site root is the repository root, one directory up from this file. */
const SITE_ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const PORT = process.env.PORT ?? 3000;

/* The server must tell the browser what each file IS — lesson 5's
 * Content-Type header, now written from the other side of the wire. */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  let path = decodeURIComponent(url.pathname);
  if (path.endsWith('/')) path += 'index.html';

  /* The first rule of being on a network: requests are not your friends.
   * A path like /../../etc/passwd would resolve outside the site root and
   * read arbitrary files off the machine — the classic "directory
   * traversal" attack, older than the web. Resolve first, then refuse
   * anything that escapes. */
  const file = normalize(join(SITE_ROOT, path));
  if (!file.startsWith(SITE_ROOT + '/')) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('403 Forbidden\n');
    log(request, response, path);
    return;
  }

  try {
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><meta charset="utf-8"><h1>404</h1><p>No such page. <a href="/">Home</a>.</p>\n');
  }
  log(request, response, path);
});

/* One line per request: the humble access log, ancestor of all
 * observability. Phase 5 takes logging seriously; this is its seed. */
function log(request, response, path) {
  console.log(`${new Date().toISOString()} ${response.statusCode} ${request.method} ${path}`);
}

server.listen(PORT, () => {
  console.log(`The Boring Stack, served by itself: http://localhost:${PORT}`);
});
