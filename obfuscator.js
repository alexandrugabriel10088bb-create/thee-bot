const HEADER = `--[[ this code it's protected by vmmer obfoscator ]]`;

// ==================== VARIABLES PERSONALIZADAS ====================
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

const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"];

// ==================== ANTI-TAMPER LUA (INTACTO) ====================
const ANTI_TAMPER = `
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

// ==================== FUNCIONES AUXILIARES ====================

function generateCustomName() {
    const base = CUSTOM_VARS[Math.floor(Math.random() * CUSTOM_VARS.length)];
    const suffix = Math.floor(Math.random() * 999999);
    const prefixes = ["", "get_", "set_", "is_", "has_", "on_", "do_"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return prefix + base + "_" + suffix;
}

function pickHandlers(count) {
    const used = new Set();
    const result = [];
    while (result.length < count) {
        const base = HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)];
        const name = base + Math.floor(Math.random() * 99);
        if (!used.has(name)) { used.add(name); result.push(name); }
    }
    return result;
}

function generateJunk(lines = 50) {
    let j = '';
    for (let i = 0; i < lines; i++) {
        const r = Math.random();
        if (r < 0.2) j += `local ${generateCustomName()}=${Math.floor(Math.random() * 999)} `;
        else if (r < 0.4) j += `local ${generateCustomName()}=string.char(${Math.floor(Math.random()*255)}) `;
        else if (r < 0.5) j += `if not(1==1) then local x=1 end `;
        else if (r < 0.7) {
            const tp = generateCustomName();
            j += `if type(nil)=="number" then while true do local ${tp}=1 end end `;
        } else if (r < 0.85) {
            const vt = generateCustomName();
            j += `do local ${vt}={} ${vt}["_"]=1 ${vt}=nil end `;
        } else {
            j += `if type(math.pi)=="string" then local _=1 end `;
        }
    }
    return j;
}

function detectAndApplyMappings(code) {
    const MAPEO = {
        "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
        "TextButton":"Mixed Boolean Arithmetic","Humanoid":"Dynamic Junk","Player":"Fake Flow",
        "RunService":"Virtual Machine","TweenService":"Fake Flow","Players":"Fake Flow"
    };
    let modified = code, headers = "";
    for (const [word, tech] of Object.entries(MAPEO)) {
        const regex = new RegExp(`\\b${word}\\b`, "g");
        if (regex.test(modified)) {
            let replacement = `"${word}"`;
            if (tech.includes("Aggressive Renaming")) { 
                const v = generateCustomName(); 
                headers += `local ${v}="${word}";`; 
                replacement = v; 
            }
            else if (tech.includes("String to Math")) {
                replacement = `string.char(${word.split('').map(c => c.charCodeAt(0)).join(',')})`;
            }
            else if (tech.includes("Mixed Boolean Arithmetic")) {
                const flag = generateCustomName();
                headers += `local ${flag}=${Math.random() > 0.5 ? 1 : 2};`;
                replacement = `((${flag}==1 or true)and"${word}")`;
            }
            regex.lastIndex = 0;
            modified = modified.replace(regex, () => `game[${replacement}]`);
        }
    }
    return headers + modified;
}

function getProtections() {
    const antiDebuggers =
        `local _adT=os.clock() for _=1,150000 do end if os.clock()-_adT>5.0 then while true do end end ` +
        `if debug~=nil and debug.getinfo then local _i=debug.getinfo(1) if _i.what~="main" and _i.what~="Lua" then while true do end end end ` +
        `if debug and debug.sethook then debug.sethook(function() while true do end end, "l", 5) end `;

    const rawTampers = [
        `if math.pi<3.14 or math.pi>3.15 then _err() end`,
        `if bit32 and bit32.bxor(10,5)~=15 then _err() end`,
        `if type(tostring)~="function" then _err() end`,
        `if not string.match("chk","^c.*k$") then _err() end`,
        `local _tm1=os.time() local _tm2=os.time() if _tm2<_tm1 then _err() end`,
        `if math.abs(-10)~=10 then _err() end`,
        `if string.char(65)~="A" then _err() end`,
        `if type({})~="table" then _err() end`,
        `if type(1)~="number" then _err() end`,
        `if type("a")~="string" then _err() end`,
        `if type(true)~="boolean" then _err() end`,
        `if type(nil)~="nil" then _err() end`,
        `if type(function() end)~="function" then _err() end`,
        `if type(coroutine.create(function() end))~="thread" then _err() end`,
        `if type(io)~="userdata" then _err() end`,
        `if type(game)~="userdata" then _err() end`,
        `if type(workspace)~="userdata" then _err() end`,
        `if type(script)~="userdata" then _err() end`,
        `if type(Instance)~="function" then _err() end`,
        `if type(getfenv)~="function" then _err() end`,
        `if type(setfenv)~="function" then _err() end`
    ];

    let codeVaultGuards = "";
    for (const t of rawTampers) {
        const fnName = generateCustomName();
        const errName = generateCustomName();
        codeVaultGuards += `local ${fnName}=function() local ${errName}=error ${t.replace("_err()", `${errName}("!")`)} end ${fnName}() `;
    }

    return antiDebuggers + codeVaultGuards;
}

// ==================== HANDLER-BASED VM ====================

function buildHandlerVM(payloadStr) {
    const handlerCount = Math.floor(Math.random() * 5) + 3;
    const handlers = pickHandlers(handlerCount);
    const realIdx = Math.floor(Math.random() * handlerCount);
    const dispatchTable = generateCustomName();
    const stateVar = generateCustomName();
    const dataVar = generateCustomName();
    
    let vm = `local ${dataVar}=[[\n${payloadStr}\n]] `;
    vm += `local ${dispatchTable}={} `;
    
    // Crear handlers
    for (let i = 0; i < handlers.length; i++) {
        if (i === realIdx) {
            vm += `local ${handlers[i]}=function() `;
            vm += `local exec=loadstring(${dataVar}) `;
            vm += `if exec then exec() end `;
            vm += `end `;
        } else {
            vm += `local ${handlers[i]}=function() `;
            vm += `local ${generateCustomName()}=${generateCustomName()} `;
            vm += `return nil `;
            vm += `end `;
        }
        vm += `${dispatchTable}[${i + 1}]=${handlers[i]} `;
    }
    
    // Ejecutar handlers secuencialmente
    vm += `local ${stateVar}=1 `;
    vm += `while true do `;
    vm += `if ${stateVar}==1 then ${dispatchTable}[1]() ${stateVar}=2 `;
    vm += `elseif ${stateVar}==2 then ${dispatchTable}[2]() ${stateVar}=3 `;
    vm += `elseif ${stateVar}==3 then ${dispatchTable}[3]() ${stateVar}=4 `;
    vm += `elseif ${stateVar}==4 then ${dispatchTable}[4]() ${stateVar}=5 `;
    vm += `elseif ${stateVar}==5 then ${dispatchTable}[5]() ${stateVar}=6 `;
    vm += `elseif ${stateVar}==6 then ${dispatchTable}[6]() ${stateVar}=7 `;
    vm += `elseif ${stateVar}==7 then ${dispatchTable}[7]() ${stateVar}=8 `;
    vm += `elseif ${stateVar}==8 then break end end `;
    
    return vm;
}

// ==================== FUNCIÓN PRINCIPAL ====================

function obfuscate(sourceCode) {
    if (!sourceCode) return '-- Error: No Source';

    const protections = getProtections();

    let payloadToProtect = "";
    const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
    const match = sourceCode.match(isLoadstringRegex);
    if (match) { payloadToProtect = match[1]; }
    else { payloadToProtect = detectAndApplyMappings(sourceCode); }

    const vm = buildHandlerVM(payloadToProtect);

    let finalCode = `${HEADER} ${generateJunk(30)} ${protections} ${ANTI_TAMPER} ${vm}`.replace(/\s+/g, " ").trim();
    
    const targetSize = 10 * 1024;
    let currentSize = Buffer.byteLength(finalCode, 'utf8');

    if (currentSize < targetSize) {
        const neededBytes = targetSize - currentSize;
        const junkPerLine = 50;
        const additionalLines = Math.ceil(neededBytes / junkPerLine);
        finalCode = `${HEADER} ${generateJunk(30 + additionalLines)} ${protections} ${ANTI_TAMPER} ${vm}`.replace(/\s+/g, " ").trim();
    }

    return finalCode;
}

module.exports = { obfuscate };
