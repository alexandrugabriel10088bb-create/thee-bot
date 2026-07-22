const HEADER = `--[[ this code it's protected by vmmer obfoscator ]]`;

const CUSTOM_VARS = [
    "data", "temp", "result", "value", "index", "count", "total", "amount",
    "position", "status", "flags", "config", "cache", "buffer", "stream",
    "packet", "frame", "token", "session", "client", "server", "node",
    "table_data", "string_data", "number_data", "boolean_data", "nil_data",
    "function_data", "thread_data", "userdata_data", "table_temp", "string_temp",
    "number_temp", "boolean_temp", "nil_temp", "function_temp", "thread_temp",
    "userdata_temp", "table_result", "string_result", "number_result", "boolean_result",
    "nil_result", "function_result", "thread_result", "userdata_result"
];

function generateCustomName() {
    const base = CUSTOM_VARS[Math.floor(Math.random() * CUSTOM_VARS.length)];
    const suffix = Math.floor(Math.random() * 999999);
    const prefixes = ["", "get_", "set_", "is_", "has_", "on_", "do_"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return prefix + base + "_" + suffix;
}

function runtimeString(str) {
    return `string.char(${str.split('').map(c => c.charCodeAt(0)).join(',')})`;
}

function buildTrueVM(payloadStr) {
    const STACK = generateCustomName();
    const KEY = generateCustomName();
    const SALT = generateCustomName();
    const seed = Math.floor(Math.random() * 200) + 50;
    const saltVal = Math.floor(Math.random() * 250) + 1;

    const chunkSize = 15;
    const realChunks = [];
    for (let i = 0; i < payloadStr.length; i += chunkSize) {
        realChunks.push(payloadStr.slice(i, i + chunkSize));
    }

    // Store everything in tables instead of individual locals to avoid the 200-locals limit
    let vmCore = `local ${STACK}={} local ${KEY}=${seed} local ${SALT}=${saltVal} local _pool={} `;

    let globalIndex = 0;
    for (let i = 0; i < realChunks.length; i++) {
        const chunk = realChunks[i];
        const encryptedBytes = [];
        for (let j = 0; j < chunk.length; j++) {
            const enc = (chunk.charCodeAt(j) + seed + (globalIndex * saltVal)) % 256;
            encryptedBytes.push(enc);
            globalIndex++;
        }
        vmCore += `_pool[${i + 1}]={${encryptedBytes.join(',')}} `;
    }

    // Fake decoy chunks generated in a loop (no extra locals)
    const fakeCount = Math.floor(realChunks.length * 2);
    const fakeLen = Math.floor(Math.random() * 20) + 5;
    vmCore += `for _i=1,${fakeCount} do _pool[${realChunks.length}+_i]={} for _j=1,${fakeLen} do table.insert(_pool[${realChunks.length}+_i], ${Math.floor(Math.random() * 255)}) end end `;

    // Shuffle the real-chunk order
    const order = [];
    for (let i = 1; i <= realChunks.length; i++) order.push(i);
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }

    vmCore += `local _order={${order.join(',')}} local _gIdx=0 `;
    vmCore += `for _, idx in ipairs(_order) do for _, byte in ipairs(_pool[idx]) do `;
    vmCore += `table.insert(${STACK}, string.char((byte - ${KEY} - _gIdx * ${SALT}) % 256)) _gIdx=_gIdx+1 end end `;
    vmCore += `local _e = table.concat(${STACK}) ${STACK}=nil `;

    const ASSERT = `getfenv()[${runtimeString("assert")}]`;
    const LOADSTRING = `getfenv()[${runtimeString("loadstring")}]`;
    const GAME = `getfenv()[${runtimeString("game")}]`;
    const HTTPGET = runtimeString("HttpGet");

    if (payloadStr.includes("http")) {
        vmCore += `${ASSERT}(${LOADSTRING}(${GAME}[${HTTPGET}](${GAME}, _e)))() `;
    } else {
        vmCore += `${ASSERT}(${LOADSTRING}(_e))() `;
    }

    return vmCore;
}

function detectAndApplyMappings(code) {
    const MAPEO = {
        "ScreenGui": "rename", "Frame": "rename", "TextLabel": "rename",
        "TextButton": "rename", "Humanoid": "rename", "Player": "rename",
        "RunService": "rename", "TweenService": "rename", "Players": "rename"
    };
    let modified = code;
    let headers = "";
    for (const [word] of Object.entries(MAPEO)) {
        const regex = new RegExp(`\\b${word}\\b`, "g");
        if (regex.test(modified)) {
            const v = generateCustomName();
            headers += `local ${v}="${word}";`;
            regex.lastIndex = 0;
            modified = modified.replace(regex, () => `game[${v}]`);
        }
    }
    return headers + modified;
}

function obfuscate(sourceCode) {
    if (!sourceCode) return '-- Error: No Source';

    let payloadToProtect = "";
    const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
    const match = sourceCode.match(isLoadstringRegex);
    if (match) {
        payloadToProtect = match[1];
    } else {
        payloadToProtect = detectAndApplyMappings(sourceCode);
    }

    const vm = buildTrueVM(payloadToProtect);
    const finalCode = `${HEADER} ${vm}`.replace(/\s+/g, " ").trim();
    return finalCode;
}

module.exports = { obfuscate };
