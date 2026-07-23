const fs = require('fs');

// ==================== CONFIGURACIÓN ====================
const HEADER = `--[[ LAURA VM v6.0 - ANTI-TAMPER INTEGRADO ]]`;
const CUSTOM_VARS = [
    "Laura","Maria","Jose","Carlos","Ana","Pedro","Juan","Luis","Sofia","Diego",
    "shield","guardian","phantom","shadow","eagle","tiger","dragon","wolf","raven"
];

const JUNK_LINES = 600;
const MAX_LOCALS = 150;
const MAX_VM_ITERATIONS = 999999;

// ==================== FUNCIONES AUXILIARES ====================

function randomName() {
    const base = CUSTOM_VARS[Math.floor(Math.random() * CUSTOM_VARS.length)];
    const suffix = Math.floor(Math.random() * 999999);
    const prefixes = ["", "a_", "b_", "c_", "d_", "e_", "f_", "g_", "h_", "i_"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return prefix + base + "_" + suffix;
}

function randomNumber() {
    return Math.floor(Math.random() * 1000000) + 1;
}

function randomString(length = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function obfuscateNumber(n) {
    const a = Math.floor(Math.random() * 100) + 1;
    const b = n ^ a;
    return `bit32.bxor(${a},${b})`;
}

function obfuscateString(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        const xorKey = Math.floor(Math.random() * 255) + 1;
        result += `string.char(${charCode ^ xorKey}^${xorKey})`;
        if (i < str.length - 1) result += '..';
    }
    return result;
}

// ==================== ANTI-TAMPER COMPLETO ====================

function generateAntiTamper() {
    const checks = [];
    const checkNames = [];
    
    // 25 verificaciones anti-tamper (reducidas para tamaño)
    for (let i = 0; i < 25; i++) {
        const name = randomName();
        checkNames.push(name);
        
        const checkType = i % 8;
        let checkCode = '';
        
        switch(checkType) {
            case 0:
                checkCode = `
                local function ${name}()
                    if debug and debug.getinfo then
                        local info=debug.getinfo(1,"S")
                        if info and info.what=="C" then error("D"..${i}) end
                    end
                end`;
                break;
            case 1:
                checkCode = `
                local function ${name}()
                    local t=os.clock()
                    for _=1,50000 do end
                    if os.clock()-t>0.03 then error("S"..${i}) end
                end`;
                break;
            case 2:
                checkCode = `
                local function ${name}()
                    if type(getfenv)~="function" then error("F"..${i}) end
                end`;
                break;
            case 3:
                checkCode = `
                local function ${name}()
                    if math.abs(-10)~=10 then error("M"..${i}) end
                    if string.char(65)~="A" then error("S"..${i}) end
                end`;
                break;
            case 4:
                checkCode = `
                local function ${name}()
                    local h=debug.sethook(function()end,"l")
                    debug.sethook()
                    if h then error("H"..${i}) end
                end`;
                break;
            case 5:
                checkCode = `
                local function ${name}()
                    pcall(function()return debug.getinfo(1,"S")end)
                end`;
                break;
            case 6:
                checkCode = `
                local function ${name}()
                    local env=getfenv()
                    if env and type(env)=="table" then
                        local mt=getmetatable(env)or{}
                        if mt.__metatable~=nil and mt.__metatable~="SECURE" then
                            error("M"..${i})
                        end
                    end
                end`;
                break;
            case 7:
                checkCode = `
                local function ${name}()
                    if bit32 and bit32.bxor(10,5)~=15 then error("B"..${i}) end
                end`;
                break;
        }
        
        checks.push(checkCode);
    }
    
    return checks.join('\n') + '\n' + checkNames.map(n => `pcall(${n})`).join('\n');
}

// ==================== ANTI-TAMPER EN OPCodes ====================

function generateOpcodesAntiTamper() {
    return `
    -- ANTI-TAMPER EN OPCodes
    local function ${randomName()}()
        if debug and debug.getinfo then
            local i=debug.getinfo(1,"S")
            if i and i.what=="C" then while true do end end
        end
        local h=debug.sethook(function()end,"l")
        debug.sethook()
        if h then while true do end end
        if type(getfenv)~="function" then while true do end end
        if math.abs(-10)~=10 then while true do end end
        return true
    end
    
    -- Verificar en cada opcode
    local ${randomName()}=0
    local ${randomName()}=function()
        ${randomName()}=${randomName()}+1
        if ${randomName()}%100==0 then
            ${randomName()}()
        end
    end
    `;
}

// ==================== COMPILADOR COMPRIMIDO ====================

function compileToBytecode(source) {
    const lines = source.split('\n');
    const bytecode = [];
    const constants = [];
    
    function getConstIndex(val) {
        let idx = constants.indexOf(val);
        if (idx === -1) { constants.push(val); idx = constants.length - 1; }
        return idx;
    }
    
    function parseExpression(expr) {
        expr = expr.trim();
        if (/^[\d.]+$/.test(expr)) return { type: 'const', value: parseFloat(expr) };
        if (/^["'].*["']$/.test(expr)) return { type: 'const', value: expr.slice(1, -1) };
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr)) return { type: 'var', name: expr };
        
        const opMatch = expr.match(/^(.+)\s*([+\-*/%])\s*(.+)$/);
        if (opMatch) {
            return { type: 'op', op: opMatch[2], left: parseExpression(opMatch[1]), right: parseExpression(opMatch[3]) };
        }
        
        const callMatch = expr.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\((.*)\)$/);
        if (callMatch) {
            const args = callMatch[2].split(',').map(a => parseExpression(a.trim()));
            return { type: 'call', func: callMatch[1], args };
        }
        
        return { type: 'var', name: expr };
    }
    
    for (let line of lines) {
        line = line.trim();
        if (line === '' || line.startsWith('--')) continue;
        
        const localAssign = line.match(/^local\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
        if (localAssign) {
            const varName = localAssign[1];
            const parsed = parseExpression(localAssign[2]);
            
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
                
                const opMap = { '+': 6, '-': 7, '*': 8, '/': 9, '%': 10 };
                bytecode.push({ op: opMap[parsed.op] || 6, args: [] });
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
        
        const callMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\((.*)\)$/);
        if (callMatch) {
            const args = callMatch[2].split(',').map(a => parseExpression(a.trim()));
            for (let arg of args) {
                if (arg.type === 'const') {
                    const idx = getConstIndex(arg.value);
                    bytecode.push({ op: 1, args: [idx] });
                } else if (arg.type === 'var') {
                    bytecode.push({ op: 2, args: [arg.name] });
                }
            }
            bytecode.push({ op: 4, args: [callMatch[1], args.length] });
            continue;
        }
        
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
    const antiVar = randomName();
    
    // Solo 12 opcodes para reducir tamaño
    const opFuncs = [];
    for (let i = 0; i < 12; i++) {
        opFuncs.push(randomName());
    }
    
    let constTable = '{';
    for (let i = 0; i < constants.length; i++) {
        const val = constants[i];
        if (typeof val === 'string') {
            constTable += `[${obfuscateNumber(i)}]=${obfuscateString(val)},`;
        } else if (typeof val === 'number') {
            constTable += `[${obfuscateNumber(i)}]=${obfuscateNumber(val)},`;
        }
    }
    constTable += '}';
    
    let bcTable = '{';
    for (let instr of bytecode) {
        const op = obfuscateNumber(instr.op);
        const args = instr.args.map(a => {
            if (typeof a === 'string') return `"${a}"`;
            return String(a);
        }).join(',');
        bcTable += `{op=${op},args={${args}}},`;
    }
    bcTable += '}';
    
    const opImpls = [
        `function ${opFuncs[0]}(a)end`,
        `function ${opFuncs[1]}(a)local i=a[1]table.insert(${stackVar},${constVar}[i])end`,
        `function ${opFuncs[2]}(a)local n=a[1]table.insert(${stackVar},${envVar}[n])end`,
        `function ${opFuncs[3]}(a)local n=a[1]${envVar}[n]=table.remove(${stackVar})end`,
        `function ${opFuncs[4]}(a)local n=a[1]local c=a[2]local p={}for i=1,c do p[i]=table.remove(${stackVar})end local f=${envVar}[n]if f then table.insert(${stackVar},f(table.unpack(p)))end end`,
        `function ${opFuncs[5]}(a)return table.remove(${stackVar})end`,
        `function ${opFuncs[6]}(a)local x=table.remove(${stackVar})local y=table.remove(${stackVar})table.insert(${stackVar},x+y)end`,
        `function ${opFuncs[7]}(a)local x=table.remove(${stackVar})local y=table.remove(${stackVar})table.insert(${stackVar},x-y)end`,
        `function ${opFuncs[8]}(a)local x=table.remove(${stackVar})local y=table.remove(${stackVar})table.insert(${stackVar},x*y)end`,
        `function ${opFuncs[9]}(a)local x=table.remove(${stackVar})local y=table.remove(${stackVar})table.insert(${stackVar},x/y)end`,
        `function ${opFuncs[10]}(a)local x=table.remove(${stackVar})local y=table.remove(${stackVar})table.insert(${stackVar},x%y)end`,
        `function ${opFuncs[11]}(a)end`
    ];
    
    let opTable = '{';
    for (let i = 0; i < opFuncs.length; i++) {
        opTable += `[${obfuscateNumber(i)}]=${opFuncs[i]},`;
    }
    opTable += '}';
    
    // VM con anti-tamper integrado en cada iteración
    let vm = `
    -- VM CON ANTI-TAMPER
    local ${vmName}={}
    local ${pcVar}=1
    local ${stackVar}={}
    local ${envVar}=getfenv()or _G
    local ${constVar}=${constTable}
    local bytecode=${bcTable}
    local ${antiVar}=${randomNumber()}
    ${opImpls.join('')}
    local opTable=${opTable}
    
    -- Anti-tamper en VM
    local function ${randomName()}()
        if debug and debug.getinfo then
            local i=debug.getinfo(1,"S")
            if i and i.what=="C" then while true do end end
        end
        local h=debug.sethook(function()end,"l")
        debug.sethook()
        if h then while true do end end
        if type(getfenv)~="function" then while true do end end
        if math.abs(-10)~=10 then while true do end end
        return true
    end
    
    function ${vmName}:execute()
        local pc=1
        local iter=0
        while true do
            iter=iter+1
            if iter>${MAX_VM_ITERATIONS} then error("L") end
            
            -- Anti-tamper cada 50 iteraciones
            if iter%50==0 then ${randomName()}() end
            
            local instr=bytecode[pc]
            if not instr then break end
            local func=opTable[instr.op]
            if func then func(instr.args) else error("O") end
            pc=pc+1
            if pc>#bytecode then break end
        end
        return ${stackVar}[#${stackVar}]
    end
    
    pcall(function()
        local r=${vmName}:execute()
        if r~=nil then return r end
    end)
    `;
    
    return vm;
}

// ==================== GENERADOR DE JUNK ====================

function generateJunk(lines) {
    let junk = '';
    for (let i = 0; i < lines; i++) {
        const r = Math.random();
        const n1 = randomName();
        const n2 = randomName();
        const num1 = randomNumber();
        const num2 = randomNumber();
        
        if (r < 0.1) {
            junk += `local ${n1}=${num1} `;
        } else if (r < 0.2) {
            junk += `local ${n1}=string.char(${num1%256}) `;
        } else if (r < 0.3) {
            junk += `if ${n1} then local x=1 end `;
        } else if (r < 0.4) {
            junk += `do local ${n1}={} ${n1}.x=${num1} end `;
        } else if (r < 0.5) {
            junk += `while false do local ${n1}=1 end `;
        } else if (r < 0.6) {
            junk += `local function ${n1}()local ${n2}=${num1}return ${n2}end `;
        } else if (r < 0.7) {
            junk += `local ${n1}=${num1}+${num2} `;
        } else if (r < 0.8) {
            junk += `local ${n1}=${num1}*${num2} `;
        } else if (r < 0.9) {
            junk += `local ${n1}=${num1}/${num2} `;
        } else {
            junk += `local ${n1}=${num1}%${num2} `;
        }
        if (i % 10 === 0) junk += '\n';
    }
    return junk;
}

// ==================== OFUSCADOR PRINCIPAL ====================

function obfuscate(sourceCode) {
    if (!sourceCode || sourceCode.trim() === '') {
        return '-- Error: No source';
    }
    
    console.error('🔒 Laura VM v6.0 iniciando...');
    console.error(`📊 Original: ${sourceCode.length} bytes`);
    
    // Anti-tamper completo
    const antiTamper = generateAntiTamper();
    const opcodeAnti = generateOpcodesAntiTamper();
    
    // Compilar
    const { bytecode, constants } = compileToBytecode(sourceCode);
    console.error(`📊 Bytecode: ${bytecode.length} instr`);
    
    // VM
    let vm = generateVM(bytecode, constants);
    
    // Junk reducido
    let junk1 = generateJunk(JUNK_LINES);
    let junk2 = generateJunk(JUNK_LINES);
    
    // Montar final (más pequeño)
    let finalCode = HEADER + '\n';
    finalCode += antiTamper + '\n';
    finalCode += opcodeAnti + '\n';
    finalCode += junk1 + '\n';
    finalCode += vm + '\n';
    finalCode += junk2 + '\n';
    
    // Cierre pequeño
    finalCode += `
    -- CIERRE
    local ${randomName()}=function()
        for k,v in pairs(_G)do
            if type(v)=="function"and tostring(v):match("VM")then
                _G[k]=nil
            end
        end
    end
    pcall(${randomName()})
    print("✅ OK")
    `;
    
    // Comprimir
    finalCode = finalCode.replace(/  +/g, ' ');
    finalCode = finalCode.replace(/\n\s*\n\s*\n/g, '\n');
    finalCode = finalCode.replace(/;\s*;/g, ';');
    
    console.error(`✅ Tamaño: ${finalCode.length} bytes (${Math.round((finalCode.length/sourceCode.length)*100)}% del original)`);
    
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
            console.error('❌ Error:', e.message);
            process.exit(1);
        }
    } else {
        try {
            input = fs.readFileSync(0, 'utf-8');
        } catch (e) {
            console.error('❌ Error:', e.message);
            process.exit(1);
        }
    }
    
    if (!input || input.trim() === '') {
        console.error('❌ No hay código');
        process.exit(1);
    }
    
    const result = obfuscate(input);
    console.log(result);
}

module.exports = { obfuscate };
