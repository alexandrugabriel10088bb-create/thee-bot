const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Storage
const scripts = new Map();
const hits = new Map();
const WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX = 100; // Max requests per window

// Rate Limiter
function rateLimiter(req, res, next) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || 
             req.socket.remoteAddress || 
             req.ip ||
             "?";
  const now = Date.now();
  const r = hits.get(ip);
  
  if (!r || now - r.start > WINDOW) {
    hits.set(ip, { count: 1, start: now });
    return next();
  }
  
  r.count++;
  if (r.count > MAX) {
    const retry = Math.ceil((WINDOW - (now - r.start)) / 1000);
    res.set("Retry-After", String(retry));
    return res.status(429).type("text").send("Too many requests. Try again later.");
  }
  next();
}

// Cleanup old hits
setInterval(() => {
  const now = Date.now();
  for (const [ip, r] of hits) {
    if (now - r.start > WINDOW) hits.delete(ip);
  }
}, 5 * 60 * 1000);

// Blocked page for browsers
const BLOCKED_PAGE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Blocked</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: #1a1a1a; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
      font-family: 'Segoe UI', sans-serif; 
    }
    .card { 
      background: #2a2a2a; 
      border: 1px solid #3a3a3a; 
      border-radius: 16px; 
      padding: 48px 56px; 
      text-align: center; 
      max-width: 420px; 
    }
    .icon { font-size: 64px; margin-bottom: 20px; }
    h1 { color: #e0e0e0; font-size: 22px; font-weight: 600; letter-spacing: 1px; margin-bottom: 12px; }
    p { color: #888; font-size: 14px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⛔</div>
    <h1>YOU ARE BLOCKED</h1>
    <p>Access to this resource is restricted.<br>This content is not available in your browser.</p>
  </div>
</body>
</html>`;

function blockBrowsers(req, res, next) {
  const ua = req.headers["user-agent"] || "";
  const uaLower = ua.toLowerCase();
  const isBrowser = 
    (uaLower.includes("chrome/") || 
     uaLower.includes("firefox/") || 
     uaLower.includes("safari/") || 
     uaLower.includes("edge/") || 
     uaLower.includes("opr/") || 
     uaLower.includes("trident/")) && 
    uaLower.includes("mozilla");
  
  if (isBrowser) {
    return res.status(403).type("html").send(BLOCKED_PAGE);
  }
  next();
}

// Routes
app.post("/register", (req, res) => {
  const { script, owner, userId } = req.body;
  
  if (!script) {
    return res.status(400).json({ error: "Script content is required" });
  }
  
  const scriptId = crypto.randomBytes(8).toString('hex');
  scripts.set(scriptId, { 
    script, 
    owner: owner || 'Anonymous',
    userId: userId || 'unknown',
    created: Date.now(),
    hits: 0,
    lastAccess: null
  });
  
  res.json({ 
    success: true,
    id: scriptId,
    url: `${req.protocol}://${req.get('host')}/get-script/${scriptId}`
  });
});

app.get("/get-script/:id", rateLimiter, blockBrowsers, (req, res) => {
  const { id } = req.params;
  const scriptData = scripts.get(id);
  
  if (!scriptData) {
    return res.status(404).type("text").send("Script not found or has been removed.");
  }
  
  scriptData.hits++;
  scriptData.lastAccess = Date.now();
  
  res.type("text").send(scriptData.script);
});

app.get("/stats/:id", (req, res) => {
  const { id } = req.params;
  const scriptData = scripts.get(id);
  
  if (!scriptData) {
    return res.status(404).json({ error: "Script not found" });
  }
  
  res.json({
    id: id,
    owner: scriptData.owner,
    userId: scriptData.userId,
    created: new Date(scriptData.created).toISOString(),
    hits: scriptData.hits,
    lastAccess: scriptData.lastAccess ? new Date(scriptData.lastAccess).toISOString() : null,
    status: "active"
  });
});

app.get("/health", (req, res) => {
  const totalScripts = scripts.size;
  let totalHits = 0;
  for (const [, data] of scripts) {
    totalHits += data.hits;
  }
  
  res.json({ 
    status: "ok", 
    time: new Date().toISOString(),
    scripts: totalScripts,
    totalHits: totalHits,
    uptime: process.uptime()
  });
});

// Delete old scripts (optional - cleanup after 7 days)
setInterval(() => {
  const now = Date.now();
  const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  for (const [id, data] of scripts) {
    if (now - data.created > MAX_AGE) {
      scripts.delete(id);
      console.log(`Removed old script: ${id}`);
    }
  }
}, 24 * 60 * 60 * 1000); // Check once per day

app.listen(PORT, () => {
  console.log(`🚀 API Host server running on port ${PORT}`);
  console.log(`📝 Register endpoint: http://localhost:${PORT}/register`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
