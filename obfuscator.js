const fs = require('fs');

// ==================== CONFIGURACIÓN ====================
const HEADER = `--[[ LAURA VM v4.0 - PROTECTED WITH ANTI-TAMPER + OPCodes ]]`;
const CUSTOM_VARS = [
    "Laura", "Maria", "Jose", "Carlos", "Ana", "Pedro", "Juan", "Luis",
    "shield", "guardian", "phantom", "shadow", "eagle", "tiger", "dragon",
    "data", "temp", "result", "value", "index", "count", "total", "amount",
    "position", "status", "flags", "config", "cache", "buffer", "stream",
    "packet", "frame", "token", "session", "client", "server", "node",
    "table_data", "string_data", "number_data", "boolean_data", "nil_data",
    "function_data", "thread_data", "userdata_data"
];

const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD","AZ","BY","CX","DV","EW","FU","GT","HS","IR","JQ","KP","LO","MN","OP","QR","ST","UV","WX","YZ"];

const JUNK_LINES = 500;
const MAX_VM_ITERATIONS = 9999999;

// ==================== FUNCIONES AUXILIARES ====================

function randomName() {
    const base = CUSTOM_VARS[Math.floor(Math.random() * CUSTOM_VARS.length)];
    const suffix = Math.floor(Math.random() * 999999);
    const prefixes = ["", "get_", "set_", "is_", "has_", "on_", "do_", "check_", "verify_", "validate_", "process_", "handle_", "execute_", "guard_", "protect_"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return prefix + base + "_" + suffix;
}

function randomNumber() {
    return Math.floor(Math.random() * 1000000) + 1;
}

function randomString(length = 20) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function obfuscateNumber(n) {
    const a = Math.floor(Math.random() * 1000) + 1;
    const b = n ^ a;
    const c = Math.floor(Math.random() * 100) + 1;
    return `(((${a} ^ ${b}) + ${c}) - ${c})`;
}

function obfuscateString(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        const xorKey = Math.floor(Math.random() * 255) + 1;
        const obfuscated = charCode ^ xorKey;
        result += `string.char(${obfuscated} ^ ${xorKey})`;
        if (i < str.length - 1) result += ' .. ';
    }
    return result;
}

function generateJunk(lines) {
    let junk = '';
    for (let i = 0; i < lines; i++) {
        const r = Math.random();
        const name1 = randomName();
        const name2 = randomName();
        const num1 = randomNumber();
        const num2 = randomNumber();
        
        if (r < 0.05) {
            junk += `local ${name1}=${num1} `;
        } else if (r < 0.10) {
            junk += `local ${name1}=string.char(${num1%256}) `;
        } else if (r < 0.15) {
            junk += `if ${name1} then local x=1 end `;
        } else if (r < 0.20) {
            junk += `do local ${name1}={} ${name1}.x=${num1} end `;
        } else if (r < 0.25) {
            junk += `while false do local ${name1}=1 end `;
        } else if (r < 0.30) {
            junk += `local function ${name1}() local ${name2}=${num1} return ${name2} end `;
        } else if (r < 0.35) {
            junk += `local ${name1}=function() local ${name2}=${num1} return ${name2} end `;
        } else if (r < 0.40) {
            junk += `if type(${num1}) == "number" then local ${name1}=1 else local ${name2}=2 end `;
        } else if (r < 0.45) {
            junk += `local ${name1}=math.floor(${Math.random() * 1000}) `;
        } else if (r < 0.50) {
            junk += `local ${name1}=${randomName()} or ${num1} `;
        } else if (r < 0.55) {
            junk += `local ${name1}=${num1} + ${num2} `;
        } else if (r < 0.60) {
            junk += `local ${name1}=${num1} * ${num2} `;
        } else if (r < 0.65) {
            junk += `local ${name1}=${num1} / ${num2} `;
        } else if (r < 0.70) {
            junk += `local ${name1}=${num1} % ${num2} `;
        } else if (r < 0.75) {
            junk += `local ${name1}=bit32.bxor(${num1}, ${num2}) `;
        } else if (r < 0.80) {
            junk += `local ${name1}=bit32.band(${num1}, ${num2}) `;
        } else if (r < 0.85) {
            junk += `local ${name1}=bit32.bor(${num1}, ${num2}) `;
        } else if (r < 0.90) {
            junk += `local ${name1}=string.sub("${randomString(20)}", ${num1%10}, ${num2%10}) `;
        } else if (r < 0.95) {
            junk += `local ${name1}=string.gsub("${randomString(15)}", "a", "b") `;
        } else {
            junk += `local ${name1}=string.match("${randomString(10)}", "${randomString(3)}") `;
        }
        
        if (i % 5 === 0) junk += '\n';
    }
    return junk;
}

// ==================== ANTI-TAMPER COMPLETO ====================

function generateFullAntiTamper() {
    const checks = [];
    const checkNames = [];
    
    // 30 verificaciones anti-tamper diferentes
    for (let i = 0; i < 30; i++) {
        const name = randomName();
        checkNames.push(name);
        
        const checkType = i % 10;
        let checkCode = '';
        
        switch(checkType) {
            case 0:
                checkCode = `
                local function ${name}()
                    if debug and debug.getinfo then
                        local info = debug.getinfo(1, "S")
                        if info and info.what == "C" then
                            while true do error("DEBUG_DETECTED_" .. ${i}) end
                        end
                    end
                end
                `;
                break;
            case 1:
                checkCode = `
                local function ${name}()
                    local t1 = os.clock()
                    local sum = 0
                    for _ = 1, 500000 do
                        sum = sum + 1
                    end
                    if os.clock() - t1 > 0.05 then
                        while true do error("SLOW_EXECUTION_" .. ${i}) end
                    end
                end
                `;
                break;
            case 2:
                checkCode = `
                local function ${name}()
                    if type(getfenv) ~= "function" then
                        while true do error("FENV_MISSING_" .. ${i}) end
                    end
                    local env = getfenv()
                    if not env then
                        while true do error("ENV_NULL_" .. ${i}) end
                    end
                end
                `;
                break;
            case 3:
                checkCode = `
                local function ${name}()
                    if math.abs(-10) ~= 10 then
                        while true do error("MATH_TAMPER_" .. ${i}) end
                    end
                    if string.char(65) ~= "A" then
                        while true do error("STRING_TAMPER_" .. ${i}) end
                    end
                    if type({}) ~= "table" then
                        while true do error("TABLE_TAMPER_" .. ${i}) end
                    end
                end
                `;
                break;
            case 4:
                checkCode = `
                local function ${name}()
                    local hook = debug.sethook(function() end, "l")
                    debug.sethook()
                    if hook then
                        while true do error("HOOK_DETECTED_" .. ${i}) end
                    end
                end
                `;
                break;
            case 5:
                checkCode = `
                local function ${name}()
                    local success, err = pcall(function()
                        return debug.getinfo(1, "S")
                    end)
                    if not success then
                        while true do error("DEBUG_DISABLED_" .. ${i}) end
                    end
                end
                `;
                break;
            case 6:
                checkCode = `
                local function ${name}()
                    local env = getfenv()
                    if env and type(env) == "table" then
                        local mt = getmetatable(env) or {}
                        if mt.__metatable ~= nil and mt.__metatable ~= "SECURE" then
                            while true do error("METATABLE_TAMPER_" .. ${i}) end
                        end
                    end
                end
                `;
                break;
            case 7:
                checkCode = `
                local function ${name}()
                    for k, v in pairs(_G) do
                        if type(v) == "function" and tostring(v):match("spy") then
                            while true do error("SPY_DETECTED_" .. ${i}) end
                        end
                    end
                end
                `;
                break;
            case 8:
                checkCode = `
                local function ${name}()
                    local env = getfenv()
                    if env and type(env) == "table" then
                        local mt = getmetatable(env)
                        if mt and mt.__index then
                            while true do error("METATABLE_INDEX_" .. ${i}) end
                        end
                    end
                end
                `;
                break;
            case 9:
                checkCode = `
                local function ${name}()
                    local coroutines = {}
                    for k, v in pairs(coroutine) do
                        if type(v) == "function" then
                            table.insert(coroutines, k)
                        end
                    end
                    if #coroutines < 5 then
                        while true do error("COROUTINE_TAMPER_" .. ${i}) end
                    end
                end
                `;
                break;
        }
        
        checks.push(checkCode);
    }
    
    return {
        functions: checks.join('\n'),
        calls: checkNames.map(name => `${name}()`).join('\n    ')
    };
}

// ==================== COMPILADOR CON OPCodes ====================

function compileToBytecode(source) {
    const lines = source.split('\n');
    const bytecode = [];
    const constants = [];
    const variables = {};
    
    function getConstIndex(val) {
        let idx = constants.indexOf(val);
        if (idx === -1) {
            constants.push(val);
            idx = constants.length - 1;
        }
        return idx;
    }
    
    function parseExpression(expr) {
        expr = expr.trim();
        
        if (/^[\d.]+$/.test(expr)) {
            return { type: 'const', value: parseFloat(expr) };
        }
        if (/^["'].*["']$/.test(expr)) {
            const str = expr.slice(1, -1);
            return { type: 'const', value: str };
        }
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr)) {
            return { type: 'var', name: expr };
        }
        
        const opMatch = expr.match(/^(.+)\s*([+\-*/%])\s*(.+)$/);
        if (opMatch) {
            const left = parseExpression(opMatch[1]);
            const right = parseExpression(opMatch[3]);
            return { type: 'op', op: opMatch[2], left, right };
        }
        
        const callMatch = expr.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\((.*)\)$/);
        if (callMatch) {
            const funcName = callMatch[1];
            const args = callMatch[2].split(',').map(a => parseExpression(a.trim()));
            return { type: 'call', func: funcName, args };
        }
        
        return { type: 'var', name: expr };
    }
    
    for (let line of lines) {
        line = line.trim();
        if (line === '' || line.startsWith('--')) continue;
        
        // Asignación local
        const localAssign = line.match(/^local\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
        if (localAssign) {
            const varName = localAssign[1];
            const expr = localAssign[2];
            const parsed = parseExpression(expr);
            
            if (parsed.type === 'const') {
                const idx = getConstIndex(parsed.value);
                bytecode.push({ op: 1, args: [idx] });
                bytecode.push({ op: 3, args: [varName] });
            } else if (parsed.type === 'var') {
                bytecode.push({ op: 2, args: [parsed.name] });
                bytecode.push({ op: 3, args: [varName] });
            } else if (parsed.type === 'op') {
                const left = parsed.left;
                const right = parsed.right;
                
                if (left.type === 'const') {
                    const idx = getConstIndex(left.value);
                    bytecode.push({ op: 1, args: [idx] });
                } else if (left.type === 'var') {
                    bytecode.push({ op: 2, args: [left.name] });
                }
                
                if (right.type === 'const') {
                    const idx = getConstIndex(right.value);
                    bytecode.push({ op: 1, args: [idx] });
                } else if (right.type === 'var') {
                    bytecode.push({ op: 2, args: [right.name] });
                }
                
                const opMap = {
                    '+': 6, '-': 7, '*': 8, '/': 9, '%': 10
                };
                const opCode = opMap[parsed.op] || 6;
                bytecode.push({ op: opCode, args: [] });
                bytecode.push({ op: 3, args: [varName] });
            } else if (parsed.type === 'call') {
                for (let arg of parsed.args) {
                    if (arg.type === 'const') {
                        const idx = getConstIndex(arg.value);
                        bytecode.push({ op: 1, args: [idx] });
                    } else if (arg.type === 'var') {
                        bytecode.push({ op: 2, args: [arg.name] });
                    }
                }
                bytecode.push({ op: 4, args: [parsed.func, parsed.args.length] });
                bytecode.push({ op: 3, args: [varName] });
            }
            continue;
        }
        
        // Llamada a función
        const callMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\((.*)\)$/);
        if (callMatch) {
            const funcName = callMatch[1];
            const args = callMatch[2].split(',').map(a => parseExpression(a.trim()));
            
            for (let arg of args) {
                if (arg.type === 'const') {
                    const idx = getConstIndex(arg.value);
                    bytecode.push({ op: 1, args: [idx] });
                } else if (arg.type === 'var') {
                    bytecode.push({ op: 2, args: [arg.name] });
                }
            }
            bytecode.push({ op: 4, args: [funcName, args.length] });
            continue;
        }
        
        // Retorno
        const returnMatch = line.match(/^return\s*(.*)$/);
        if (returnMatch) {
            if (returnMatch[1]) {
                const parsed = parseExpression(returnMatch[1]);
                if (parsed.type === 'const') {
                    const idx = getConstIndex(parsed.value);
                    bytecode.push({ op: 1, args: [idx] });
                } else if (parsed.type === 'var') {
                    bytecode.push({ op: 2, args: [parsed.name] });
                }
            }
            bytecode.push({ op: 5, args: [] });
        }
    }
    
    if (bytecode.length === 0 || bytecode[bytecode.length - 1].op !== 5) {
        bytecode.push({ op: 5, args: [] });
    }
    
    return { bytecode, constants };
}

// ==================== GENERADOR DE VM CON ANTI-TAMPER ====================

function generateVM(bytecode, constants) {
    const vmName = randomName();
    const pcVar = randomName();
    const stackVar = randomName();
    const envVar = randomName();
    const constVar = randomName();
    const resultVar = randomName();
    const antiCheckVar = randomName();
    const iterationVar = randomName();
    
    // 20 funciones de opcode
    const opFuncs = [];
    for (let i = 0; i < 20; i++) {
        opFuncs.push(randomName());
    }
    
    // Constantes ofuscadas
    let constTable = '{\n';
    for (let i = 0; i < constants.length; i++) {
        const val = constants[i];
        if (typeof val === 'string') {
            constTable += `  [${obfuscateNumber(i)}] = ${obfuscateString(val)},\n`;
        } else if (typeof val === 'number') {
            constTable += `  [${obfuscateNumber(i)}] = ${obfuscateNumber(val)},\n`;
        }
    }
    constTable += '}';
    
    // Bytecode ofuscado
    let bcTable = '{\n';
    for (let instr of bytecode) {
        const op = obfuscateNumber(instr.op);
        const args = instr.args.map(a => {
            if (typeof a === 'string') return `"${a}"`;
            return String(a);
        }).join(', ');
        bcTable += `  {op = ${op}, args = {${args}}},\n`;
    }
    bcTable += '}';
    
    // Implementaciones de opcodes con anti-tamper
    const opImpls = [
        `function ${opFuncs[0]}(args) end`,
        `function ${opFuncs[1]}(args) local idx=args[1] local val=${constVar}[idx] table.insert(${stackVar}, val) end`,
        `function ${opFuncs[2]}(args) local name=args[1] local val=${envVar}[name] table.insert(${stackVar}, val) end`,
        `function ${opFuncs[3]}(args) local name=args[1] local val=table.remove(${stackVar}) ${envVar}[name]=val end`,
        `function ${opFuncs[4]}(args) local name=args[1] local numArgs=args[2] or 0 local callArgs={} for i=1,numArgs do callArgs[i]=table.remove(${stackVar}) end local f=${envVar}[name] if f then table.insert(${stackVar}, f(table.unpack(callArgs))) end end`,
        `function ${opFuncs[5]}(args) return table.remove(${stackVar}) end`,
        `function ${opFuncs[6]}(args) local a=table.remove(${stackVar}) local b=table.remove(${stackVar}) table.insert(${stackVar}, a+b) end`,
        `function ${opFuncs[7]}(args) local a=table.remove(${stackVar}) local b=table.remove(${stackVar}) table.insert(${stackVar}, a-b) end`,
        `function ${opFuncs[8]}(args) local a=table.remove(${stackVar}) local b=table.remove(${stackVar}) table.insert(${stackVar}, a*b) end`,
        `function ${opFuncs[9]}(args) local a=table.remove(${stackVar}) local b=table.remove(${stackVar}) table.insert(${stackVar}, a/b) end`,
        `function ${opFuncs[10]}(args) local a=table.remove(${stackVar}) local b=table.remove(${stackVar}) table.insert(${stackVar}, a%b) end`,
        `function ${opFuncs[11]}(args) end`,
        `function ${opFuncs[12]}(args) end`,
        `function ${opFuncs[13]}(args) end`,
        `function ${opFuncs[14]}(args) end`,
        `function ${opFuncs[15]}(args) end`,
        `function ${opFuncs[16]}(args) end`,
        `function ${opFuncs[17]}(args) end`,
        `function ${opFuncs[18]}(args) end`,
        `function ${opFuncs[19]}(args) end`
    ];
    
    // Tabla de dispatch
    let opTable = '{\n';
    for (let i = 0; i < opFuncs.length; i++) {
        opTable += `  [${obfuscateNumber(i)}] = ${opFuncs[i]},\n`;
    }
    opTable += '}';
    
    // VM completa con anti-tamper integrado
    let vm = `
    -- ============================================
    -- LAURA VM v4.0 - CON ANTI-TAMPER INTEGRADO
    -- ============================================
    
    -- Variables de la VM
    local ${vmName} = {}
    local ${pcVar} = 1
    local ${stackVar} = {}
    local ${envVar} = getfenv() or _G
    local ${constVar} = ${constTable}
    local ${iterationVar} = 0
    local ${antiCheckVar} = true
    
    -- Bytecode
    local bytecode = ${bcTable}
    
    -- Funciones de opcode
    ${opImpls.join('\n    ')}
    
    -- Tabla de dispatch
    local opTable = ${opTable}
    
    -- Anti-tamper integrado en la VM
    local function ${randomName()}()
        -- Verificar debug
        if debug and debug.getinfo then
            local info = debug.getinfo(1, "S")
            if info and info.what == "C" then
                while true do error("ANTI_TAMPER: DEBUG") end
            end
        end
        
        -- Verificar entorno
        if type(getfenv) ~= "function" then
            while true do error("ANTI_TAMPER: FENV") end
        end
        
        -- Verificar funciones básicas
        if math.abs(-10) ~= 10 then
            while true do error("ANTI_TAMPER: MATH") end
        end
        
        if string.char(65) ~= "A" then
            while true do error("ANTI_TAMPER: STRING") end
        end
        
        if type({}) ~= "table" then
            while true do error("ANTI_TAMPER: TABLE") end
        end
        
        -- Verificar hooks
        local hook = debug.sethook(function() end, "l")
        debug.sethook()
        if hook then
            while true do error("ANTI_TAMPER: HOOK") end
        end
        
        return true
    end
    
    -- Verificar integridad antes de ejecutar
    ${randomName()}()
    
    function ${vmName}:execute()
        local pc = 1
        local iterations = 0
        
        while true do
            iterations = iterations + 1
            if iterations > ${MAX_VM_ITERATIONS} then
                error("VM_LOOP_LIMIT")
            end
            
            -- Anti-tamper cada 50 iteraciones
            if iterations % 50 == 0 then
                ${randomName()}()
            end
            
            local instr = bytecode[pc]
            if not instr then break end
            
            local op = instr.op
            local args = instr.args
            
            -- Verificar opcode
            local func = opTable[op]
            if func then
                func(args)
            else
                error("INVALID_OPCODE: " .. tostring(op))
            end
            
            pc = pc + 1
            if pc > #bytecode then break end
        end
        
        return ${stackVar}[#${stackVar}]
    end
    
    -- Ejecutar con protección
    local success, err = pcall(function()
        local ${resultVar} = ${vmName}:execute()
        if ${resultVar} ~= nil then
            return ${resultVar}
        end
    end)
    
    if not success then
        error("VM_ERROR: " .. tostring(err))
    end
    `;
    
    return vm;
}

// ==================== OFUSCADOR PRINCIPAL ====================

function obfuscate(sourceCode) {
    if (!sourceCode || sourceCode.trim() === '') {
        return '-- Error: No source code provided';
    }
    
    console.error('🔒 Iniciando ofuscación con Laura VM v4.0...');
    console.error(`📊 Código original: ${sourceCode.length} bytes`);
    
    // 1. Generar anti-tamper completo
    console.error('🛡️ Generando anti-tamper...');
    const antiTamper = generateFullAntiTamper();
    
    // 2. Compilar a bytecode
    console.error('⚙️ Compilando a bytecode...');
    const { bytecode, constants } = compileToBytecode(sourceCode);
    console.error(`📊 Bytecode: ${bytecode.length} instrucciones, ${constants.length} constantes`);
    
    // 3. Generar VM con anti-tamper
    console.error('🏗️ Generando VM con anti-tamper...');
    let vm = generateVM(bytecode, constants);
    
    // 4. Generar código basura
    console.error('🗑️ Generando código basura...');
    let junk1 = generateJunk(JUNK_LINES);
    let junk2 = generateJunk(JUNK_LINES);
    let junk3 = generateJunk(JUNK_LINES);
    let junk4 = generateJunk(JUNK_LINES);
    let junk5 = generateJunk(JUNK_LINES);
    
    // 5. Montar código final
    console.error('📦 Montando código final...');
    
    let finalCode = HEADER + '\n\n';
    
    // Capa 1: Anti-tamper
    finalCode += `-- === ANTI-TAMPER COMPLETO ===\n`;
    finalCode += antiTamper.functions + '\n';
    finalCode += `-- Ejecutar verificaciones\n`;
    finalCode += antiTamper.calls + '\n';
    finalCode += junk1 + '\n';
    
    // Capa 2: Configuración
    finalCode += `-- === CONFIGURACIÓN ===\n`;
    finalCode += `local ${randomName()} = {} \n`;
    finalCode += junk2 + '\n';
    
    // Capa 3: VM principal
    finalCode += `-- === VM CON OPCodes ===\n`;
    finalCode += vm + '\n';
    finalCode += junk3 + '\n';
    
    // Capa 4: Verificaciones finales
    finalCode += `-- === VERIFICACIONES FINALES ===\n`;
    finalCode += `
    -- Verificación de integridad final
    local ${randomName()} = function()
        local checks = 0
        for k, v in pairs(_G) do
            if type(v) == "function" and tostring(v):match("check") then
                checks = checks + 1
            end
        end
        return checks > 5
    end
    
    if not ${randomName()}() then
        error("FINAL_INTEGRITY_FAIL")
    end
    `;
    finalCode += junk4 + '\n';
    finalCode += junk5 + '\n';
    
    // Capa 5: Cierre
    finalCode += `-- === CIERRE ===\n`;
    finalCode += `
    -- Limpieza final
    local ${randomName()} = {}
    for ${randomName()}, ${randomName()} in pairs(_G) do
        if type(${randomName()}) == "function" and tostring(${randomName()}):match("VM") then
            ${randomName()}[${randomName()}] = nil
        end
    end
    
    print("✅ Laura VM ejecutada correctamente")
    `;
    
    // Limpiar espacios
    finalCode = finalCode.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    console.error(`✅ Ofuscación completada! Tamaño: ${finalCode.length} bytes`);
    
    return finalCode;
}

// ==================== EJECUCIÓN ====================

if (require.main === module) {
    const args = process.argv.slice(2);
    let input = '';
    
    if (args.length > 0) {
        try {
            input = fs.readFileSync(args[0], 'utf-8');
        } catch (e) {
            console.error('❌ Error leyendo archivo:', e.message);
            process.exit(1);
        }
    } else {
        try {
            input = fs.readFileSync(0, 'utf-8');
        } catch (e) {
            console.error('❌ Error leyendo stdin:', e.message);
            process.exit(1);
        }
    }
    
    if (!input || input.trim() === '') {
        console.error('❌ Error: No hay código para ofuscar');
        process.exit(1);
    }
    
    const result = obfuscate(input);
    console.log(result);
}

module.exports = { obfuscate };
