const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const API_SHARED_SECRET = process.env.API_SHARED_SECRET || '';
const MAX_CODE_BYTES = 2 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_CODE_BYTES + 1024;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_CREATES_PER_WINDOW = 100;
const MAX_READS_PER_WINDOW = 300;

fs.mkdirSync(DATA_DIR, { recursive: true });

const rateLimits = new Map();

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    return (forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress) || '?';
}

function allowRequest(ip, kind) {
    const now = Date.now();
    const key = `${kind}:${ip}`;
    const current = rateLimits.get(key);
    const max = kind === 'create' ? MAX_CREATES_PER_WINDOW : MAX_READS_PER_WINDOW;

    if (!current || now - current.startedAt >= WINDOW_MS) {
        rateLimits.set(key, { startedAt: now, count: 1 });
        return { allowed: true };
    }

    current.count += 1;
    if (current.count > max) {
        return {
            allowed: false,
            retryAfter: Math.ceil((WINDOW_MS - (now - current.startedAt)) / 1000),
        };
    }

    return { allowed: true };
}

setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimits) {
        if (now - entry.startedAt >= WINDOW_MS) rateLimits.delete(key);
    }
}, 5 * 60 * 1000).unref();

function getPublicBaseUrl(req) {
    const configured = process.env.API_PUBLIC_URL || process.env.PUBLIC_URL;
    if (configured) return configured.replace(/\/+$/, '');

    const forwardedHost = req.headers['x-forwarded-host'];
    const host = forwardedHost || req.headers.host;
    const forwardedProto = req.headers['x-forwarded-proto'];
    const protocol = forwardedProto || 'https';
    return host ? `${protocol}://${host}` : `http://localhost:${PORT}`;
}

function isBrowser(req) {
    const userAgent = String(req.headers['user-agent'] || '').toLowerCase();
    return (
        userAgent.includes('mozilla') &&
        ['chrome/', 'firefox/', 'safari/', 'edg/', 'opr/', 'trident/']
            .some((browser) => userAgent.includes(browser))
    );
}

function blockedPage() {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Blocked</title>
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;
    background:#171717;color:#eee;font-family:Inter,Arial,sans-serif}.card{width:min(420px,90vw);
    padding:42px 36px;text-align:center;background:#242424;border:1px solid #393939;
    border-radius:16px;box-shadow:0 18px 60px #0008}h1{margin:0 0 12px;font-size:22px;
    letter-spacing:.08em}p{margin:0;color:#999;line-height:1.6;font-size:14px}
  </style>
</head>
<body><main class="card"><h1>YOU ARE BLOCKED</h1>
<p>Access to this resource is restricted.<br>This content is not available in your browser.</p>
</main></body></html>`;
}

function sendJson(res, status, body) {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
        'Cache-Control': 'no-store',
    });
    res.end(payload);
}

function sendText(res, status, body, contentType = 'text/plain; charset=utf-8') {
    res.writeHead(status, {
        'Content-Type': contentType,
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-store',
    });
    res.end(body);
}

function authorized(req) {
    if (!API_SHARED_SECRET) return true;
    const authorization = String(req.headers.authorization || '');
    const expected = `Bearer ${API_SHARED_SECRET}`;
    const received = Buffer.from(authorization);
    const target = Buffer.from(expected);
    return received.length === target.length &&
        crypto.timingSafeEqual(received, target);
}

function readJson(req) {
    return new Promise((resolve, reject) => {
        let total = 0;
        const chunks = [];

        req.on('data', (chunk) => {
            total += chunk.length;
            if (total > MAX_REQUEST_BYTES) {
                reject(new Error('Request body is too large.'));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
            } catch {
                reject(new Error('Request body must be valid JSON.'));
            }
        });
        req.on('error', reject);
    });
}

function validId(id) {
    return /^[a-f0-9]{36}$/.test(id);
}

function createScript(code) {
    const id = crypto.randomBytes(18).toString('hex');
    const filename = path.join(DATA_DIR, `${id}.lua`);
    const temporary = `${filename}.tmp`;
    fs.writeFileSync(temporary, code, { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(temporary, filename);
    return id;
}

function loadScript(id) {
    if (!validId(id)) return null;
    const filename = path.join(DATA_DIR, `${id}.lua`);
    try {
        return fs.readFileSync(filename, 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
    }
}

const server = http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = requestUrl.pathname;

    if (req.method === 'GET' && pathname === '/health') {
        sendJson(res, 200, { status: 'ok', time: new Date().toISOString() });
        return;
    }

    if (req.method === 'POST' && pathname === '/api/scripts') {
        if (!authorized(req)) {
            sendJson(res, 401, { error: 'Unauthorized' });
            return;
        }

        const limit = allowRequest(getClientIp(req), 'create');
        if (!limit.allowed) {
            res.setHeader('Retry-After', String(limit.retryAfter));
            sendJson(res, 429, { error: 'Too many requests' });
            return;
        }

        try {
            const body = await readJson(req);
            if (typeof body.code !== 'string' || !body.code.trim()) {
                sendJson(res, 400, { error: 'code must be a non-empty string' });
                return;
            }
            if (Buffer.byteLength(body.code, 'utf8') > MAX_CODE_BYTES) {
                sendJson(res, 413, { error: 'The code is too large. Maximum size is 2 MB.' });
                return;
            }

            const id = createScript(body.code);
            const url = `${getPublicBaseUrl(req)}/script/${id}`;
            sendJson(res, 201, { id, url });
        } catch (error) {
            sendJson(res, 400, { error: error.message || 'Invalid request' });
        }
        return;
    }

    const scriptMatch = pathname.match(/^\/script\/([a-f0-9]{36})$/);
    if (req.method === 'GET' && scriptMatch) {
        const limit = allowRequest(getClientIp(req), 'read');
        if (!limit.allowed) {
            res.setHeader('Retry-After', String(limit.retryAfter));
            sendText(res, 429, 'Too many requests');
            return;
        }

        if (isBrowser(req)) {
            sendText(res, 403, blockedPage(), 'text/html; charset=utf-8');
            return;
        }

        try {
            const code = loadScript(scriptMatch[1]);
            if (code === null) {
                sendText(res, 404, 'Script not found');
                return;
            }
            sendText(res, 200, code);
        } catch {
            sendText(res, 500, 'Script unavailable');
        }
        return;
    }

    sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Hosting API listening on port ${PORT}`);
    if (!API_SHARED_SECRET) {
        console.warn('API_SHARED_SECRET is not set; script creation is unauthenticated.');
    }
});