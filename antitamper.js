// antitamper.js - Sistema Anti-Tamper y Anti-Debug mejorado

// ==================== GENERADOR DE VARIABLES ====================
function _randVar(length = 9) {
    return "_" + Array.from({length}, () => 
        "Il1"[Math.floor(Math.random() * 3)]
    ).join('');
}

function _randAlnumVar(length = 8) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return "_" + Array.from({length}, () => 
        chars[Math.floor(Math.random() * chars.length)]
    ).join('');
}

function _toLuaByteArray(s) {
    return "{" + Array.from(s).map(c => c.charCodeAt(0)).join(",") + "}";
}

function _triggerCrash(payloadTable) {
    return `local msg = string.char(unpack(${payloadTable})); task.spawn(function() error(msg) end); task.wait(0.1); while true do end`;
}

function _randomDelay() {
    return (Math.random() * 4 + 1).toFixed(2);
}

function _generateFillerLines(count = 20) {
    let lines = [];
    for (let i = 0; i < count; i++) {
        let varName = _randAlnumVar(12);
        let val = Math.floor(Math.random() * 9999) + 1;
        lines.push("do local " + varName + " = " + val + " end");
    }
    return lines.join(" ");
}

// ==================== GENERADOR DE BLOQUE ANTI-TAMPER ====================
function generateAntiTamperBlock() {
    const vHookCheck = _randVar();
    const vEnv = _randVar();
    const vMt = _randVar();
    const vIdx = _randVar();
    const vOk = _randVar();
    const vId = _randVar();
    const vFn = _randVar();
    const vTb = _randVar();
    const vSuccess = _randVar();
    const vResult = _randVar();
    const vConn = _randVar();
    const vRan = _randVar();
    const vOld = _randVar();
    const vTest = _randVar();
    const vGuard = _randVar();

    const decompilerErr = _toLuaByteArray("The decompiler failed, please try again in a few seconds");
    const envLoggerErr = _toLuaByteArray("env logger It failed, please try again in a few seconds");
    const punishmentErr = _toLuaByteArray("you didn't pass the eclipse obfuscator test Please never try to get the source again\nOr you will be punished");
    const skidErr = _toLuaByteArray("Error skid Detected");
    const executorErr = _toLuaByteArray("Executor environment detected - access denied");
    const hookFuncErr = _toLuaByteArray("Hook utility detected - access denied");
    const upvalueErr = _toLuaByteArray("Upvalue tampering utility detected");
    const filesystemErr = _toLuaByteArray("Filesystem exploit utility detected");
    const threadIdErr = _toLuaByteArray("Invalid thread identity - access denied");
    const stackErr = _toLuaByteArray("Stack manipulation detected - access denied");
    const invalidMethodErr = _toLuaByteArray("InvalidMethod check failed – environment altered");
    const getchildrenErr = _toLuaByteArray("GetChildren hook detected");
    const serviceCountErr = _toLuaByteArray("Service count tampered");
    const jsonErr = _toLuaByteArray("JSONDecode altered");
    const httpErr = _toLuaByteArray("HttpService access modified");
    const envGlobalErr = _toLuaByteArray("Global environment tampered");
    const gameCallErr = _toLuaByteArray("Game object is not an Instance");
    const heartbeatErr = _toLuaByteArray("Heartbeat interception detected");

    function crash(p) {
        return _triggerCrash(p);
    }

    const criticalFuncs = [
        "loadstring", "rawget", "type", "string.char",
        "bit32.bxor", "pcall", "task.spawn", "task.wait",
        "getfenv", "setfenv", "getmetatable", "setmetatable",
        "debug.getinfo", "debug.sethook", "coroutine.create",
        "coroutine.resume", "os.clock", "os.time",
        "table.freeze", "table.create", "buffer.fromstring",
        "buffer.tostring", "buffer.create", "buffer.writeu8",
        "buffer.readu8", "buffer.writei8",
        "Instance.new", "game.GetService", "game.GetChildren"
    ];

    let coreChecks = criticalFuncs.map(cf => 
        `if type(${cf}) ~= 'function' or (islclosure and islclosure(${cf})) then ${crash(skidErr)} end`
    ).join(" ");

    const decompilerTriggers = [
        "decompile", "getscriptbytecode", "dumpstring", "getconstants",
        "getprotos", "getbytecode", "decompile_ast", "getsource",
        "getscript", "getgc", "getreg"
    ];

    let antiDecompile = `if decompile or getscriptbytecode or dumpstring then ${crash(decompilerErr)} end ` +
        decompilerTriggers.map(t => 
            `if getgenv and getgenv()[${_toLuaByteArray(t)}] then ${crash(decompilerErr)} end ` +
            `if _G[${_toLuaByteArray(t)}] then ${crash(decompilerErr)} end`
        ).join(" ");

    const envLoggerTriggers = [
        "saveinstance", "getgc", "getreg", "getloadedmodules",
        "hookmetamethod", "checkclosure", "isourclosure",
        "getrenv", "getgenv", "getsenv",
        "dump", "inspect", "spy", "logger"
    ];

    let antiEnvLogger = envLoggerTriggers.map(t =>
        `if getgenv and getgenv()[${_toLuaByteArray(t)}] then ${crash(envLoggerErr)} end ` +
        `if _G[${_toLuaByteArray(t)}] then ${crash(envLoggerErr)} end`
    ).join(" ");

    const idxStr = _toLuaByteArray("__index");
    let metatableCheck = `
        local ${vHookCheck} = pcall(function()
            local ${vEnv} = getfenv and getfenv(0)
            local ${vMt} = getrawmetatable and getrawmetatable(${vEnv})
            if ${vMt} then
                local ${vIdx} = rawget(${vMt}, ${idxStr})
                if type(${vIdx}) == 'function' or type(${vIdx}) == 'table' then ${crash(punishmentErr)} end
            end
        end)
        if not ${vHookCheck} then ${crash(punishmentErr)} end
    `;

    const exploitLogs = [
        "rconsoleprint", "rconsolewarn", "rconsoleerr",
        "setclipboard", "toclipboard", "printconsole"
    ];

    let antiLogging = exploitLogs.map(f =>
        `if getgenv and getgenv()[${_toLuaByteArray(f)}] then ` +
        `getgenv()[${_toLuaByteArray(f)}] = function() ${crash(punishmentErr)} end end`
    ).join(" ");

    const executorGlobals = [
        "syn", "KRNL_LOADED", "SENTINEL_V2", "Electron", "fluxus",
        "is_sirhurt_closure", "CARBON_LOADED", "COCO_Z", "pebc",
        "Drawing", "gethui", "isexecutorclosure", "identifyexecutor",
        "synapse", "krnl", "scriptware", "sirhurt", "vynixius",
        "zeta", "oxygen", "protosmasher", "crystal"
    ];

    let antiExecutor = executorGlobals.map(g =>
        `if getgenv and getgenv()[${_toLuaByteArray(g)}] ~= nil then ${crash(executorErr)} end ` +
        `if rawget(_G, ${_toLuaByteArray(g)}) ~= nil then ${crash(executorErr)} end`
    ).join(" ");

    const hookFuncs = ["hookfunction", "replaceclosure", "newcclosure", "clonefunction",
                       "hookmetamethod", "detourfunction", "overridemethod"];

    let antiHookfunction = hookFuncs.map(hf =>
        `if getgenv and getgenv()[${_toLuaByteArray(hf)}] then ${crash(hookFuncErr)} end ` +
        `if _G[${_toLuaByteArray(hf)}] then ${crash(hookFuncErr)} end`
    ).join(" ");

    const upvalueTools = ["setupvalue", "getupvalues", "getupvalue", "setupvalue",
                          "getupvaluecount", "upvaluejoin"];

    let antiUpvalue = upvalueTools.map(ut =>
        `if getgenv and getgenv()[${_toLuaByteArray(ut)}] then ${crash(upvalueErr)} end ` +
        `if _G[${_toLuaByteArray(ut)}] then ${crash(upvalueErr)} end`
    ).join(" ");

    const fsFuncs = [
        "readfile", "writefile", "appendfile",
        "makefolder", "listfiles", "isfile", "isfolder"
    ];

    let antiFilesystem = fsFuncs.map(ff =>
        `if getgenv and getgenv()[${_toLuaByteArray(ff)}] then ${crash(filesystemErr)} end ` +
        `if _G[${_toLuaByteArray(ff)}] then ${crash(filesystemErr)} end`
    ).join(" ");

    let threadIdCheck = `
        local ${vOk}, ${vId} = pcall(function()
            return getthreadidentity and getthreadidentity() or 0
        end)
        if ${vOk} and ${vId} and ${vId} >= 6 then ${crash(threadIdErr)} end
    `;

    let stackCheck = `
        local ${vOk}, ${vTb} = pcall(function()
            return debug and debug.traceback and debug.traceback() or ''
        end)
        if ${vOk} and ${vTb} then
            local ${vFn} = tostring(${vTb})
            if string.find(${vFn}, ${_toLuaByteArray('LocalScript')}, 1, true) == nil then
                if string.find(${vFn}, ${_toLuaByteArray('ModuleScript')}, 1, true) == nil then
                    ${crash(stackErr)}
                end
            end
        end
    `;

    let invalidMethodCheck = `
        local ${vOk}, _ = pcall(function()
            return Instance.new('Part'):InvalidMethod('a')
        end)
        if ${vOk} then ${crash(invalidMethodErr)} end
    `;

    let getchildrenCheck = `
        local ${vOk}, _ = pcall(function()
            return game:GetChildren(function() end)
        end)
        if ${vOk} then ${crash(getchildrenErr)} end
    `;

    let serviceCountCheck = `
        while #game:GetChildren() <= 4 do
            buffer.writei8(buffer.fromstring('a'), 1, 2)
        end
    `;

    let jsonCheck = `
        local ${vOk}, ${vResult} = pcall(function()
            return game:GetService('HttpService'):JSONDecode('[68, "getgold.cc", true, 123, false, [321, null, "goldtm"], null, ["a"]]')
        end)
        while not ${vOk} do
            task()
        end
        while ${vResult}[6][2] ~= nil do
            (true)()
        end
    `;

    let httpCheck = `
        local ${vOk}, _ = pcall(function()
            return game.HttpService
        end)
        while not ${vOk} do
            local _ = (nil).Parent
        end
    `;

    let envGlobalCheck = `
        _G.getgoldcc = 'goldtm'
        while getfenv().getgoldcc ~= nil do
            game()
        end
        _G.getgoldcc = nil
    `;

    let gameCallCheck = `
        local _, ${vResult} = pcall(function()
            game()
        end)
        while not ${vResult}:find('attempt to call a Instance value') do
            table.create(9e9)
        end
    `;

    let heartbeatCheck = `
        local ${vRan} = 0
        local ${vConn} = game:GetService('RunService').Heartbeat:Connect(function()
            ${vRan} = ${vRan} + 1
        end)
        repeat task.wait() until ${vRan} >= 2
        ${vConn}:Disconnect()
    `;

    let dummyChecks = [];
    for (let i = 0; i < 5; i++) {
        let varName = _randVar();
        dummyChecks.push(`do local ${varName} = os.clock(); if ${varName} < 0 then ${crash(skidErr)} end end`);
    }
    let dummyBlock = dummyChecks.join(" ");

    let fillerBlock = _generateFillerLines(20);

    let extraLoops = [];
    for (let i = 0; i < 3; i++) {
        let v1 = _randAlnumVar(6);
        let v2 = _randAlnumVar(6);
        let num1 = Math.floor(Math.random() * 40) + 10;
        let num2 = Math.floor(Math.random() * 8) + 2;
        let num3 = Math.floor(Math.random() * 5) + 3;
        extraLoops.push(
            `for ${v1} = 1, ${num1} do ` +
            `local ${v2} = ${v1} * ${num2} ` +
            `if ${v2} % ${num3} == 0 then ${crash(punishmentErr)} end end`
        );
    }
    let extraLoopBlock = extraLoops.join(" ");

    let delay = _randomDelay();

    return `
        task.spawn(function()
            while true do
                ${coreChecks}
                ${antiDecompile}
                ${antiEnvLogger}
                ${metatableCheck}
                ${antiLogging}
                ${antiExecutor}
                ${antiHookfunction}
                ${antiUpvalue}
                ${antiFilesystem}
                ${threadIdCheck}
                ${stackCheck}
                ${invalidMethodCheck}
                ${getchildrenCheck}
                ${serviceCountCheck}
                ${jsonCheck}
                ${httpCheck}
                ${envGlobalCheck}
                ${gameCallCheck}
                ${heartbeatCheck}
                ${dummyBlock}
                ${fillerBlock}
                ${extraLoopBlock}
                task.wait(${delay})
            end
        end)
    `;
}

// ==================== GENERADOR DE LUA OFUSCADO ====================
function generateFullLua(sourceCode) {
    const antiTamper = generateAntiTamperBlock();
    
    // Codificar el código fuente en base64 para ofuscación adicional
    const encodedSource = Buffer.from(sourceCode).toString('base64');
    
    // Crear el payload ofuscado con doble capa
    const payload = `
        --[[ protected ]]
        do
            local _decode = function(s)
                return (string.gsub(s, '..', function(c)
                    return string.char(tonumber(c, 36))
                end))
            end
            
            local _source = _decode("${Array.from(encodedSource).map(c => 
                c.charCodeAt(0).toString(36).padStart(2, '0')
            ).join('')}")
            
            ${antiTamper}
            
            local _load = loadstring or load
            if _load then
                local _fn, _err = _load(_source)
                if _fn then
                    _fn()
                end
            end
        end
    `;
    
    return payload;
}

// ==================== FUNCIÓN PRINCIPAL ====================
function obfuscate(sourceCode) {
    if (!sourceCode) return '-- Error: No Source';
    
    // Generar el código completo con anti-tamper
    let finalCode = generateFullLua(sourceCode);
    
    // Limpiar espacios y saltos de línea
    finalCode = finalCode.replace(/\s+/g, " ").trim();
    
    return finalCode;
}

// ==================== EXPORTACIÓN ====================
module.exports = { 
    obfuscate,
    generateAntiTamperBlock,
    generateFullLua
};
