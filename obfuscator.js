// ============================================================
// BANANA OBFUSCATOR v4.0 - FULL WITH VM, BYTECODE, ANTI-DEBUG
// ============================================================

const HEADER = `--[[ Protected by Banana Obfuscator v4.0 ]]`;

// ==================== VARIABLES ====================
const CUSTOM_VARS = [
    "a","b","c","d","e","f","g","h","i","j","k","l","m",
    "n","o","p","q","r","s","t","u","v","w","x","y","z",
    "A","B","C","D","E","F","G","H","I","J","K","L","M",
    "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
];

const VM_OPS = [
    "MOVE", "LOADK", "LOADBOOL", "LOADNIL", "GETUPVAL", "SETUPVAL",
    "GETTABUP", "SETTABUP", "GETTABLE", "SETTABLE", "NEWTABLE",
    "SELF", "ADD", "SUB", "MUL", "DIV", "MOD", "POW", "UNM",
    "NOT", "LEN", "CONCAT", "JMP", "EQ", "LT", "LE", "TEST",
    "TESTSET", "CALL", "TAILCALL", "RETURN", "FORLOOP",
    "FORPREP", "TFORLOOP", "SETLIST", "CLOSURE", "VARARG"
];

const HANDLER_POOL = [
    "x","y","z","t","u","v","w","a","b","c","d","e","f",
    "g","h","i","j","k","l","m","n","o","p","q","r","s"
];

// ==================== GENERADOR DE NOMBRES ====================
function generateName() {
    let name = "";
    const len = Math.floor(Math.random() * 8) + 3;
    for (let i = 0; i < len; i++) {
        name += CUSTOM_VARS[Math.floor(Math.random() * CUSTOM_VARS.length)];
    }
    return name;
}

function generateHandler() {
    return HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)] + 
           HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)];
}

function generateXORKey() {
    return Math.floor(Math.random() * 255) + 1;
}

// ==================== REMOVER COMENTARIOS ====================
function removeComments(code) {
    return code
        .replace(/--\[\[[\s\S]*?\]\]/g, '')
        .replace(/--[^\n]*/g, '')
        .trim();
}

// ==================== RENOMBRAR VARIABLES LOCALES ====================
function renameLocals(code) {
    const lines = code.split('\n');
    const varMap = new Map();
    const usedNames = new Set();
    
    for (let line of lines) {
        const matches = line.match(/local\s+(\w+)\s*[=,]/g);
        if (matches) {
            for (const match of matches) {
                const name = match.replace(/local\s+/, '').replace(/[=,].*/, '').trim();
                if (!varMap.has(name) && !usedNames.has(name)) {
                    let newName = generateName();
                    while (usedNames.has(newName)) {
                        newName = generateName();
                    }
                    varMap.set(name, newName);
                    usedNames.add(newName);
                }
            }
        }
        
        const multiMatch = line.match(/local\s+([\w,\s]+)\s*=/);
        if (multiMatch) {
            const names = multiMatch[1].split(',').map(s => s.trim());
            for (const name of names) {
                if (!varMap.has(name) && !usedNames.has(name)) {
                    let newName = generateName();
                    while (usedNames.has(newName)) {
                        newName = generateName();
                    }
                    varMap.set(name, newName);
                    usedNames.add(newName);
                }
            }
        }
    }
    
    let modified = code;
    for (const [oldName, newName] of varMap) {
        const regex = new RegExp(`\\b${oldName}\\b`, 'g');
        modified = modified.replace(regex, newName);
    }
    
    return modified;
}

// ==================== OFUSCAR STRINGS ====================
function obfuscateStrings(code) {
    const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g;
    let modified = code;
    const replacements = [];
    
    let match;
    while ((match = stringRegex.exec(code)) !== null) {
        const full = match[0];
        if (full.length < 4 || full.includes('\\')) continue;
        
        const content = full.slice(1, -1);
        if (content.includes('"') || content.includes('\\') || content.includes('\n')) continue;
        
        const varName = generateName();
        const chars = content.split('').map(c => c.charCodeAt(0)).join(',');
        const replacement = `_s[${varName}]`;
        
        replacements.push({
            original: full,
            replacement: replacement,
            varName: varName,
            chars: chars
        });
    }
    
    if (replacements.length === 0) return code;
    
    let result = 'local _s={} ';
    for (const rep of replacements) {
        result += `_s[${rep.varName}]=string.char(${rep.chars}) `;
        modified = modified.replace(rep.original, rep.replacement);
    }
    
    return result + modified;
}

// ==================== OFUSCAR STRINGS CON XOR ====================
function obfuscateStringsXOR(code) {
    const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g;
    let modified = code;
    const replacements = [];
    const key = generateXORKey();
    
    let match;
    while ((match = stringRegex.exec(code)) !== null) {
        const full = match[0];
        if (full.length < 4 || full.includes('\\')) continue;
        
        const content = full.slice(1, -1);
        if (content.includes('"') || content.includes('\\') || content.includes('\n')) continue;
        
        const encrypted = [];
        for (let i = 0; i < content.length; i++) {
            encrypted.push(content.charCodeAt(i) ^ key);
        }
        
        const varName = generateName();
        const replacement = `_x[${varName}]`;
        
        replacements.push({
            original: full,
            replacement: replacement,
            varName: varName,
            encrypted: encrypted.join(','),
            key: key
        });
    }
    
    if (replacements.length === 0) return code;
    
    let result = `local _x={} local _k=${key} local function _xor(a,b)local r=0 local p=1 while a>0 or b>0 do local ab=a%2 local bb=b%2 if ab~=bb then r=r+p end a=(a-ab)/2 b=(b-bb)/2 p=p*2 end return r end `;
    for (const rep of replacements) {
        result += `_x[${rep.varName}]=function()local t={${rep.encrypted}} local s='' for i=1,#t do s=s..string.char(_xor(t[i],_k)) end return s end `;
        modified = modified.replace(rep.original, `_x[${rep.varName}]()`);
    }
    
    return result + modified;
}

// ==================== OFUSCAR NÚMEROS ====================
function obfuscateNumbers(code) {
    const numRegex = /\b\d+\b/g;
    let modified = code;
    const replacements = [];
    
    let match;
    while ((match = numRegex.exec(code)) !== null) {
        const num = parseInt(match[0]);
        if (num < 3 || num > 1000) continue;
        if ([0,1,2,10,100].includes(num)) continue;
        
        const a = Math.floor(Math.random() * 20) + 5;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = Math.floor(Math.random() * 5) + 1;
        const d = Math.floor(Math.random() * 10) + 1;
        const expr = `(${a}*${b}/${c}+${d}-${d}+${num - (a*b/c)})`;
        
        replacements.push({
            original: match[0],
            replacement: expr
        });
    }
    
    for (const rep of replacements) {
        modified = modified.replace(new RegExp(rep.original, 'g'), rep.replacement);
    }
    
    return modified;
}

// ==================== CÓDIGO MUERTO ====================
function insertDeadCode(code) {
    const deadBlocks = [
        `if false then local ${generateName()}=0 end `,
        `do local ${generateName()}=function() return 1 end end `,
        `local ${generateName()}=nil `,
        `for _=1,0 do end `,
        `if true and false then end `,
        `local ${generateName()}=function(x)return x end `,
        `local ${generateName()}={} `,
        `local ${generateName()}=${Math.floor(Math.random()*1000)}+${Math.floor(Math.random()*1000)}-${Math.floor(Math.random()*1000)} `
    ];
    
    const lines = code.split('\n');
    const count = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < count; i++) {
        const pos = Math.floor(Math.random() * lines.length);
        const dead = deadBlocks[Math.floor(Math.random() * deadBlocks.length)];
        lines.splice(pos, 0, dead);
    }
    
    return lines.join('\n');
}

// ==================== CONTROL FLOW FLATTENING ====================
function flattenControlFlow(code) {
    const lines = code.split('\n');
    const blocks = [];
    let current = [];
    let stateVar = generateName();
    let result = [`local ${stateVar}=1 while true do `];
    let blockCount = 0;
    
    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed.startsWith('--')) continue;
        
        if (trimmed.startsWith('if ') || trimmed.startsWith('for ') || 
            trimmed.startsWith('while ') || trimmed.startsWith('repeat ') ||
            trimmed.startsWith('function ')) {
            if (current.length > 0) {
                blocks.push(current);
                current = [];
                blockCount++;
            }
            current.push(line);
        } else if (trimmed === 'end' || trimmed === 'until') {
            current.push(line);
            if (current.length > 0) {
                blocks.push(current);
                current = [];
                blockCount++;
            }
        } else {
            current.push(line);
        }
    }
    
    if (current.length > 0) {
        blocks.push(current);
        blockCount++;
    }
    
    for (let i = 0; i < blocks.length - 1; i++) {
        if (Math.random() > 0.5) {
            const j = Math.floor(Math.random() * blocks.length);
            [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
        }
    }
    
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i].join('\n');
        const nextState = (i + 1) % blocks.length + 1;
        result.push(`if ${stateVar}==${i+1} then ${block} ${stateVar}=${nextState} `);
    }
    result.push(`elseif ${stateVar}==${blocks.length+1} then break end end `);
    
    return result.join('');
}

// ==================== SUPER OPERADORES ====================
function generateSuperOperators(code) {
    const lines = code.split('\n');
    let result = [];
    let i = 0;
    
    while (i < lines.length) {
        const line = lines[i];
        const next = lines[i + 1] || '';
        
        if (line.includes(' = ') && next.includes(' = ') && 
            (line.includes(' + ') || line.includes(' * '))) {
            
            const var1 = line.match(/local\s+(\w+)\s*=/);
            const var2 = next.match(/local\s+(\w+)\s*=/);
            
            if (var1 && var2) {
                const name = generateName();
                result.push(`local ${name}=function()`);
                result.push(`local ${var1[1]},${var2[1]}`);
                result.push(`${var1[1]}=${line.replace(/local\s+\w+\s*=\s*/, '')}`);
                result.push(`${var2[1]}=${next.replace(/local\s+\w+\s*=\s*/, '')}`);
                result.push(`return ${var1[1]},${var2[1]} end`);
                result.push(`local ${generateName()},${generateName()}=${name}()`);
                i += 2;
                continue;
            }
        }
        
        result.push(line);
        i++;
    }
    
    return result.join('\n');
}

// ==================== BYTECODE GENERATOR ====================
function generateBytecode(code) {
    const lines = code.split('\n');
    let bytecode = [];
    let byteVar = generateName();
    
    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed.startsWith('--')) continue;
        
        // Convertir cada línea a bytecode
        const bytes = [];
        for (let i = 0; i < trimmed.length; i++) {
            bytes.push(trimmed.charCodeAt(i));
        }
        
        // Ofuscar bytecode con XOR
        const key = generateXORKey();
        const encrypted = bytes.map(b => b ^ key);
        
        bytecode.push({
            encrypted: encrypted.join(','),
            key: key,
            line: trimmed
        });
    }
    
    let result = `local ${byteVar} = {} `;
    for (let i = 0; i < bytecode.length; i++) {
        const b = bytecode[i];
        result += `${byteVar}[${i}] = function() local t={${b.encrypted}} local s='' for i=1,#t do s=s..string.char(t[i]^${b.key}) end return s end `;
    }
    
    // Ejecutar bytecode
    result += `for i=0,#${byteVar} do loadstring(${byteVar}[i]())() end `;
    
    return result;
}

// ==================== VM PERSONALIZADA ====================
function generateVM(originalCode) {
    const lines = originalCode.split('\n');
    const vmName = generateName();
    const instructionTable = generateName();
    const pc = generateName();
    const stack = generateName();
    const instructions = [];
    let vmCode = '';
    
    // Generar instrucciones de VM
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '' || line.startsWith('--')) continue;
        
        const op = VM_OPS[Math.floor(Math.random() * VM_OPS.length)];
        const a = Math.floor(Math.random() * 50);
        const b = Math.floor(Math.random() * 50);
        const c = Math.floor(Math.random() * 50);
        
        // Encriptar la línea
        const key = generateXORKey();
        const encrypted = [];
        for (let j = 0; j < line.length; j++) {
            encrypted.push(line.charCodeAt(j) ^ key);
        }
        
        instructions.push({
            op: op,
            a: a,
            b: b,
            c: c,
            encrypted: encrypted.join(','),
            key: key
        });
    }
    
    vmCode = `
local ${vmName} = {}
local ${instructionTable} = {}
local ${pc} = 0
local ${stack} = {}

-- Decryptor interno
local function _dec(t,k)
    local s = ''
    for i=1,#t do
        s = s .. string.char(t[i] ^ k)
    end
    return s
end

-- Instrucciones de VM
`;

    for (let i = 0; i < instructions.length; i++) {
        const ins = instructions[i];
        const decrypted = `_dec({${ins.encrypted}}, ${ins.key})`;
        vmCode += `${instructionTable}[${i}] = { op = "${ins.op}", a = ${ins.a}, b = ${ins.b}, c = ${ins.c}, code = ${decrypted} }\n`;
    }

    vmCode += `
function ${vmName}:execute()
    while ${pc} < #${instructionTable} do
        ${pc} = ${pc} + 1
        local ins = ${instructionTable}[${pc}]
        
        if ins.op == "MOVE" then
            ${stack}[ins.a] = ${stack}[ins.b]
        elseif ins.op == "LOADK" then
            ${stack}[ins.a] = ins.b
        elseif ins.op == "LOADBOOL" then
            ${stack}[ins.a] = ins.b ~= 0
        elseif ins.op == "LOADNIL" then
            for i = ins.a, ins.b do ${stack}[i] = nil end
        elseif ins.op == "GETTABLE" then
            ${stack}[ins.a] = ${stack}[ins.b][${stack}[ins.c]]
        elseif ins.op == "SETTABLE" then
            ${stack}[ins.a][${stack}[ins.b]] = ${stack}[ins.c]
        elseif ins.op == "NEWTABLE" then
            ${stack}[ins.a] = {}
        elseif ins.op == "ADD" then
            ${stack}[ins.a] = ${stack}[ins.b] + ${stack}[ins.c]
        elseif ins.op == "SUB" then
            ${stack}[ins.a] = ${stack}[ins.b] - ${stack}[ins.c]
        elseif ins.op == "MUL" then
            ${stack}[ins.a] = ${stack}[ins.b] * ${stack}[ins.c]
        elseif ins.op == "DIV" then
            ${stack}[ins.a] = ${stack}[ins.b] / ${stack}[ins.c]
        elseif ins.op == "MOD" then
            ${stack}[ins.a] = ${stack}[ins.b] % ${stack}[ins.c]
        elseif ins.op == "CONCAT" then
            local s = ""
            for i = ins.a, ins.b do s = s .. tostring(${stack}[i]) end
            ${stack}[ins.c] = s
        elseif ins.op == "JMP" then
            ${pc} = ${pc} + ins.b
        elseif ins.op == "EQ" then
            if ${stack}[ins.b] == ${stack}[ins.c] then ${pc} = ${pc} + 1 end
        elseif ins.op == "LT" then
            if ${stack}[ins.b] < ${stack}[ins.c] then ${pc} = ${pc} + 1 end
        elseif ins.op == "LE" then
            if ${stack}[ins.b] <= ${stack}[ins.c] then ${pc} = ${pc} + 1 end
        elseif ins.op == "CALL" then
            local args = {}
            for i = ins.a + 1, ins.a + ins.c - 1 do
                table.insert(args, ${stack}[i])
            end
            ${stack}[ins.a] = ${stack}[ins.a](unpack(args))
        elseif ins.op == "RETURN" then
            return ${stack}[ins.a]
        elseif ins.op == "CLOSURE" then
            ${stack}[ins.a] = function(...)
                local args = {...}
                ${pc} = ins.c
                ${vmName}:execute()
                return ${stack}[1]
            end
        end
    end
end

-- Ejecutar VM
${vmName}:execute()
`;

    return vmCode;
}

// ==================== ANTI-DEBUG AVANZADO ====================
function generateAntiDebug() {
    return `
local function _antiDebug()
    -- Anti-Debug por tiempo
    local t1 = os.clock()
    for i = 1, 200000 do end
    if os.clock() - t1 > 0.1 then
        error("Debugging detected")
    end
    
    -- Anti-Debug por debug.sethook
    if debug and debug.sethook then
        local hooked = false
        debug.sethook(function() hooked = true end, "l", 1)
        debug.sethook()
        if hooked then
            error("Hook detected")
        end
    end
    
    -- Anti-Debug por debug.getinfo
    if debug and debug.getinfo then
        local info = debug.getinfo(1)
        if info and info.what and info.what ~= "main" and info.what ~= "Lua" then
            error("Debug info tampered")
        end
    end
    
    -- Anti-Debug por pcall
    local function _test() return true end
    local ok, res = pcall(_test)
    if not ok then
        error("pcall tampered")
    end
    
    return true
end

pcall(_antiDebug)
_antiDebug = nil
collectgarbage()
`;
}

// ==================== ANTI-TAMPER COMPLETO ====================
function generateAntiTamper() {
    return `
local function _chk()
    local _err = error
    local function _crash(r)
        local s = {}
        for i = 1, 20 do
            local info = debug.getinfo(i)
            if info then
                s[#s + 1] = (info.short_src or '?') .. ':' .. (info.currentline or '?')
            end
        end
        _err('AT:' .. r .. '|' .. table.concat(s, '->'), 0)
    end
    
    -- Anti-Debug
    pcall(function()
        local t = os.clock()
        for _ = 1, 150000 do end
        if os.clock() - t > 5 then _crash('DB') end
    end)
    
    -- Anti-Hook
    pcall(function()
        if debug and debug.sethook then
            debug.sethook(function() _crash('HK') end)
        end
    end)
    
    -- Anti-Metatable
    pcall(function()
        local mt = getmetatable(_G) or {}
        if mt.__index and mt.__index ~= _G then _crash('MT') end
    end)
    
    -- Anti-Dump
    pcall(function()
        local f = string.dump
        if f then
            string.dump = function() _crash('DUMP') end
        end
    end)
    
    -- Anti-GC
    pcall(function()
        local t = {}
        setmetatable(t, {__mode = 'v'})
        t.x = 1
        collectgarbage()
        if t.x ~= nil then _crash('GC') end
    end)
    
    -- Anti-Coroutine
    pcall(function()
        local c = coroutine.create(function() return 1 end)
        local o, r = coroutine.resume(c)
        if not o or r ~= 1 then _crash('COR') end
    end)
    
    return true
end

pcall(_chk)
_chk = nil
collectgarbage()
`;
}

// ==================== FUNCIÓN PRINCIPAL ====================
function obfuscate(sourceCode) {
    if (!sourceCode || typeof sourceCode !== 'string') {
        return '-- Error: No source code provided';
    }
    
    try {
        let code = sourceCode;
        
        // 1. Remover comentarios
        code = removeComments(code);
        
        // 2. Ofuscar strings (simple)
        code = obfuscateStrings(code);
        
        // 3. Ofuscar strings con XOR
        code = obfuscateStringsXOR(code);
        
        // 4. Ofuscar números
        code = obfuscateNumbers(code);
        
        // 5. Renombrar variables
        code = renameLocals(code);
        
        // 6. Insertar código muerto
        code = insertDeadCode(code);
        
        // 7. Control Flow Flattening
        code = flattenControlFlow(code);
        
        // 8. Super Operadores
        code = generateSuperOperators(code);
        
        // 9. Generar Bytecode
        const bytecode = generateBytecode(code);
        
        // 10. Generar VM
        const vm = generateVM(code);
        
        // 11. Generar Anti-Debug
        const antiDebug = generateAntiDebug();
        
        // 12. Generar Anti-Tamper
        const antiTamper = generateAntiTamper();
        
        // 13. Combinar todo
        let finalCode = HEADER + '\n';
        finalCode += antiDebug + '\n';
        finalCode += antiTamper + '\n';
        finalCode += bytecode + '\n';
        finalCode += vm + '\n';
        
        // 14. Minificar todo
        finalCode = finalCode
            .replace(/\s+/g, ' ')
            .replace(/;\s*/g, ';')
            .replace(/,\s*/g, ',')
            .replace(/\(\s*/g, '(')
            .replace(/\s*\)/g, ')')
            .replace(/\s*=\s*/g, '=')
            .replace(/\s*\+\s*/g, '+')
            .replace(/\s*-\s*/g, '-')
            .replace(/\s*\*\s*/g, '*')
            .replace(/\s*\/\s*/g, '/')
            .replace(/\s*%\s*/g, '%')
            .replace(/\s*\.\.\s*/g, '..')
            .replace(/\s*==\s*/g, '==')
            .replace(/\s*~=\s*/g, '~=')
            .replace(/\s*<=\s*/g, '<=')
            .replace(/\s*>=\s*/g, '>=')
            .replace(/\s*<\s*/g, '<')
            .replace(/\s*>\s*/g, '>')
            .replace(/\s*and\s*/g, ' and ')
            .replace(/\s*or\s*/g, ' or ')
            .replace(/\s*not\s*/g, ' not ')
            .trim();
        
        // 15. Padding
        const targetSize = Math.max(sourceCode.length * 4, 5000);
        const currentLen = finalCode.length;
        if (currentLen < targetSize) {
            const padding = 'X'.repeat(Math.min(targetSize - currentLen, 50000));
            finalCode = finalCode + ` --[[${padding}]]`;
        }
        
        return finalCode;
        
    } catch (err) {
        return `-- Error: ${err.message}`;
    }
}

// ==================== EXPORTAR ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        obfuscate,
        generateAntiDebug,
        generateAntiTamper,
        generateBytecode,
        generateVM,
        generateSuperOperators,
        flattenControlFlow,
        insertDeadCode,
        renameLocals,
        obfuscateNumbers,
        obfuscateStrings,
        obfuscateStringsXOR,
        removeComments,
        generateName,
        generateHandler,
        generateXORKey
    };
}

// ==================== EJEMPLO DE USO ====================
if (require.main === module) {
    const testCode = `
        local function hello(name)
            print("Hello " .. name)
            return "World"
        end

        local result = hello("User")
        print(result)
    `;
    
    console.log("=== CÓDIGO OFUSCADO ===");
    const obfuscated = obfuscate(testCode);
    console.log(obfuscated);
    
    console.log("\n=== ESTADÍSTICAS ===");
    console.log(`- Tamaño original: ${testCode.length} bytes`);
    console.log(`- Tamaño ofuscado: ${obfuscated.length} bytes`);
    console.log(`- Factor: ${(obfuscated.length / testCode.length).toFixed(2)}x`);
    console.log(`- Líneas: ${obfuscated.split('\n').length}`);
}
