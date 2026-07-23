const fs = require('fs');

// ==================== CONFIGURACIÓN ====================
const HEADER = `--[[ protected by vmmer obfoscator ]]`;
const CUSTOM_NAMES = [
    "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t",
    "u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N",
    "O","P","Q","R","S","T","U","V","W","X","Y","Z","aa","bb","cc","dd","ee","ff",
    "gg","hh","ii","jj","kk","ll","mm","nn","oo","pp","qq","rr","ss","tt","uu","vv"
];

const JUNK_LINES = 600;
const MAX_VM_ITERATIONS = 999999;

// ==================== FUNCIONES AUXILIARES ====================

function randomName() {
    const base = CUSTOM_NAMES[Math.floor(Math.random() * CUSTOM_NAMES.length)];
    const suffix = Math.floor(Math.random() * 999999);
    return base + "_" + suffix;
}

function randomNumber() {
    return Math.floor(Math.random() * 1000000) + 1;
}

function randomString(length = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
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

// ==================== ENCODER ====================

function encodeAllStrings(code) {
    const stringPattern = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g;
    return code.replace(stringPattern, (match, str1, str2) => {
        const original = str1 || str2 || '';
        if (!original || original.length <= 1) return match;
        
        const charOps = [];
        for (let char of original) {
            const targetByte = char.charCodeAt(0);
            const opType = ['add','sub','xor'][Math.floor(Math.random() * 3)];
            const offset = Math.floor(Math.random() * 111) + 10;
            if (opType === 'add') {
                charOps.push(`(${targetByte - offset}+${offset})`);
            } else if (opType === 'sub') {
                charOps.push(`(${targetByte + offset}-${offset})`);
            } else {
                const xorKey = Math.floor(Math.random() * 111) + 10;
                charOps.push(`bit32.bxor(${targetByte ^ xorKey},${xorKey})`);
            }
        }
        
        const vBuf = `_${randomString(8)}`;
        const vTab = `{${charOps.join(',')}}`;
        return `(function() local ${vBuf}={} for i,v in ipairs(${vTab}) do table.insert(${vBuf},string.char(v)) end return table.concat(${vBuf}) end)()`;
    });
}

// ==================== ANTI-TAMPER COMPLETO ====================

function generateAntiTamper() {
    const toBytes = (s) => `{${s.split('').map(c => c.charCodeAt(0)).join(',')}}`;
    
    const crash = (payload) => {
        return `local msg=string.char(unpack(${payload}));task.spawn(function()error(msg)end);task.wait(0.1);while true do end`;
    };
    
    const checks = [];
    const checkNames = [];
    
    const criticalFuncs = [
        "loadstring","rawget","type","string.char","bit32.bxor",
        "pcall","task.spawn","task.wait","getfenv","setfenv",
        "getmetatable","setmetatable","debug.getinfo","debug.sethook",
        "coroutine.create","coroutine.resume","os.clock","os.time"
    ];
    
    const decompilerTriggers = ["decompile","getscriptbytecode","dumpstring","getconstants","getprotos","getbytecode"];
    const envLoggerTriggers = ["saveinstance","getgc","getreg","hookmetamethod","checkclosure","spy","logger"];
    const executorGlobals = ["syn","KRNL_LOADED","Electron","fluxus","synapse","krnl","scriptware","sirhurt"];
    const hookFuncs = ["hookfunction","replaceclosure","newcclosure","clonefunction","hookmetamethod"];
    const upvalueTools = ["setupvalue","getupvalues","getupvalue","setupvalue"];
    const fsFuncs = ["readfile","writefile","appendfile","makefolder","listfiles"];
    const exploitLogs = ["rconsoleprint","rconsolewarn","rconsoleerr","setclipboard","toclipboard"];
    
    let antiCode = '';
    
    // Core checks
    for (let cf of criticalFuncs) {
        const name = randomName();
        checkNames.push(name);
        antiCode += `local function ${name}() if type(${cf})~='function' then ${crash(toBytes('Core fail'))} end end `;
    }
    
    // Decompiler checks
    for (let dt of decompilerTriggers) {
        const name = randomName();
        checkNames.push(name);
        antiCode += `local function ${name}() if getgenv and getgenv()["${dt}"] then ${crash(toBytes('Decompiler'))} end end `;
    }
    
    // Env logger checks
    for (let el of envLoggerTriggers) {
        const name = randomName();
        checkNames.push(name);
        antiCode += `local function ${name}() if getgenv and getgenv()["${el}"] then ${crash(toBytes('Logger'))} end end `;
    }
    
    // Executor checks
    for (let eg of executorGlobals) {
        const name = randomName();
        checkNames.push(name);
        antiCode += `local function ${name}() if getgenv and getgenv()["${eg}"]~=nil then ${crash(toBytes('Executor'))} end end `;
    }
    
    // Hook checks
    for (let hf of hookFuncs) {
        const name = randomName();
        checkNames.push(name);
        antiCode += `local function ${name}() if getgenv and getgenv()["${hf}"] then ${crash(toBytes('Hook'))} end end `;
    }
    
    // Upvalue checks
    for (let ut of upvalueTools) {
        const name = randomName();
        checkNames.push(name);
        antiCode += `local function ${name}() if getgenv and getgenv()["${ut}"] then ${crash(toBytes('Upvalue'))} end end `;
    }
    
    // Filesystem checks
    for (let ff of fsFuncs) {
        const name = randomName();
        checkNames.push(name);
        antiCode += `local function ${name}() if getgenv and getgenv()["${ff}"] then ${crash(toBytes('Filesystem'))} end end `;
    }
    
    // Exploit logging checks
    for (let el of exploitLogs) {
        const name = randomName();
        checkNames.push(name);
        antiCode += `local function ${name}() if getgenv and getgenv()["${el}"] then getgenv()["${el}"]=function() ${crash(toBytes('Logging'))} end end end `;
    }
    
    // Metatable check
    const mtName = randomName();
    checkNames.push(mtName);
    antiCode += `local function ${mtName}() local env=getfenv() local mt=getrawmetatable and getrawmetatable(env) if mt then local idx=rawget(mt,{95,95,105,110,100,101,120}) if type(idx)=='function' or type(idx)=='table' then ${crash(toBytes('Metatable'))} end end end `;
    
    // Thread identity check
    const thName = randomName();
    checkNames.push(thName);
    antiCode += `local function ${thName}() local ok,id=pcall(function()return getthreadidentity and getthreadidentity()or 0 end) if ok and id and id>=6 then ${crash(toBytes('Thread'))} end end `;
    
    // Stack check
    const stName = randomName();
    checkNames.push(stName);
    antiCode += `local function ${stName}() local ok,tb=pcall(function()return debug and debug.traceback and debug.traceback()or''end) if ok and tb then local fn=tostring(tb) if string.find(fn,'LocalScript',1,true)==nil then if string.find(fn,'ModuleScript',1,true)==nil then ${crash(toBytes('Stack'))} end end end end `;
    
    // Invalid method check
    const imName = randomName();
    checkNames.push(imName);
    antiCode += `local function ${imName}() local ok,_=pcall(function()return Instance.new('Part'):InvalidMethod('a')end) if ok then ${crash(toBytes('Invalid'))} end end `;
    
    // GetChildren check
    const gcName = randomName();
    checkNames.push(gcName);
    antiCode += `local function ${gcName}() local ok,_=pcall(function()return game:GetChildren(function()end)end) if ok then ${crash(toBytes('Children'))} end end `;
    
    // JSON check
    const jsName = randomName();
    checkNames.push(jsName);
    antiCode += `local function ${jsName}() local ok,res=pcall(function()return game:GetService('HttpService'):JSONDecode('[68,\"getgold.cc\",true,123,false,[321,null,\"goldtm\"],null,[\"a\"]]')end) while not ok do task() end while res[6][2]~=nil do (true)() end end `;
    
    // Heartbeat check
    const hbName = randomName();
    checkNames.push(hbName);
    antiCode += `local function ${hbName}() local ran=0 local conn=game:GetService('RunService').Heartbeat:Connect(function()ran=ran+1 end) repeat task.wait()until ran>=2 conn:Disconnect() end `;
    
    // Filler checks
    for (let i = 0; i < 10; i++) {
        const name = randomName();
        checkNames.push(name);
        antiCode += `local function ${name}() local t=os.clock() for _=1,50000 do end if os.clock()-t>0.03 then ${crash(toBytes('Slow'))} end end `;
    }
    
    // Execute all checks
    antiCode += `task.spawn(function() while true do `;
    for (let name of checkNames) {
        antiCode += `pcall(${name}) `;
    }
    antiCode += `task.wait(2) end end)`;
    
    return antiCode;
}

// ==================== VM STRINGS ====================

class VMStringsCompiler {
    constructor() {
        this.constantPool = [];
        this.stringToIndex = {};
    }
    
    registerString(cleanString) {
        if (this.stringToIndex[cleanString] !== undefined) {
            return this.stringToIndex[cleanString];
        }
        const idx = this.constantPool.length;
        this.constantPool.push(cleanString);
        this.stringToIndex[cleanString] = idx;
        return idx;
    }
    
    encryptPool(vmKey) {
        const encryptedPool = [];
        const stepMod = Math.floor(Math.random() * 5) + 3;
        const xorOffset = Math.floor(Math.random() * 41) + 10;
        
        for (let item of this.constantPool) {
            const encryptedBytes = [];
            for (let idx = 0; idx < item.length; idx++) {
                const charByte = item.charCodeAt(idx);
                let transformed = (charByte ^ vmKey) % 256;
                transformed = (transformed + idx + xorOffset) % 256;
                transformed = transformed ^ stepMod;
                encryptedBytes.push(String(transformed));
            }
            encryptedPool.push(`{${encryptedBytes.join(',')}}`);
        }
        return { encryptedPool, stepMod, xorOffset };
    }
}

// ==================== VIRTUALIZER ====================

function generateVirtualizedEnvironment(userCode) {
    if (!userCode.trim()) return userCode;
    
    const stringCompiler = new VMStringsCompiler();
    const constIndex = stringCompiler.registerString(userCode);
    
    const OP_LOADK = Math.floor(Math.random() * 100) + 100;
    const OP_ADD = Math.floor(Math.random() * 100) + 200;
    const OP_SUB = Math.floor(Math.random() * 100) + 300;
    const OP_MUL = Math.floor(Math.random() * 100) + 400;
    const OP_DIV = Math.floor(Math.random() * 100) + 500;
    const OP_CALL = Math.floor(Math.random() * 100) + 600;
    const OP_RETURN = Math.floor(Math.random() * 100) + 700;
    const OP_JMP = Math.floor(Math.random() * 100) + 800;
    
    let bytecode = [
        `{${OP_LOADK},1,${constIndex}}`,
        `{${OP_CALL},1,0}`,
        `{${OP_RETURN},0,0}`
    ];
    
    for (let i = 0; i < Math.floor(Math.random() * 11) + 5; i++) {
        const op = [OP_ADD, OP_SUB, OP_MUL, OP_DIV, OP_JMP][Math.floor(Math.random() * 5)];
        if (op === OP_JMP) {
            bytecode.splice(Math.floor(Math.random() * bytecode.length), 0, `{${OP_JMP},0,${Math.floor(Math.random() * bytecode.length) + 1}}`);
        } else {
            bytecode.splice(Math.floor(Math.random() * bytecode.length), 0, `{${op},${Math.floor(Math.random() * 11)},${Math.floor(Math.random() * 11)}}`);
        }
    }
    
    const vmKey = Math.floor(Math.random() * 151) + 50;
    const { encryptedPool, stepMod, xorOffset } = stringCompiler.encryptPool(vmKey);
    
    const vInstrSet = `_${randomString(9)}`;
    const vConstSet = `_${randomString(9)}`;
    const vStack = `_${randomString(9)}`;
    const vPc = `_${randomString(9)}`;
    const vCurrInst = `_${randomString(9)}`;
    const vDecrypt = `_${randomString(9)}`;
    const vOutPool = `_${randomString(9)}`;
    
    return `local ${vInstrSet}={${bytecode.join(',')}} local ${vConstSet}={${encryptedPool.join(',')}} local ${vOutPool}={} local function ${vDecrypt}(data) local buf={} for i=1,#data do local byte=data[i] byte=bit32.bxor(byte,${stepMod}) byte=(byte-(i-1)-${xorOffset})%256 byte=bit32.bxor(byte,${vmKey}) table.insert(buf,string.char(byte)) end return table.concat(buf) end for i=1,#${vConstSet} do ${vOutPool}[i-1]=${vDecrypt}(${vConstSet}[i]) end local ${vPc}=1 local ${vStack}={} while true do local ${vCurrInst}=${vInstrSet}[${vPc}] local opcode=${vCurrInst}[1] if opcode==${OP_LOADK} then ${vStack}[${vCurrInst}[2]]=${vOutPool}[${vCurrInst}[3]] elseif opcode==${OP_ADD} then ${vStack}[${vCurrInst}[2]]=${vStack}[${vCurrInst}[2]]+${vStack}[${vCurrInst}[3]] elseif opcode==${OP_SUB} then ${vStack}[${vCurrInst}[2]]=${vStack}[${vCurrInst}[2]]-${vStack}[${vCurrInst}[3]] elseif opcode==${OP_MUL} then ${vStack}[${vCurrInst}[2]]=${vStack}[${vCurrInst}[2]]*${vStack}[${vCurrInst}[3]] elseif opcode==${OP_DIV} then ${vStack}[${vCurrInst}[2]]=${vStack}[${vCurrInst}[2]]/${vStack}[${vCurrInst}[3]] elseif opcode==${OP_CALL} then local target=${vStack}[${vCurrInst}[2]] local loader=loadstring or load if loader then local chunk,err=loader(target) if chunk then task.spawn(chunk) else error(err) end end elseif opcode==${OP_RETURN} then break elseif opcode==${OP_JMP} then ${vPc}=${vCurrInst}[3]-1 end ${vPc}=${vPc}+1 end`;
}

// ==================== SCRAMBLER ====================

function scrambleFlow(luaCode) {
    luaCode = luaCode.replace(/--[^\n]*/g, '');
    const lines = luaCode.split(/[\n;]/).map(l => l.trim()).filter(l => l);
    if (lines.length < 4 || /function|then|do|repeat/.test(luaCode)) {
        return luaCode;
    }
    
    const stateKeys = [];
    while (stateKeys.length < lines.length) {
        const val = Math.floor(Math.random() * 90000) + 10000;
        if (!stateKeys.includes(val)) stateKeys.push(val);
    }
    stateKeys.sort();
    
    const states = {};
    for (let i = 0; i < lines.length; i++) {
        states[stateKeys[i]] = [lines[i], stateKeys[i + 1] || 0];
    }
    
    const vState = `_${randomString(9)}`;
    const vActive = `_${randomString(9)}`;
    
    const initialState = stateKeys[0];
    const shuffledStates = Object.keys(states).sort(() => Math.random() - 0.5);
    
    const scrambledBlocks = [];
    for (let stateVal of shuffledStates) {
        const [lineContent, nextStateVal] = states[stateVal];
        scrambledBlocks.push(`if ${vState}==${stateVal} then ${lineContent} ${vState}=${nextStateVal} end`);
    }
    
    const dispatchTable = scrambledBlocks.join(' ');
    return `local ${vState}=${initialState} local ${vActive}=true local yc=0 while ${vActive} do ${dispatchTable} if ${vState}==0 then ${vActive}=false end yc=yc+1 if yc>100 then yc=0;task.wait() end end`;
}

// ==================== COMPILER ====================

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

// ==================== VM GENERATOR ====================

function generateVM(bytecode, constants) {
    const vmName = randomName();
    const pcVar = randomName();
    const stackVar = randomName();
    const envVar = randomName();
    const constVar = randomName();
    
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
    
    return `
    local ${vmName}={}
    local ${pcVar}=1
    local ${stackVar}={}
    local ${envVar}=getfenv()or _G
    local ${constVar}=${constTable}
    local bytecode=${bcTable}
    ${opImpls.join('')}
    local opTable=${opTable}
    
    function ${vmName}:execute()
        local pc=1
        local iter=0
        while true do
            iter=iter+1
            if iter>${MAX_VM_ITERATIONS} then error("L") end
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
}

// ==================== JUNK GENERATOR ====================

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

// ==================== MAIN OBFUSCATOR ====================

function obfuscate(sourceCode) {
    if (!sourceCode || sourceCode.trim() === '') {
        return '-- Error: No source';
    }
    
    console.error('🔒 Obfuscator v3.0');
    console.error(`📊 Original: ${sourceCode.length} bytes`);
    
    // 1. Encode strings
    let encoded = encodeAllStrings(sourceCode);
    
    // 2. Generate anti-tamper
    const antiTamper = generateAntiTamper();
    
    // 3. Virtualize
    let virtualized = generateVirtualizedEnvironment(encoded);
    
    // 4. Scramble flow
    let scrambled = scrambleFlow(virtualized);
    
    // 5. Compile to bytecode
    const { bytecode, constants } = compileToBytecode(scrambled);
    console.error(`📊 Bytecode: ${bytecode.length} instr, ${constants.length} const`);
    
    // 6. Generate VM
    let vm = generateVM(bytecode, constants);
    
    // 7. Generate junk
    let junk1 = generateJunk(JUNK_LINES);
    let junk2 = generateJunk(JUNK_LINES);
    let junk3 = generateJunk(JUNK_LINES);
    
    // 8. Build final code
    let finalCode = HEADER + '\n';
    finalCode += antiTamper + '\n';
    finalCode += junk1 + '\n';
    finalCode += vm + '\n';
    finalCode += junk2 + '\n';
    finalCode += junk3 + '\n';
    
    // 9. Compress
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

module.exports = { obfuscate };a
