// ============================================================
// HARD OBFUSCATOR — Medium/High aggressiveness techniques
// Techniques: Aggressive renaming (_a123B/__b456C), Complex math,
//             Extensive junk code (150-200 lines), Advanced CFF,
//             MBA, Multilayer VM (30 handlers), Anti-debug,
//             Anti-timing (5-6s), Anti-getupvalue, 8 integrity checks
// ============================================================

'use strict';

// ── Base helpers ─────────────────────────────────────────────

function stripLuaComments(code) {
    code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
    code = code.replace(/--[^\n]*/g, '');
    return code;
}

const CHARS_UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const CHARS_LOWER = 'abcdefghjkmnpqrstuvwxyz';
const CHARS_DIGIT = '0123456789';

function randChar(pool) {
    return pool[Math.floor(Math.random() * pool.length)];
}

function generateAggressiveName(seed) {
    const prefix = Math.random() < 0.5 ? '_' : '__';
    const letter1 = CHARS_LOWER[seed % CHARS_LOWER.length];
    const digits = String(seed * 137 + 31).padStart(3, '0').slice(-3);
    const letter2 = CHARS_UPPER[(seed * 7 + 5) % CHARS_UPPER.length];
    const suffixLen = 1 + (seed % 3);
    let suffix = '';
    for (let i = 0; i < suffixLen; i++) {
        suffix += randChar(i % 2 === 0 ? CHARS_UPPER : CHARS_LOWER);
    }
    return `${prefix}${letter1}${digits}${letter2}${suffix}`;
}

function renameVarsAggressive(code) {
    const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    const funcPattern = /\bfunction\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    const varMap = new Map();
    let counter = 0;

    const collectName = (name) => {
        if (!varMap.has(name) && !isLuaKeyword(name)) {
            varMap.set(name, generateAggressiveName(counter++));
        }
    };

    let m;
    while ((m = localPattern.exec(code)) !== null) collectName(m[1]);
    while ((m = funcPattern.exec(code)) !== null) collectName(m[1]);

    for (const [orig, renamed] of varMap) {
        const safe = orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        code = code.replace(new RegExp(`\\b${safe}\\b`, 'g'), renamed);
    }
    return code;
}

function obfuscateNumbersComplex(code) {
    return code.replace(/\b(\d+)\b/g, (full, numStr) => {
        const n = parseInt(numStr, 10);
        const a = Math.floor(Math.random() * 900) + 100;
        const b = Math.floor(Math.random() * 40) + 10;
        return `((((${n}+${a})*${b})/${b})-${a})`;
    });
}

function applyMBA(code) {
    return code.replace(/\b(\d+)\b/g, (full, numStr) => {
        const n = parseInt(numStr, 10);
        const b = Math.floor(Math.random() * 10) + 1;
        return `(((${n}*(${b}+1))-(${n}*${b})))`;
    });
}

function buildMultilayerVM(code) {
    const handlers = [];
    const tableEntries = [];

    for (let i = 0; i < 30; i++) {
        const fname = generateAggressiveName(i + 1000);
        const body = buildFakeHandlerBody(i);
        handlers.push(`local function ${fname}(${buildFakeParams(i)})\n${body}\nend`);
        tableEntries.push(`[${i}] = ${fname}`);
    }

    const vmTable = `local _VM = {${tableEntries.join(', ')}}`;

    const executor = `
local function _exec(_code_fn)
    local _ok, _res = pcall(_code_fn)
    if not _ok then
        error(_res, 0)
    end
    return _res
end
local _VM_STATE = 0
`;

    const wrapped = `_exec(function()\n${code}\nend)`;

    return [
        ...handlers,
        vmTable,
        executor,
        wrapped,
    ].join('\n');
}

function buildFakeParams(i) {
    const count = (i % 3) + 1;
    return Array.from({ length: count }, (_, j) => `_p${i}_${j}`).join(', ');
}

function buildFakeHandlerBody(i) {
    const lines = [];
    lines.push(`    local _r = ${i} + 1`);
    if (i % 2 === 0) lines.push(`    _r = _r * ${i + 2} - ${i + 2}`);
    if (i % 3 === 0) lines.push(`    local _t = {}; _t[1] = _r`);
    lines.push(`    return ${i % 4 === 0 ? '_r' : 'nil'}`);
    return lines.join('\n');
}

function advancedCFF(code) {
    const codeLines = code.split('\n').map(l => '        ' + l).join('\n');
    return `
local _s = 3
local _cff_done = false
while not _cff_done do
    if _s == 0 then
        _s = 3
    elseif _s == 1 then
        local _unused = math.random and math.random(1,1) or 1
        _s = 3
    elseif _s == 2 then
        _s = 0
    elseif _s == 3 then
${codeLines}
        _s = 4
    elseif _s == 4 then
        _cff_done = true
    end
end
`;
}

function injectExtendedJunk(code, minLines, maxLines) {
    const count = minLines + Math.floor(Math.random() * (maxLines - minLines + 1));
    const top = [];
    const mid = [];
    const bot = [];

    const patterns = [
        (i) => `local ${generateAggressiveName(i + 200)} = ${i * 7 + 3}`,
        (i) => `local ${generateAggressiveName(i + 300)} = {}`,
        (i) => `${generateAggressiveName(i + 200)} = ${generateAggressiveName(i + 200)} or {}`,
        (i) => `local function ${generateAggressiveName(i + 400)}()\n    return ${i}\nend`,
        (i) => `if (${i} == ${i + 1}) then local ${generateAggressiveName(i + 500)} = true end`,
        (i) => `do\n    local ${generateAggressiveName(i + 600)} = string.format("%d", ${i})\nend`,
        (i) => `local ${generateAggressiveName(i + 700)} = math.floor(${i + 0.5})`,
        (i) => `local ${generateAggressiveName(i + 800)} = type(nil) == "nil"`,
        (i) => `for ${generateAggressiveName(i + 900)} = 1, 0 do end`,
        (i) => `local ${generateAggressiveName(i + 1100)} = tostring(${i})`,
        (i) => `local ${generateAggressiveName(i + 1200)} = pcall(function() return ${i} end)`,
    ];

    for (let i = 0; i < count; i++) {
        const pat = patterns[i % patterns.length];
        const line = pat(i);
        if (i < count / 3) top.push(line);
        else if (i < (2 * count) / 3) mid.push(line);
        else bot.push(line);
    }

    const codeLines = code.split('\n');
    const midPoint = Math.floor(codeLines.length / 2);
    const firstHalf = codeLines.slice(0, midPoint).join('\n');
    const secondHalf = codeLines.slice(midPoint).join('\n');

    return `${top.join('\n')}\n${firstHalf}\n${mid.join('\n')}\n${secondHalf}\n${bot.join('\n')}`;
}

function addAntiDebug(code) {
    const antiDebug = `
local _dbg = debug
if _dbg then
    if _dbg.sethook then
        local _hookTriggered = false
        local _prev = _dbg.sethook(function() _hookTriggered = true end, "l", 1)
        _dbg.sethook()
        if _hookTriggered then error("debug.sethook hook detected", 0) end
    end
    if _dbg.getinfo then
        local _inf = _dbg.getinfo(1, "Sl")
        if _inf and _inf.currentline and _inf.currentline < 0 then
            error("debug.getinfo suspicious", 0)
        end
    end
    if _dbg.getupvalue then
        local function _sentinel_fn() return 0xBEEF end
        local _n, _v = _dbg.getupvalue(_sentinel_fn, 1)
        if _n ~= nil then error("debug.getupvalue detected", 0) end
    end
end
`;
    return antiDebug + '\n' + code;
}

function addAntiTimingHard(code) {
    const maxSec = 5 + Math.floor(Math.random() * 2);
    return `
local _start = os.clock()
local function _checkTiming()
    if os.clock() - _start > ${maxSec} then
        error("timing violation", 0)
    end
end
_checkTiming()
` + '\n' + code;
}

function addIntegrityChecks(code) {
    const checks = `
local _natives = {
    rawget = rawget, rawset = rawset, rawequal = rawequal,
    type = type, tostring = tostring, tonumber = tonumber,
    pcall = pcall, error = error, pairs = pairs, ipairs = ipairs,
    select = select, unpack = unpack or table.unpack,
    setmetatable = setmetatable, getmetatable = getmetatable,
    string = string, table = table, math = math,
}
local function _integrityCheck1() if rawget ~= _natives.rawget then error("integrity:rawget",0) end end
local function _integrityCheck2() if rawset ~= _natives.rawset then error("integrity:rawset",0) end end
local function _integrityCheck3() if type ~= _natives.type then error("integrity:type",0) end end
local function _integrityCheck4() if tostring ~= _natives.tostring then error("integrity:tostring",0) end end
local function _integrityCheck5() if pcall ~= _natives.pcall then error("integrity:pcall",0) end end
local function _integrityCheck6() if pairs ~= _natives.pairs then error("integrity:pairs",0) end end
local function _integrityCheck7() if setmetatable ~= _natives.setmetatable then error("integrity:setmetatable",0) end end
local function _integrityCheck8() if getmetatable ~= _natives.getmetatable then error("integrity:getmetatable",0) end end
_integrityCheck1(); _integrityCheck2(); _integrityCheck3(); _integrityCheck4()
_integrityCheck5(); _integrityCheck6(); _integrityCheck7(); _integrityCheck8()
`;
    return checks + '\n' + code;
}

function isLuaKeyword(word) {
    const kws = new Set([
        'and','break','do','else','elseif','end','false','for',
        'function','goto','if','in','local','nil','not','or',
        'repeat','return','then','true','until','while',
    ]);
    return kws.has(word);
}

// ── Main export ───────────────────────────────────────────────

module.exports = function hardObfuscate(code) {
    let result = stripLuaComments(code);
    result = renameVarsAggressive(result);
    result = obfuscateNumbersComplex(result);
    result = applyMBA(result);
    result = advancedCFF(result);
    result = addAntiTimingHard(result);
    result = addAntiDebug(result);
    result = addIntegrityChecks(result);
    result = buildMultilayerVM(result);
    result = injectExtendedJunk(result, 150, 200);
    return result;
};
