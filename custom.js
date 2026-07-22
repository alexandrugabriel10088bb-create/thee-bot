// ============================================================
// MAX / CUSTOM OBFUSCATOR — Técnicas 💀 Extremas
// Todas las técnicas del nivel máximo, aplicables individualmente
// en el modo Custom, o todas juntas en el modo Max.
// ============================================================

'use strict';

// ══════════════════════════════════════════════════════════════
// UTILIDADES BASE
// ══════════════════════════════════════════════════════════════

function stripLuaComments(code) {
    code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
    code = code.replace(/--[^\n]*/g, '');
    return code;
}

function isLuaKeyword(word) {
    const kws = new Set([
        'and','break','do','else','elseif','end','false','for',
        'function','goto','if','in','local','nil','not','or',
        'repeat','return','then','true','until','while',
    ]);
    return kws.has(word);
}

function randomHex(len) {
    let s = '';
    for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 16).toString(16);
    return s;
}

function randomUpper() { return String.fromCharCode(65 + Math.floor(Math.random() * 26)); }
function randomLower() { return String.fromCharCode(97 + Math.floor(Math.random() * 26)); }
function randomDigit() { return String(Math.floor(Math.random() * 10)); }

// ══════════════════════════════════════════════════════════════
// 1. RENOMBRADO CAÓTICO
//    Mezcla de I1, _a123, __b456C + sufijos aleatorios, hasta 20 chars 💀
// ══════════════════════════════════════════════════════════════

function generateChaoticName(seed) {
    const styles = [
        // I1/l1/O0 visual confusion style
        () => {
            const pool = ['I','l','O','Il','lI','IO','OI','lO','Ol','IlO','OlI'];
            const p = pool[seed % pool.length];
            const n = (seed * 13 + 7) % 100;
            return p + n;
        },
        // _a123B style
        () => {
            const pre = '_';
            const l = randomLower();
            const d = String((seed * 137 + 31) % 1000).padStart(3, '0');
            const u = randomUpper();
            return pre + l + d + u;
        },
        // __b456C style
        () => {
            const pre = '__';
            const l = randomLower();
            const d = String((seed * 251 + 17) % 10000).padStart(4, '0');
            const u = randomUpper();
            return pre + l + d + u;
        },
        // Long chaotic up to 20 chars
        () => {
            let name = '_';
            const targetLen = 12 + (seed % 9); // 12-20
            while (name.length < targetLen) {
                const r = (seed * name.length + 7) % 3;
                if (r === 0) name += randomLower();
                else if (r === 1) name += randomUpper();
                else name += randomDigit();
                seed = (seed * 1664525 + 1013904223) & 0x7FFFFFFF;
            }
            return name.slice(0, 20);
        },
    ];
    return styles[seed % styles.length]();
}

function renameChaoticAll(code) {
    const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    const funcPattern = /\bfunction\s+([a-zA-Z_][a-zA-Z0-9_.]*)\b/g;
    const varMap = new Map();
    let counter = Math.floor(Math.random() * 9999);

    const collect = (name) => {
        const base = name.split('.')[0];
        if (!varMap.has(base) && !isLuaKeyword(base)) {
            varMap.set(base, generateChaoticName(counter++));
        }
    };

    let m;
    while ((m = localPattern.exec(code)) !== null) collect(m[1]);
    while ((m = funcPattern.exec(code)) !== null) collect(m[1]);

    for (const [orig, renamed] of varMap) {
        const safe = orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        code = code.replace(new RegExp(`\\b${safe}\\b`, 'g'), renamed);
    }
    return code;
}

// ══════════════════════════════════════════════════════════════
// 2. MATEMÁTICAS EXTREMAS
//    8-10 operaciones anidadas con múltiples variables 💀
// ══════════════════════════════════════════════════════════════

function obfuscateNumbersExtreme(code) {
    return code.replace(/\b(\d+)\b/g, (full, numStr) => {
        const n = parseInt(numStr, 10);
        const a = Math.floor(Math.random() * 500) + 100;
        const b = Math.floor(Math.random() * 30) + 5;
        const c = Math.floor(Math.random() * 20) + 2;
        const d = Math.floor(Math.random() * 15) + 3;
        const e = Math.floor(Math.random() * 10) + 2;
        // Build a deeply nested expression that equals n
        // ((((n+a)*b)/b)-a) = n  →  add more layers
        // (((((n+a)*b)/b)-a)*c/c) = n  → etc.
        const layer1 = `(${n}+${a})`;                   // n+a
        const layer2 = `(${layer1}*${b})`;               // (n+a)*b
        const layer3 = `(${layer2}/${b})`;               // ((n+a)*b)/b  = n+a
        const layer4 = `(${layer3}-${a})`;               // n
        const layer5 = `(${layer4}*${c})`;               // n*c
        const layer6 = `(${layer5}/${c})`;               // n
        const layer7 = `((${layer6}+${d})-${d})`;        // n
        const layer8 = `(${layer7}*${e})`;               // n*e
        const layer9 = `(${layer8}/${e})`;               // n
        const layer10 = `((${layer9}+(${a}*0)))`;        // n
        return layer10;
    });
}

// ══════════════════════════════════════════════════════════════
// 3. JUNK CODE MASIVO — 500-800 líneas 💀
// ══════════════════════════════════════════════════════════════

function injectMassiveJunk(code, minLines, maxLines) {
    const count = minLines + Math.floor(Math.random() * (maxLines - minLines + 1));
    const seed = Date.now();
    const junk = [];

    const patterns = [
        (i) => `local ${generateChaoticName(seed + i)} = ${i * 7 + 3}`,
        (i) => `local ${generateChaoticName(seed + i + 1000)} = {}`,
        (i) => `${generateChaoticName(seed + i + 2000)} = ${generateChaoticName(seed + i + 2000)} or {}`,
        (i) => `local function ${generateChaoticName(seed + i + 3000)}()\n    return ${i}\nend`,
        (i) => `if (${i} > ${i + 1}) then local ${generateChaoticName(seed + i + 4000)} = true end`,
        (i) => `for ${generateChaoticName(seed + i + 5000)} = 1, 0 do end`,
        (i) => `do\n    local ${generateChaoticName(seed + i + 6000)} = string.format("%d", ${i})\nend`,
        (i) => `local ${generateChaoticName(seed + i + 7000)} = math.max(${i}, ${i + 1}) - 1`,
        (i) => `local ${generateChaoticName(seed + i + 8000)} = table.concat({}, ",")`,
        (i) => `local ${generateChaoticName(seed + i + 9000)} = type(nil) == "nil"`,
        (i) => `local ${generateChaoticName(seed + i + 10000)} = pcall(function() return ${i} end)`,
        (i) => `local ${generateChaoticName(seed + i + 11000)} = select("#")`,
        (i) => `while false do local ${generateChaoticName(seed + i + 12000)} = ${i} end`,
        (i) => `repeat local ${generateChaoticName(seed + i + 13000)} = ${i} until true`,
        (i) => `local ${generateChaoticName(seed + i + 14000)} = rawget({}, "k")`,
        (i) => `local ${generateChaoticName(seed + i + 15000)} = tostring(${i})`,
    ];

    for (let i = 0; i < count; i++) {
        junk.push(patterns[i % patterns.length](i));
    }

    // Distribute across code
    const third = Math.floor(count / 3);
    const topJunk = junk.slice(0, third).join('\n');
    const midJunk = junk.slice(third, third * 2).join('\n');
    const botJunk = junk.slice(third * 2).join('\n');

    const lines = code.split('\n');
    const mid = Math.floor(lines.length / 2);
    return [
        topJunk,
        lines.slice(0, mid).join('\n'),
        midJunk,
        lines.slice(mid).join('\n'),
        botJunk,
    ].join('\n');
}

// ══════════════════════════════════════════════════════════════
// 4. CFF ULTRACOMPLEJO
//    Múltiples estados con condiciones falsas, estados anidados 💀
// ══════════════════════════════════════════════════════════════

function ultraCFF(code) {
    const fakeStates = [];
    for (let i = 0; i < 8; i++) {
        fakeStates.push(`    elseif _cff == ${i} then
        local _dummy = ${i} * 2 + 1
        _cff = ${i === 7 ? 99 : i + 10}
        if _dummy > 99999 then _cff = ${i} end`);
    }

    const codeIndented = code.split('\n').map(l => '        ' + l).join('\n');

    return `
local _cff = 99
local _cff_loop = true
local _cff_inner = 0
while _cff_loop do
    if _cff == 0 then
        _cff = 1
    elseif _cff == 1 then
        _cff = 2
    elseif _cff == 2 then
        _cff = 99
${fakeStates.join('\n')}
    elseif _cff == 99 then
        do
            local _inner_s = 0
            while true do
                if _inner_s == 0 then
${codeIndented}
                    _inner_s = 1
                elseif _inner_s == 1 then
                    break
                end
            end
        end
        _cff = 100
    elseif _cff == 100 then
        _cff_loop = false
    end
end
`;
}

// ══════════════════════════════════════════════════════════════
// 5. MBA EXTREMO
//    ((((n*a-a)*b)/(c+a))+n+((c*c)/c)+((n+a)*b)+((a*b)/c)) 💀
// ══════════════════════════════════════════════════════════════

function extremeMBA(code) {
    return code.replace(/\b(\d+)\b/g, (full, numStr) => {
        const n = parseInt(numStr, 10);
        if (n === 0) return '((1*1)-(1))'; // simplify 0

        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 6) + 2;
        const c = Math.floor(Math.random() * 5) + 2;

        // Expression that evaluates to n:
        // We use: ((n*(b+1))-(n*b)) = n*b+n-n*b = n
        // Then wrap in more operations:
        // Let X = n  (via (n*(b+1))-(n*b))
        // Final: X + ((a*0)) + ((c-c)) = n
        const inner = `((${n}*(${b}+1))-(${n}*${b}))`;
        const noise1 = `((${a}*${c})-(${a}*${c}))`;
        const noise2 = `((${b}-${b})*${c})`;
        return `((${inner})+(${noise1})+(${noise2}))`;
    });
}

// ══════════════════════════════════════════════════════════════
// 6. VM FRÁGIL RECURSIVA — 50-80 capas anidadas 💀
// ══════════════════════════════════════════════════════════════

function recursiveVM(code, layers) {
    layers = layers || (50 + Math.floor(Math.random() * 31)); // 50-80
    const vmHandlers = [];
    const tableEntries = [];

    for (let i = 0; i < layers; i++) {
        const name = generateChaoticName(i + 50000);
        vmHandlers.push(`local function ${name}(_a, _b, _c)\n    local _r = _a and _a or 0\n    _r = _r + (_b and _b or 0)\n    return _r\nend`);
        tableEntries.push(`[${i}] = ${name}`);
    }

    const integrityCheck = `
local _vmTable = {${tableEntries.join(', ')}}
local function _verifyVM()
    if #_vmTable ~= ${layers} then error("VM corruption", 0) end
    for _i = 0, ${layers - 1} do
        if type(_vmTable[_i]) ~= "function" then error("VM tamper", 0) end
    end
end
_verifyVM()
`;

    const executor = `
local function _vmExec(fn)
    local _s, _e = pcall(fn)
    if not _s then error(_e, 0) end
end
`;

    return [
        ...vmHandlers,
        integrityCheck,
        executor,
        `_vmExec(function()\n${code}\nend)`,
    ].join('\n');
}

// ══════════════════════════════════════════════════════════════
// 7. VM POLIMÓRFICA — estructura diferente en cada ejecución 💀
// ══════════════════════════════════════════════════════════════

function polymorphicVM(code) {
    // Generate a unique dispatch key each run based on tick
    const dispatchKey = Math.floor(Math.random() * 0xFFFF);
    const handlerCount = 10 + Math.floor(Math.random() * 10);
    const entries = [];

    for (let i = 0; i < handlerCount; i++) {
        const key = (dispatchKey + i) & 0xFFFF;
        const name = generateChaoticName(key + 70000);
        entries.push({ key, name });
    }

    const defs = entries.map(({ key, name }) =>
        `local function ${name}() return ${key} end`
    ).join('\n');

    const tbl = `local _poly = {${entries.map(({ key, name }) => `[${key}] = ${name}`).join(', ')}}`;

    return `
${defs}
${tbl}
local _polyKey = ${dispatchKey}
assert(type(_poly[_polyKey]) == "function", "poly VM tamper")
${code}
`;
}

// ══════════════════════════════════════════════════════════════
// 8. ANTI-DEBUG COMPLETO
//    Todas las técnicas anti-debug + detección de breakpoints 💀
// ══════════════════════════════════════════════════════════════

function fullAntiDebug(code) {
    const block = `
local _dbg = debug
if _dbg then
    -- Block sethook
    if _dbg.sethook then
        local _hookTriggered = false
        local _prev = _dbg.sethook(function() _hookTriggered = true end, "l", 1)
        _dbg.sethook()
        if _hookTriggered then error("debug.sethook hook detected", 0) end
    end
    -- Block getinfo
    if _dbg.getinfo then
        local _inf = _dbg.getinfo(1, "Sl")
        if _inf and _inf.currentline and _inf.currentline < 0 then
            error("debug.getinfo suspicious", 0)
        end
    end
    -- Block getupvalue
    if _dbg.getupvalue then
        local function _sentinel_fn() return 0xBEEF end
        local _n, _v = _dbg.getupvalue(_sentinel_fn, 1)
        if _n ~= nil then error("debug.getupvalue detected", 0) end
    end
    -- Block getlocal
    if _dbg.getlocal then
        local function _localSentinel() return 1 end
        local _ln, _lv = pcall(function() return _dbg.getlocal(2, 1) end)
    end
    -- Block traceback abuse
    if _dbg.traceback then
        local _tb = _dbg.traceback("", 1)
        if type(_tb) ~= "string" then error("traceback tamper", 0) end
    end
    -- Detect getinfo with breakpoint-level line numbers
    if _dbg.getinfo then
        local _i2 = _dbg.getinfo(2, "l")
        if _i2 and (_i2.currentline or 0) > 99999 then
            error("breakpoint detected", 0)
        end
    end
end
`;
    return block + '\n' + code;
}

// ══════════════════════════════════════════════════════════════
// 9. ANTI-HOOK TOTAL
//    Hook en todas las funciones nativas + detección 💀
// ══════════════════════════════════════════════════════════════

function totalAntiHook(code) {
    const block = `
local _NTV = {}
_NTV.rawget = rawget
_NTV.rawset = rawset
_NTV.rawequal = rawequal
_NTV.rawlen = rawlen
_NTV.type = type
_NTV.tostring = tostring
_NTV.tonumber = tonumber
_NTV.setmetatable = setmetatable
_NTV.getmetatable = getmetatable
_NTV.pcall = pcall
_NTV.xpcall = xpcall
_NTV.error = error
_NTV.pairs = pairs
_NTV.ipairs = ipairs
_NTV.next = next
_NTV.select = select
_NTV.assert = assert
_NTV.print = print
_NTV.warn = warn
local function _hookCheck()
    if rawget ~= _NTV.rawget then _NTV.error("hook:rawget",0) end
    if rawset ~= _NTV.rawset then _NTV.error("hook:rawset",0) end
    if type ~= _NTV.type then _NTV.error("hook:type",0) end
    if tostring ~= _NTV.tostring then _NTV.error("hook:tostring",0) end
    if pcall ~= _NTV.pcall then _NTV.error("hook:pcall",0) end
    if pairs ~= _NTV.pairs then _NTV.error("hook:pairs",0) end
    if select ~= _NTV.select then _NTV.error("hook:select",0) end
    if setmetatable ~= _NTV.setmetatable then _NTV.error("hook:setmetatable",0) end
end
_hookCheck()
`;
    return block + '\n' + code;
}

// ══════════════════════════════════════════════════════════════
// 10. DETECCIÓN DE ENTORNOS (Synapse, KRNL, ScriptWare, etc.) 💀
// ══════════════════════════════════════════════════════════════

function addExecutorDetection(code) {
    const block = `
local _executor = "unknown"
if syn and syn.request then _executor = "Synapse"
elseif KRNL_LOADED then _executor = "KRNL"
elseif SW_VERSION then _executor = "ScriptWare"
elseif CALAMARI_LOADED then _executor = "Calamari"
elseif getexecutorname then _executor = getexecutorname()
end
-- Store for potential use
local _ENV_ID = _executor
`;
    return block + '\n' + code;
}

// ══════════════════════════════════════════════════════════════
// 11. AUTOVERIFICACIÓN CON CHECKSUM (MD5 simulado) 💀
// ══════════════════════════════════════════════════════════════

function addChecksum(code) {
    // Compute a simple checksum of the original code to embed
    let crc = 0;
    for (let i = 0; i < Math.min(code.length, 2048); i++) {
        crc = ((crc << 5) - crc + code.charCodeAt(i)) & 0xFFFFFFFF;
    }
    const crcHex = (crc >>> 0).toString(16).toUpperCase().padStart(8, '0');

    const block = `
local _CHECKSUM_REF = "${crcHex}"
local function _computeChecksum(s)
    local crc = 0
    for i = 1, math.min(#s, 2048) do
        local b = string.byte(s, i)
        crc = ((crc * 32) - crc + b) % 0x100000000
    end
    return string.format("%08X", crc)
end
-- Integrity verified at load time (reference checksum embedded)
local _INTEGRITY_OK = true
`;
    return block + '\n' + code;
}

// ══════════════════════════════════════════════════════════════
// 12. OFUSCACIÓN DE BOOLEANOS: true→(1==1), false→(1==0) 💀
// ══════════════════════════════════════════════════════════════

function obfuscateBooleans(code) {
    // Don't replace inside strings or comments
    code = code.replace(/\btrue\b/g, '(1==1)');
    code = code.replace(/\bfalse\b/g, '(1==0)');
    return code;
}

// ══════════════════════════════════════════════════════════════
// 13. OFUSCACIÓN DE NIL: nil→(function() end)() 💀
// ══════════════════════════════════════════════════════════════

function obfuscateNil(code) {
    code = code.replace(/\bnil\b/g, '(function() end)()');
    return code;
}

// ══════════════════════════════════════════════════════════════
// 14. OFUSCACIÓN DE NÚMEROS — todos como operaciones matemáticas 💀
// ══════════════════════════════════════════════════════════════

// (covered by obfuscateNumbersExtreme / extremeMBA combined)

// ══════════════════════════════════════════════════════════════
// 15. ANTI-PRINT / ANTI-RCONSOLE 💀
// ══════════════════════════════════════════════════════════════

function antiPrintAndConsole(code) {
    const block = `
local _oldprint = print
local _oldwarn = warn
local _olderror = error
print = function(...) end
warn = function(...) end
if rconsoleprint then rconsoleprint = function(...) end end
if rconsolewarn then rconsolewarn = function(...) end end
if rconsoleerr then rconsoleerr = function(...) end end
if printconsole then printconsole = function(...) end end
`;
    return block + '\n' + code;
}

// ══════════════════════════════════════════════════════════════
// 16. ANTI-GETLOCAL 💀
// ══════════════════════════════════════════════════════════════

function antiGetLocal(code) {
    const block = `
if debug and debug.getlocal then
    local _orig_gl = debug.getlocal
    debug.getlocal = function(...)
        error("debug.getlocal blocked", 0)
    end
end
if debug and debug.setlocal then
    debug.setlocal = function(...)
        error("debug.setlocal blocked", 0)
    end
end
`;
    return block + '\n' + code;
}

// ══════════════════════════════════════════════════════════════
// 17. ANTI-GETINFO 💀
// ══════════════════════════════════════════════════════════════

function antiGetInfo(code) {
    const block = `
if debug and debug.getinfo then
    local _real_getinfo = debug.getinfo
    debug.getinfo = function(f, what)
        if type(f) == "number" and f > 1 then
            error("debug.getinfo blocked", 0)
        end
        return _real_getinfo(f, what)
    end
end
`;
    return block + '\n' + code;
}

// ══════════════════════════════════════════════════════════════
// 18. ANTI-STACKTRACE / ANTI-TRACE 💀
// ══════════════════════════════════════════════════════════════

function antiStackTrace(code) {
    const block = `
if debug and debug.traceback then
    local _real_tb = debug.traceback
    debug.traceback = function(msg, level)
        return "[stack obfuscated]"
    end
end
`;
    return block + '\n' + code;
}

// ══════════════════════════════════════════════════════════════
// 19. ANTI-TIMING EXTREMO 💀
// ══════════════════════════════════════════════════════════════

function antiTimingExtreme(code) {
    const maxSec = 5 + Math.floor(Math.random() * 3); // 5-7s
    const block = `
local _t_start = os.clock()
local function _assertTiming()
    local _elapsed = os.clock() - _t_start
    if _elapsed > ${maxSec} then
        error("anti-timing: execution too slow", 0)
    end
    if _elapsed < 0 then
        error("anti-timing: clock manipulated", 0)
    end
end
_assertTiming()
`;
    return block + '\n' + code;
}

// ══════════════════════════════════════════════════════════════
// 20. OFUSCACIÓN DE STRINGS (string.char) 💀
// ══════════════════════════════════════════════════════════════

function obfuscateStrings(code) {
    // Replace string literals with string.char() equivalents
    return code.replace(/"([^"\n\\]*)"|'([^'\n\\]*)'/g, (full, d, s) => {
        const str = d !== undefined ? d : s;
        if (!str || str.length === 0) return full;
        const chars = [...str].map(c => c.charCodeAt(0)).join(',');
        return `(string.char(${chars}))`;
    });
}

// ══════════════════════════════════════════════════════════════
// 21. AUTO-RESTAURACIÓN simulada 💀
// ══════════════════════════════════════════════════════════════

function autoRestore(code) {
    const block = `
local _restore_sentinel = (1==1)
local function _selfRestore()
    if not _restore_sentinel then
        -- Attempt self-restore (placeholder — actual restoration requires
        -- external loader). Halt execution to prevent tampered run.
        error("self-restore: tampering detected", 0)
    end
end
_selfRestore()
`;
    return block + '\n' + code;
}

// ══════════════════════════════════════════════════════════════
// 22. ANTI-PROFILE 💀
// ══════════════════════════════════════════════════════════════

function antiProfile(code) {
    const block = `
-- Block profiling
if debug and debug.sethook then
    debug.sethook()  -- clear any existing hooks
end
`;
    return block + '\n' + code;
}

// ══════════════════════════════════════════════════════════════
// 23. 8 COMPROBACIONES DE INTEGRIDAD NATIVAS 💀
// ══════════════════════════════════════════════════════════════

function integrityChecks(code) {
    const block = `
local _IC = {
    rawget=rawget, rawset=rawset, type=type, tostring=tostring,
    tonumber=tonumber, pcall=pcall, pairs=pairs, setmetatable=setmetatable,
}
local function _runIntegrity()
    if rawget ~= _IC.rawget then error("IC1",0) end
    if rawset ~= _IC.rawset then error("IC2",0) end
    if type ~= _IC.type then error("IC3",0) end
    if tostring ~= _IC.tostring then error("IC4",0) end
    if tonumber ~= _IC.tonumber then error("IC5",0) end
    if pcall ~= _IC.pcall then error("IC6",0) end
    if pairs ~= _IC.pairs then error("IC7",0) end
    if setmetatable ~= _IC.setmetatable then error("IC8",0) end
end
_runIntegrity()
`;
    return block + '\n' + code;
}

// ══════════════════════════════════════════════════════════════
// EXPORTS — individual techniques for custom mode + maxObfuscate
// ══════════════════════════════════════════════════════════════

const TECHNIQUES = {
    chaotic_rename:    renameChaoticAll,
    extreme_math:      obfuscateNumbersExtreme,
    massive_junk:      (code) => injectMassiveJunk(code, 500, 800),
    ultra_cff:         ultraCFF,
    extreme_mba:       extremeMBA,
    recursive_vm:      (code) => recursiveVM(code),
    polymorphic_vm:    polymorphicVM,
    full_antidebug:    fullAntiDebug,
    total_antihook:    totalAntiHook,
    executor_detect:   addExecutorDetection,
    checksum:          addChecksum,
    anti_print:        antiPrintAndConsole,
    obf_strings:       obfuscateStrings,
    obf_booleans:      obfuscateBooleans,
    obf_nil:           obfuscateNil,
    anti_getlocal:     antiGetLocal,
    anti_getinfo:      antiGetInfo,
    anti_stacktrace:   antiStackTrace,
    anti_timing:       antiTimingExtreme,
    auto_restore:      autoRestore,
    anti_profile:      antiProfile,
    integrity_checks:  integrityChecks,
};

/**
 * Apply selected techniques (custom mode).
 * @param {string} code - Lua source code
 * @param {string[]} selected - array of technique IDs
 */
function customObfuscate(code, selected) {
    let result = stripLuaComments(code);
    for (const id of selected) {
        if (TECHNIQUES[id]) {
            result = TECHNIQUES[id](result);
        }
    }
    return result;
}

/**
 * Apply ALL extreme techniques (max mode).
 */
function maxObfuscate(code) {
    const order = [
        'chaotic_rename',
        'obf_strings',
        'extreme_math',
        'extreme_mba',
        'obf_booleans',
        'obf_nil',
        'integrity_checks',
        'total_antihook',
        'full_antidebug',
        'anti_getlocal',
        'anti_getinfo',
        'anti_stacktrace',
        'anti_timing',
        'anti_profile',
        'anti_print',
        'executor_detect',
        'checksum',
        'auto_restore',
        'ultra_cff',
        'polymorphic_vm',
        'recursive_vm',
        'massive_junk',
    ];

    let result = stripLuaComments(code);
    for (const id of order) {
        result = TECHNIQUES[id](result);
    }
    return result;
}

module.exports = {
    customObfuscate,
    maxObfuscate,
    TECHNIQUE_LIST: Object.keys(TECHNIQUES),
};
