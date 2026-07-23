// ============================================================
// BANANA OBFUSCATOR v3.0 - IRONBREW2 COMPLETE
// ============================================================

const HEADER = `--[[ Protected by Banana Obfuscator v3.0 ]]`;

// ==================== CONFIGURACIÓN ====================
const CONFIG = {
    // Control Flow
    useCFG: true,
    useInlining: true,
    useSuperOperators: true,
    useMutations: true,
    useBlockReorder: true,
    useJunkCode: true,
    
    // Encryption
    encryptStrings: true,
    encryptImportantStrings: true,
    encryptNumbers: true,
    useGenericDecryptor: true,
    
    // VM
    useVM: true,
    compressBytecode: true,
    preserveLineInfo: false,
    
    // Security
    useAntiTamper: true,
    useAntiDebug: true,
    useAntiHook: true,
    useAntiDump: true,
    useAntiDecompiler: true,
    
    // Values
    maxMutations: 50,
    maxSuperOperators: 10,
    decryptTableLen: 128
};

// ==================== VARIABLES PERSONALIZADAS ====================
const CUSTOM_VARS = [
    "data", "temp", "result", "value", "index", "count", "total", "amount",
    "position", "status", "flags", "config", "cache", "buffer", "stream",
    "packet", "frame", "token", "session", "client", "server", "node",
    "table_data", "string_data", "number_data", "boolean_data", "nil_data",
    "function_data", "thread_data", "userdata_data", "table_temp", "string_temp",
    "number_temp", "boolean_temp", "nil_temp", "function_temp", "thread_temp",
    "userdata_temp", "table_result", "string_result", "number_result", "boolean_result",
    "nil_result", "function_result", "thread_result", "userdata_result",
    "meta", "proto", "env", "stack", "heap", "pool", "cache_data", "buffer_data",
    "stream_data", "packet_data", "frame_data", "token_data", "session_data",
    "client_data", "server_data", "node_data", "global_data", "local_data"
];

// ==================== HANDLER POOL ====================
const HANDLER_POOL = [
    "KQ", "HF", "W8", "SX", "Rj", "nT", "pL", "qZ", 
    "mV", "xB", "yC", "wD", "A9", "B7", "C3", "D4", 
    "E6", "F1", "G2", "H5", "I0", "J8", "L3", "M4",
    "N5", "O6", "P7", "Q8", "R9", "S0", "T1", "U2",
    "V3", "W4", "X5", "Y6", "Z7", "a8", "b9", "c0"
];

// ==================== GENERADOR DE NOMBRES ====================
function generateCustomName() {
    const base = CUSTOM_VARS[Math.floor(Math.random() * CUSTOM_VARS.length)];
    const suffix = Math.floor(Math.random() * 999999);
    const prefixes = ["", "get_", "set_", "is_", "has_", "on_", "do_", "try_", "run_", "make_", "create_"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return prefix + base + "_" + suffix;
}

// ==================== PICK HANDLERS ====================
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

// ==================== RUNTIME STRING ====================
function runtimeString(str) {
    return `string.char(${str.split('').map(c => c.charCodeAt(0)).join(',')})`;
}

// ==================== APPLY CFF (Control Flow Flattening) ====================
function applyCFF(blocks) {
    const stateVar = generateCustomName();
    let lua = `local ${stateVar}=1 while true do `;
    for (let i = 0; i < blocks.length; i++) {
        if (i === 0) lua += `if ${stateVar}==1 then ${blocks[i]} ${stateVar}=2 `;
        else         lua += `elseif ${stateVar}==${i + 1} then ${blocks[i]} ${stateVar}=${i + 2} `;
    }
    lua += `elseif ${stateVar}==${blocks.length + 1} then break end end `;
    return lua;
}

// ==================== MBA (Mixed Boolean Arithmetic) ====================
function mba() {
    let n = Math.random() > 0.5 ? 1 : 2, 
        a = Math.floor(Math.random() * 70) + 15, 
        b = Math.floor(Math.random() * 40) + 8;
    return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

// ==================== CONTROL FLOW GRAPH ====================
function generateCFG(code) {
    let lines = code.split('\n');
    let blocks = [];
    let currentBlock = [];
    let blockLabels = [];
    
    // Dividir en bloques básicos
    for (let line of lines) {
        let trimmed = line.trim();
        
        // Detectar inicio de bloque
        if (trimmed.match(/^(if|for|while|repeat|function|do)\b/)) {
            if (currentBlock.length > 0) {
                blocks.push(currentBlock);
                currentBlock = [];
            }
            let label = generateCustomName();
            blockLabels.push(label);
            currentBlock.push(`::${label}::`);
            currentBlock.push(line);
        }
        // Detectar fin de bloque
        else if (trimmed.match(/^(end|until)\b/)) {
            currentBlock.push(line);
            if (currentBlock.length > 0) {
                blocks.push(currentBlock);
                currentBlock = [];
            }
        }
        else {
            currentBlock.push(line);
        }
    }
    
    if (currentBlock.length > 0) {
        blocks.push(currentBlock);
    }
    
    // Reordenar bloques aleatoriamente
    if (CONFIG.useBlockReorder && blocks.length > 2) {
        for (let i = 0; i < blocks.length - 1; i++) {
            if (Math.random() > 0.4) {
                let j = Math.floor(Math.random() * blocks.length);
                [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
                [blockLabels[i], blockLabels[j]] = [blockLabels[j], blockLabels[i]];
            }
        }
    }
    
    // Agregar saltos entre bloques
    let result = [];
    let stateVar = generateCustomName();
    result.push(`local ${stateVar} = 1`);
    
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        let nextLabel = blockLabels[(i + 1) % blockLabels.length] || 'break';
        
        // Verificar si el bloque ya tiene un salto
        let hasJump = block.some(line => line.includes('goto') || line.includes('return') || line.includes('break'));
        
        if (i < blocks.length - 1 && !hasJump) {
            let lastLine = block[block.length - 1] || '';
            if (!lastLine.includes('return') && !lastLine.includes('break') && !lastLine.includes('goto')) {
                result.push(`if ${stateVar} == ${i + 1} then`);
                result.push(...block);
                result.push(`${stateVar} = ${i + 2}`);
                result.push(`goto ${nextLabel}`);
                result.push('end');
            } else {
                result.push(`if ${stateVar} == ${i + 1} then`);
                result.push(...block);
                result.push('end');
            }
        } else {
            result.push(`if ${stateVar} == ${i + 1} then`);
            result.push(...block);
            result.push('end');
        }
    }
    
    return result.join('\n');
}

// ==================== INLINING SIMULATOR ====================
function simulateInlining(code) {
    let lines = code.split('\n');
    let result = [];
    let i = 0;
    let functionCache = new Map();
    
    while (i < lines.length) {
        let line = lines[i];
        
        // Detectar funciones locales pequeñas
        let funcMatch = line.match(/local\s+function\s+(\w+)\s*\(([^)]*)\)/);
        if (funcMatch) {
            let funcName = funcMatch[1];
            let params = funcMatch[2].split(',').map(p => p.trim());
            let funcLines = [line];
            let depth = 1;
            let j = i + 1;
            
            while (j < lines.length && depth > 0) {
                funcLines.push(lines[j]);
                if (lines[j].includes('function')) depth++;
                if (lines[j].includes('end')) depth--;
                j++;
            }
            
            // Si es pequeña, cachear para inline
            if (funcLines.length < 6) {
                let funcBody = funcLines.slice(1, -1).join('\n');
                functionCache.set(funcName, { params, body: funcBody, lines: funcLines });
                result.push(...funcLines);
                i = j;
                continue;
            }
            
            result.push(...funcLines);
            i = j;
            continue;
        }
        
        // Detectar llamadas a funciones cacheadas
        let callMatch = line.match(/\b(\w+)\s*\(([^)]*)\)/);
        if (callMatch) {
            let funcName = callMatch[1];
            if (functionCache.has(funcName)) {
                let func = functionCache.get(funcName);
                let args = callMatch[2].split(',').map(a => a.trim());
                
                // Reemplazar llamada con cuerpo de función
                let inlined = func.body;
                for (let p = 0; p < func.params.length && p < args.length; p++) {
                    inlined = inlined.replace(new RegExp(`\\b${func.params[p]}\\b`, 'g'), args[p]);
                }
                result.push(`-- Inlined ${funcName}`);
                result.push(inlined);
                i++;
                continue;
            }
        }
        
        result.push(line);
        i++;
    }
    
    return result.join('\n');
}

// ==================== SUPER OPERATORS ====================
function generateSuperOperators(code) {
    let lines = code.split('\n');
    let result = [];
    let i = 0;
    
    while (i < lines.length) {
        let line = lines[i];
        let nextLine = lines[i + 1] || '';
        let nextNextLine = lines[i + 2] || '';
        
        // Combinar múltiples operaciones en super operador
        if (line.includes(' + ') && nextLine.includes(' * ') && nextNextLine.includes(' - ')) {
            let varNames = [];
            let operations = [];
            
            // Extraer variables
            let varMatch = line.match(/local\s+(\w+)\s*=\s*(.+)/);
            if (varMatch) {
                varNames.push(varMatch[1]);
                operations.push(varMatch[2]);
            }
            
            let varMatch2 = nextLine.match(/local\s+(\w+)\s*=\s*(.+)/);
            if (varMatch2) {
                varNames.push(varMatch2[1]);
                operations.push(varMatch2[2]);
            }
            
            let varMatch3 = nextNextLine.match(/local\s+(\w+)\s*=\s*(.+)/);
            if (varMatch3) {
                varNames.push(varMatch3[1]);
                operations.push(varMatch3[2]);
            }
            
            if (varNames.length >= 2) {
                let superName = generateCustomName();
                result.push(`local ${superName} = function()`);
                result.push(`  local ${varNames.join(', ')}`);
                for (let o = 0; o < operations.length; o++) {
                    result.push(`  ${varNames[o]} = ${operations[o]}`);
                }
                result.push(`  return ${varNames.join(', ')}`);
                result.push('end');
                result.push(`local ${generateCustomName()}, ${generateCustomName()}, ${generateCustomName()} = ${superName}()`);
                i += 3;
                continue;
            }
        }
        
        result.push(line);
        i++;
    }
    
    return result.join('\n');
}

// ==================== MUTATIONS ====================
function generateMutations(code) {
    let lines = code.split('\n');
    let result = [];
    let mutationCount = 0;
    
    for (let line of lines) {
        // Mutación 1: Reemplazar operadores con funciones
        if (Math.random() > 0.3 && mutationCount < CONFIG.maxMutations) {
            line = line.replace(/\+/g, `-(function() return -1 end)()`)
                       .replace(/\*/g, `*(function() return 1 end)()`)
                       .replace(/\/\//g, `/(function() return 1 end)()`);
            mutationCount++;
        }
        
        // Mutación 2: Agregar código muerto
        if (Math.random() > 0.4 && mutationCount < CONFIG.maxMutations) {
            let deadVar = generateCustomName();
            let deadValue = Math.floor(Math.random() * 1000);
            result.push(`local ${deadVar} = ${deadValue} + ${Math.floor(Math.random() * 100)} - ${Math.floor(Math.random() * 100)}`);
            mutationCount++;
        }
        
        // Mutación 3: Agregar funciones dummy
        if (Math.random() > 0.6 && mutationCount < CONFIG.maxMutations) {
            let dummyName = generateCustomName();
            result.push(`local ${dummyName} = function(x) return x + ${Math.floor(Math.random() * 10)} - ${Math.floor(Math.random() * 10)} end`);
            mutationCount++;
        }
        
        result.push(line);
    }
    
    return result.join('\n');
}

// ==================== STRING ENCRYPTION ====================
function encryptStrings(code) {
    const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g;
    let modified = code;
    let match;
    const replacements = [];

    while ((match = stringRegex.exec(code)) !== null) {
        const fullMatch = match[0];
        if (fullMatch.length < 4 || fullMatch.includes('__') || fullMatch.includes('\\')) continue;
        if (fullMatch.includes('string.char')) continue;

        const content = fullMatch.slice(1, -1);
        if (content.includes('"') || content.includes('\\') || content.includes('\n')) continue;

        // Crear tabla de ofuscación con XOR
        let key = Math.floor(Math.random() * 255) + 1;
        let encrypted = [];
        for (let i = 0; i < content.length; i++) {
            encrypted.push(content.charCodeAt(i) ^ key);
        }
        
        const varName = generateCustomName();
        const replacement = `_decrypt_${varName}("${encrypted.join(',')}", ${key})`;
        replacements.push({
            original: fullMatch,
            replacement: replacement,
            varName: varName,
            content: content
        });
    }

    if (replacements.length === 0) return code;

    // Generar función de descifrado
    let result = `local function _decrypt(str, key) 
        local chars = {} 
        local i = 1
        local current = ''
        while i <= #str do
            local char = str:sub(i, i)
            if char == ',' then
                local val = tonumber(current) or 0
                table.insert(chars, string.char(bit32.bxor(val, key)))
                current = ''
            else
                current = current .. char
            end
            i = i + 1
        end
        return table.concat(chars) 
    end `;
    
    let offset = 0;
    for (const rep of replacements) {
        const index = code.indexOf(rep.original, offset);
        if (index !== -1) {
            modified = modified.substring(0, index) + rep.replacement + modified.substring(index + rep.original.length);
            offset = index + rep.replacement.length;
        }
    }

    return result + modified;
}

// ==================== NUMBER OBFUSCATION ====================
function obfuscateNumbers(code) {
    const numberRegex = /\b\d+(\.\d+)?\b/g;
    let modified = code;
    let match;
    const replacements = [];

    while ((match = numberRegex.exec(code)) !== null) {
        const num = parseFloat(match[0]);
        if (num < 0 || num > 1000 || Number.isInteger(num) === false) continue;
        if (num === 0 || num === 1 || num === 2) continue;
        if (num === 10 || num === 100) continue;

        const a = Math.floor(Math.random() * 20) + 5;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = Math.floor(Math.random() * 5) + 1;
        const expression = `(${a}*${b}/${c}+${num - (a*b/c)})`;
        replacements.push({
            original: match[0],
            replacement: expression
        });
    }

    for (const rep of replacements) {
        modified = modified.replace(new RegExp(rep.original, 'g'), rep.replacement);
    }

    return modified;
}

// ==================== RENAME VARIABLES ====================
function renameVariables(code) {
    const lines = code.split('\n');
    const localVars = new Map();
    const globalVars = new Map();
    const usedNames = new Set();
    let varCounter = 0;

    for (let line of lines) {
        // Detectar variables locales
        const localMatch = line.match(/local\s+(\w+)\s*=/);
        if (localMatch) {
            const varName = localMatch[1];
            if (!localVars.has(varName) && !usedNames.has(varName)) {
                const newName = generateCustomName();
                localVars.set(varName, newName);
                usedNames.add(newName);
            }
        }
        
        // Detectar variables globales
        const globalMatch = line.match(/^(\w+)\s*=/);
        if (globalMatch) {
            const varName = globalMatch[1];
            if (!globalVars.has(varName) && !usedNames.has(varName) && 
                !localVars.has(varName) && varName !== 'local' && varName !== 'function') {
                const newName = generateCustomName();
                globalVars.set(varName, newName);
                usedNames.add(newName);
            }
        }
    }

    let modified = code;
    for (const [oldName, newName] of localVars) {
        const regex = new RegExp(`\\b${oldName}\\b`, 'g');
        modified = modified.replace(regex, newName);
    }
    for (const [oldName, newName] of globalVars) {
        const regex = new RegExp(`\\b${oldName}\\b`, 'g');
        modified = modified.replace(regex, newName);
    }

    return modified;
}

// ==================== DEAD CODE INSERTION ====================
function insertDeadCode(code) {
    const deadCodeBlocks = [
        `if false then local ${generateCustomName()}=${Math.floor(Math.random()*100)} end `,
        `local ${generateCustomName()}=function() return ${Math.floor(Math.random()*100)} end `,
        `do local ${generateCustomName()}=${Math.floor(Math.random()*100)} end `,
        `if true and false then print("dead") end `,
        `local ${generateCustomName()}=nil `,
        `for _=1,0 do end `,
        `local ${generateCustomName()}={} `,
        `local ${generateCustomName()}=function(x) return x + ${Math.floor(Math.random()*100)} end `,
        `local ${generateCustomName()} = ${Math.floor(Math.random()*1000)} + ${Math.floor(Math.random()*1000)} - ${Math.floor(Math.random()*1000)}`
    ];

    const lines = code.split('\n');
    let insertCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < insertCount; i++) {
        const insertPos = Math.floor(Math.random() * lines.length);
        const deadCode = deadCodeBlocks[Math.floor(Math.random() * deadCodeBlocks.length)];
        lines.splice(insertPos, 0, deadCode);
    }

    return lines.join('\n');
}

// ==================== MINIFICATION ====================
function minify(code) {
    const regex = /(\[=*\[)[\s\S]*?(\]=*\])|(["'])(?:(?=(\\?))\2.)*?\3|--\[\[[\s\S]*?\]\]|--[^\n]*|\s+/g;
    return code.replace(regex, (match, bopen, bclose, quote) => {
        if (bopen || quote) return match;
        if (match.startsWith('--')) return '';
        return ' ';
    }).trim();
}

// ==================== ANTI-TAMPER COMPLETE ====================
const ANTI_TAMPER_LUA = `
local function antiTamper()
    local function crash(reason)
        while true do
            local stack={}
            for i=1,20 do
                local info=debug.getinfo(i,'S')
                if info then
                    table.insert(stack,(info.short_src or '?')..':'..(info.currentline or '?'))
                end
            end
            error('AT:'..reason..'|'..table.concat(stack,'->'),0)
        end
    end
    
    -- Anti-Debug
    pcall(function()
        local _adT=os.clock()
        for _=1,150000 do end
        if os.clock()-_adT>5.0 then crash('AD:1') end
    end)
    
    -- Anti-Hook
    pcall(function()
        if debug and debug.sethook then
            local hookCalled = false
            debug.sethook(function() hookCalled = true end, "l", 5)
            debug.sethook()
            if hookCalled then crash('HK') end
        end
    end)
    
    -- Anti-Dump
    pcall(function()
        if string.dump then
            local orig = string.dump
            string.dump = function() crash('DUMP') end
        end
    end)
    
    -- Anti-Decompiler
    pcall(function()
        local env = getfenv()
        if env and env._G then
            local mt = getmetatable(env) or {}
            mt.__index = function() crash('DEC') end
            setmetatable(env, mt)
        end
    end)
    
    -- Check Environment Integrity
    pcall(function()
        local required = {'_G', 'debug', 'string', 'table', 'math', 'coroutine', 'os', 'pcall', 'xpcall'}
        for _, name in ipairs(required) do
            if _G[name] == nil then crash('ENV:'..name) end
        end
    end)
    
    -- Check Metatable
    pcall(function()
        local mt = getmetatable(_G) or {}
        if mt.__index and mt.__index ~= _G then crash('MTI') end
        if mt.__newindex and mt.__newindex ~= _G then crash('MTN') end
    end)
    
    -- Check GC
    pcall(function()
        local m1 = collectgarbage('count')
        local m2 = collectgarbage('count')
        if m2 < m1 then crash('GC') end
    end)
    
    return true
end

local p,e=pcall(antiTamper)
if not p then
    while true do error('PF:'..tostring(e),0) end
end
antiTamper=nil
p=nil
e=nil
collectgarbage()
`;

// ==================== XOR FUNCTION ====================
function xorFunction() {
    return `
local function xor(a,b)
    local result = 0
    local bit = 1
    while a > 0 or b > 0 do
        local abit = a % 2
        local bbit = b % 2
        if abit ~= bbit then
            result = result + bit
        end
        a = (a - abit) / 2
        b = (b - bbit) / 2
        bit = bit * 2
    end
    return result
end
`;
}

// ==================== VM BUILDER ====================
function buildTrueVM(payloadStr) {
    const seed = Math.floor(Math.random() * 97) + 31;
    const multiplier = Math.floor(Math.random() * 9) + 3;
    const shift = Math.floor(Math.random() * 21) + 5;

    let currentKey = seed;
    const encryptedBytes = [];
    for (let i = 0; i < payloadStr.length; i++) {
        const byte = payloadStr.charCodeAt(i);
        const encrypted = (byte ^ currentKey) % 256;
        encryptedBytes.push(`\\${String(encrypted).padStart(3, '0')}`);
        currentKey = (currentKey * multiplier + shift) % 256;
    }

    const payloadString = encryptedBytes.join('');

    const v_payload = generateCustomName();
    const v_key = generateCustomName();
    const v_exec = generateCustomName();
    const v_i = generateCustomName();
    const v_char = generateCustomName();
    const v_buffer = generateCustomName();
    const v_result = generateCustomName();

    let bootstrap = `local ${v_payload}="${payloadString}" `;
    bootstrap += `local ${v_key}=${seed} `;
    bootstrap += `local ${v_exec}={} `;
    bootstrap += xorFunction();
    bootstrap += `for ${v_i}=1,#${v_payload} do `;
    bootstrap += `local ${v_char}=string.byte(${v_payload},${v_i}) `;
    bootstrap += `local ${v_buffer}=string.char(xor(${v_char},${v_key})) `;
    bootstrap += `table.insert(${v_exec},${v_buffer}) `;
    bootstrap += `${v_key}=(${v_key}*${multiplier}+${shift})%256 end `;

    if (payloadStr.includes("http")) {
        bootstrap += `local ${v_result}=table.concat(${v_exec}) assert(loadstring(game:HttpGet(${v_result})))() `;
    } else {
        bootstrap += `local ${v_result}=table.concat(${v_exec}) assert(loadstring(${v_result}))() `;
    }

    return bootstrap;
}

// ==================== FRAGILE VM ====================
function buildFragileVM(innerCode, depth = 0) {
    if (depth >= 40) return innerCode;

    const vmName = generateCustomName();
    const handlerCount = Math.floor(Math.random() * 5) + 3;
    const realIdx = Math.floor(Math.random() * handlerCount);
    const handlers = pickHandlers(handlerCount);

    let out = `local ${vmName}={} local _h${depth}={`;
    for (let i = 0; i < handlerCount; i++) {
        if (i === realIdx) {
            out += `[${i + 1}]=function(${vmName}) `;
            out += `if ${vmName}[1]~=nil then error("VM corrupted") end `;
            out += buildFragileVM(innerCode, depth + 1);
            out += ` end,`;
        } else {
            out += `[${i + 1}]=function(${vmName}) return nil end,`;
        }
    }
    out += `} `;

    const execBlocks = [];
    for (let i = 0; i < handlerCount; i++) {
        execBlocks.push(`_h${depth}[${i + 1}](${vmName})`);
    }
    out += applyCFF(execBlocks);
    return out;
}

// ==================== DYNAMIC TARGET SIZE ====================
function getDynamicTargetSize(code) {
    return Math.max(code.length * 3, 5000);
}

// ==================== DETECT AND APPLY MAPPINGS ====================
function detectAndApplyMappings(code) {
    const MAPEO = {
        "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
        "TextButton":"Mixed Boolean Arithmetic","Humanoid":"Dynamic Junk","Player":"Fake Flow",
        "RunService":"Virtual Machine","TweenService":"Fake Flow","Players":"Fake Flow",
        "Workspace":"String to Math","ServerScriptService":"Aggressive Renaming",
        "ReplicatedStorage":"Table Indirection","DataStoreService":"Mixed Boolean Arithmetic",
        "RemoteEvent":"Table Indirection","RemoteFunction":"String to Math",
        "ModuleScript":"Aggressive Renaming","Script":"Dynamic Junk"
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
                replacement = `((${mba()}==1 or true)and"${word}")`;
            }
            else if (tech.includes("Table Indirection")) {
                const t = generateCustomName();
                headers += `local ${t}={["${word}"]="${word}"};`;
                replacement = `${t}["${word}"]`;
            }
            else if (tech.includes("Virtual Machine")) {
                const t = generateCustomName();
                headers += `local ${t}=function() return "${word}" end;`;
                replacement = `${t}()`;
            }
            else if (tech.includes("Dynamic Junk")) {
                replacement = `(function() return "${word}" end)()`;
            }
            else if (tech.includes("Fake Flow")) {
                const t = generateCustomName();
                headers += `local ${t}=${Math.random() > 0.5 ? 'true' : 'false'};`;
                replacement = `(${t} and "${word}" or "${word}")`;
            }
            regex.lastIndex = 0;
            modified = modified.replace(regex, () => `game[${replacement}]`);
        }
    }
    return headers + modified;
}

// ==================== REMOVE COMMENTS ====================
function removeComments(code) {
    return code
      .replace(/--\[\[[\s\S]*?\]\]/g, '')
      .replace(/--[^\n]*/g, '');
}

// ==================== FUNCIÓN PRINCIPAL ====================
function obfuscate(sourceCode) {
    if (!sourceCode || typeof sourceCode !== 'string') {
        return '-- Error: No valid source code provided';
    }

    try {
        let code = sourceCode;

        // 1. Remover comentarios
        code = removeComments(code);

        // 2. Detectar y aplicar mapeos
        code = detectAndApplyMappings(code);

        // 3. Ofuscar strings
        if (CONFIG.encryptStrings) {
            code = encryptStrings(code);
        }

        // 4. Ofuscar números
        if (CONFIG.encryptNumbers) {
            code = obfuscateNumbers(code);
        }

        // 5. Renombrar variables
        code = renameVariables(code);

        // 6. Insertar código muerto
        if (CONFIG.useJunkCode) {
            code = insertDeadCode(code);
        }

        // 7. Control Flow Graph
        if (CONFIG.useCFG) {
            code = generateCFG(code);
        }

        // 8. Inlining
        if (CONFIG.useInlining) {
            code = simulateInlining(code);
        }

        // 9. Super Operadores
        if (CONFIG.useSuperOperators) {
            code = generateSuperOperators(code);
        }

        // 10. Mutaciones
        if (CONFIG.useMutations) {
            code = generateMutations(code);
        }

        // 11. Minificar
        code = minify(code);

        // 12. Construir VM
        let vm = buildTrueVM(code);
        vm = buildFragileVM(vm, 0);

        // 13. Combinar todo
        let finalCode = HEADER + '\n\n';
        
        if (CONFIG.useAntiTamper) {
            finalCode += ANTI_TAMPER_LUA + '\n';
        }
        
        finalCode += vm;

        // 14. Padding para tamaño dinámico
        const targetSize = getDynamicTargetSize(sourceCode);
        const currentLen = finalCode.length;
        const bytesNeeded = targetSize - currentLen;
        if (bytesNeeded > 7) {
            finalCode += ` --[[${'X'.repeat(Math.min(bytesNeeded - 7, 50000))}]]`;
        }

        return finalCode;

    } catch (error) {
        console.error('Obfuscation error:', error);
        return `-- Error during obfuscation: ${error.message}`;
    }
}

// ==================== EXPORTAR ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        obfuscate,
        CONFIG,
        generateCustomName,
        pickHandlers,
        applyCFF,
        mba,
        generateCFG,
        simulateInlining,
        generateSuperOperators,
        generateMutations,
        encryptStrings,
        obfuscateNumbers,
        renameVariables,
        insertDeadCode,
        minify,
        buildTrueVM,
        buildFragileVM,
        getDynamicTargetSize,
        detectAndApplyMappings,
        removeComments,
        ANTI_TAMPER_LUA
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
