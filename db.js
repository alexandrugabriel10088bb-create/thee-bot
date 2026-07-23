const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'keys.json');

function readDB() {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getUserKey(userId) {
    const db = readDB();
    return db[userId] || null;
}

function setUserKey(userId, key, active = true) {
    const db = readDB();
    db[userId] = { key, active, created_at: Date.now(), usage: 0 };
    writeDB(db);
}

function incrementUsage(userId) {
    const db = readDB();
    if (db[userId]) {
        db[userId].usage = (db[userId].usage || 0) + 1;
        writeDB(db);
        return true;
    }
    return false;
}

function setActive(userId, active) {
    const db = readDB();
    if (db[userId]) {
        db[userId].active = active;
        writeDB(db);
        return true;
    }
    return false;
}

function findUserByKey(key) {
    const db = readDB();
    for (const [userId, data] of Object.entries(db)) {
        if (data.key === key) return { userId, ...data };
    }
    return null;
}

module.exports = {
    readDB,
    getUserKey,
    setUserKey,
    incrementUsage,
    setActive,
    findUserByKey,
};
