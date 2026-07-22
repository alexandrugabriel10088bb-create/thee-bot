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

const ANTI_TAMPER_LUA = `
local function antiTamper()
    local function crash(reason)
        while true do
            local stack = {}
            for i = 1, 20 do
                local info = debug.getinfo(i, 'S')
                if info then table.insert(stack, info.short_src or '?') end
            end
            error('ANTI-TAMPER:' .. reason .. '|' .. table.concat(stack, '->'), 0)
        end
    end

    pcall(function()
        local mt = getmetatable(_G) or {}
        if mt.__index or mt.__newindex then
            if mt.__index then
                for k, _ in pairs(_G) do
                    if k == 'env' or k == 'logger' or k == 'spy' or k == 'dump' or k == 'inspect' then
                        crash('ENV_LOGGER')
                    end
                end
            end
        end
    end)

    pcall(function()
        local ok = pcall(function() return debug.getinfo(1, 'S') end)
        if not ok then crash('DEBUG_DISABLED') end

        local hooked = false
        local hookFunc = function() hooked = true end
        debug.sethook(hookFunc, 'l')
        debug.sethook()
        if hooked then crash('HOOK_DETECTED') end
    end)

    pcall(function()
        local test = 'test'
        local buf = buffer.fromstring(test)
        local result = buffer.tostring(buf)
        if result ~= test then crash('BUFFER_CORRUPT') end
    end)

    pcall(function()
        local services = {
            'Players','Workspace','ServerScriptService','ReplicatedStorage',
            'RunService','HttpService','MarketplaceService','DataStoreService',
            'AssetService','Lighting','SoundService','TweenService'
        }
        for _, svc in ipairs(services) do
            local ok, result = pcall(function() return game:GetService(svc) end)
            if not ok then crash('SERVICE:' .. svc) end
            if result and type(result) ~= 'Instance' then crash('SERVICE_INVALID:' .. svc) end
        end
    end)

    pcall(function()
        local co = coroutine.create(function() coroutine.yield(1) end)
        local ok, result = coroutine.resume(co)
        if not ok or result ~= 1 then crash('COROUTINE_FAIL') end
    end)

    pcall(function()
        local funcs = {
            'pcall','xpcall','error','assert','type',
            'rawget','rawset','next','pairs','ipairs',
            'select','tonumber','tostring','string','table',
            'math','bit32','coroutine','task','game','Instance'
        }
        for _, f in ipairs(funcs) do
            if type(_G[f]) ~= 'function' and type(_G[f]) ~= 'table' then
                crash('FUNC_MISS:' .. f)
            end
        end
    end)

    return true
end

local protected, err = pcall(antiTamper)
if not protected then
    while true do
        error('PROTECTION_FAILED: ' .. tostring(err), 0)
    end
end
`;

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
    const finalCode = `${HEADER} ${ANTI_TAMPER_LUA} ${vm}`.replace(/\s+/g, " ").trim();
    return finalCode;
}

module.exports = { obfuscate };
