const express = require('express');
const bodyParser = require('body-parser');
const { obfuscate } = require('./obfuscator.js');
const db = require('./db');

const app = express();
app.use(bodyParser.json());

app.post('/api/obfuscate', (req, res) => {
    const { apiKey, code } = req.body;
    if (!apiKey || !code) {
        return res.status(400).json({ error: 'Missing apiKey or code' });
    }

    const user = db.findUserByKey(apiKey);
    if (!user) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    if (!user.active) {
        return res.status(403).json({ error: 'API key is inactive' });
    }

    try {
        const obfuscated = obfuscate(code);
        db.incrementUsage(user.userId);
        res.json({ success: true, obfuscated });
    } catch (err) {
        console.error('Obfuscation error:', err);
        res.status(500).json({ error: 'Obfuscation failed' });
    }
});

function startServer(port = process.env.API_PORT || 3000) {
    app.listen(port, () => {
        console.log(`API server running on port ${port}`);
    });
}

module.exports = { startServer };
