// ============================================================
// NORMAL OBFUSCATOR — Low/Medium aggressiveness techniques
// Techniques: Renaming (I1/l1/v1), Basic math, Junk code (80-100 lines),
//             Control Flow Flattening (if→while+state), Keyword mapping,
//             Simple VM (25 handlers), Anti-timing, Basic anti-hook
// ============================================================

'use strict';

// ── Base helpers ─────────────────────────────────────────────

function stripLuaComments(code) {
    // Remove --[[ long comments ]]
    code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
    // Remove -- single-line comments
    code = code.replace(/--[^\n]*/g, '');
    return code;
}

// Confusing name pool: I (uppercase i) and l (lowercase L) look like 1
const NORMAL_NAME_POOL = ['I', 'l', 'v', 'O', 'Il', 'lI', 'Ol', 'lO', 'IO', 'OI'];

function generateNormalName(index) {
    const prefix = NORMAL_NAME_POOL[index % NORMAL_NAME_POOL.length];
    const num = Math.floor(index / NORMAL_NAME_POOL.length);
    return num === 0 ? `${prefix}1` : `${prefix}${num}1`;
}

function renameVarsNormal(code) {
    const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    const varMap = new Map();
    let counter = 0;
    let match;

    while ((match = localPattern.exec(code)) !== null) {
        const name = match[1];
        if (!varMap.has(name) && !isLuaKeyword(name)) {
            varMap.set(name, generateNormalName(counter++));
        }
    }

    for (const [original, renamed] of varMap) {
        const safe = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        code = code.replace(new RegExp(`\\b${safe}\\b`, 'g'), renamed);
    }

    return code;
}

function obfuscateNumbersBasic(code) {
    // Wrap integer literals in simple arithmetic so they still evaluate correctly
    return code.replace(/\b(\d+)\b/g, (full, num) => {
        const n = parseInt(num, 10);
        if (n === 0) return '(1-1)';
        const c = Math.floor(Math.random() * 9) + 1;
        return `(${n + c}-${c})`;
    });
}

const KEYWORD_MAP = {
    'ScreenGui':         strToStringChar('ScreenGui'),
    'TextLabel':         strToStringChar('TextLabel'),
    'TextButton':        strToStringChar('TextButton'),
    'Frame':             strToStringChar('Frame'),
    'ImageLabel':        strToStringChar('ImageLabel'),
    'ScrollingFrame':    strToStringChar('ScrollingFrame'),
    'TextBox':           strToStringChar('TextBox'),
    'Players':           strToStringChar('Players'),
    'Workspace':         strToStringChar('Workspace'),
    'RunService':        strToStringChar('RunService'),
    'UserInputService':  strToStringChar('UserInputService'),
    'TweenService':      strToStringChar('TweenService'),
    'HttpService':       strToStringChar('HttpService'),
    'ReplicatedStorage': strToStringChar('ReplicatedStorage'),
    'ServerScriptService': strToStringChar('ServerScriptService'),
    'StarterGui':        strToStringChar('StarterGui'),
    'StarterPlayer':     strToStringChar('StarterPlayer'),
};

function strToStringChar(s) {
    const codes = [...s].map(c => c.charCodeAt(0)).join(',');
    return `string.char(${codes})`;
}

function mapRobloxKeywords(code) {
    for (const [kw, replacement] of Object.entries(KEYWORD_MAP)) {
        const re = new RegExp(`(['"])${kw}\\1`, 'g');
        code = code.replace(re, `(${replacement})`);
        const re2 = new RegExp(`game\\["${kw}"\\]`, 'g');
        code = code.replace(re2, `game[(${replacement})]`);
    }
    return code;
}

function buildSimpleVM(code) {
    const handlers = [];
    const dispatchEntries = [];

    for (let i = 0; i < 25; i++) {
        const fname = `_h${generateNormalName(i)}`;
        const body = [
            `local _x = ${i + 1}`,
            `_x = _x * ${i + 2} - ${i + 2}`,
            `return _x`,
        ].join('; ');
        handlers.push(`local function ${fname}() ${body} end`);
        dispatchEntries.push(`[${i}] = ${fname}`);
    }

    const dispatchTable = `local _dispatch = {${dispatchEntries.join(', ')}}`;

    const antiCheck = `
local function _runVM(fn)
    local _ok, _err = pcall(fn)
    if not _ok then error(_err, 2) end
end
`;

    const wrapped = `_runVM(function()\n${code}\nend)`;

    return [
        ...handlers,
        dispatchTable,
        antiCheck,
        wrapped,
    ].join('\n');
}

function injectJunkCode(code, minLines, maxLines) {
    const count = minLines + Math.floor(Math.random() * (maxLines - minLines + 1));
    const lines = [];

    const junkPatterns = [
        (i) => `local _jv${i} = ${i + 1} * ${i + 2} - ${i + 2}`,
        (i) => `local _jt${i} = {}; _jt${i}[${i + 1}] = ${i * 3 + 1}`,
        (i) => `local function _jf${i}() return ${i} + (${i} - ${i}) end`,
        (i) => `if (${i} > ${i + 1}) then local _jd${i} = true end`,
        (i) => `for _ji${i} = 1, 0 do local _jx${i} = _ji${i} end`,
        (i) => `local _js${i} = string.len("junk_${i}")`,
        (i) => `local _jn${i} = math.floor(${i}.0)`,
        (i) => `do local _jb${i} = false; _jb${i} = not _jb${i} end`,
    ];

    for (let i = 0; i < count; i++) {
        const pat = junkPatterns[i % junkPatterns.length];
        lines.push(pat(i));
    }

    const top = lines.slice(0, Math.floor(count / 2)).join('\n');
    const bot = lines.slice(Math.floor(count / 2)).join('\n');

    return `${top}\n${code}\n${bot}`;
}

function addAntiTiming(code, maxSeconds) {
    const antiTiming = `
local _t0 = os.clock()
local function _checkTime()
    if os.clock() - _t0 > ${maxSeconds} then
        error("timeout", 2)
    end
end
_checkTime()
`;
    return antiTiming + '\n' + code;
}

function addBasicAntiHook(code) {
    const antiHook = `
local _rawget = rawget
local _rawset = rawset
local _rawequal = rawequal
local _type = type
local _tostring = tostring
local _tonumber = tonumber
local _setmetatable = setmetatable
local _getmetatable = getmetatable
local _pcall = pcall
local _error = error
local _print = print
if _rawget ~= rawget then _error("hook detected", 0) end
if _rawset ~= rawset then _error("hook detected", 0) end
`;
    return antiHook + '\n' + code;
}

function simpleCFF(code) {
    return `
local _state = 0
while true do
    if _state == 0 then
        _state = 1
    elseif _state == 1 then
        ${code.split('\n').join('\n        ')}
        _state = 2
    elseif _state == 2 then
        break
    end
end
`;
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

module.exports = function normalObfuscate(code) {
    let result = stripLuaComments(code);
    result = renameVarsNormal(result);
    result = obfuscateNumbersBasic(result);
    result = mapRobloxKeywords(result);
    result = addAntiTiming(result, 3);
    result = addBasicAntiHook(result);
    result = buildSimpleVM(result);
    result = injectJunkCode(result, 80, 100);
    return result;
};
