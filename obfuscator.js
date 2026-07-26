const HEADER = `--[[ protected ]]`;

// ==================== CONFIGURACIÓN ====================
const SETTINGS = {
  targetVersion: 'Roblox',
  optimizationLevel: 3,
  disableLineInfo: true,
  staticEnvironment: true,
  compatibilityMode: false,
  useDebugLibrary: false,
  enableGCFixes: false,
  intenseVMStructure: false,
  vmCompression: false,
  enableFFI: false,
  hardcodeGlobals: true,
  debugVM: false
};

// ==================== TODAS LAS VARIABLES ORIGINALES ====================
const VAR_POOL = [
  "vip", "vip_", "vipx", "vipz", "vipcore", "vipguard", "vipshield",
  "etr", "etr_", "etrx", "etrz", "etrcore", "etrguard", "etrshield",
  "etretr", "etretr_", "etretrx", "etretrz", "etretrcore",
  "guard", "guardian", "protect", "shield", "armor", "defense", "barrier",
  "sys", "syscore", "sysguard", "sysprotect", "sysvm",
  "exec", "execcore", "execguard", "execvm", "execprotect",
  "mem", "memcore", "memguard", "memprotect", "memvm",
  "ctrl", "ctrlcore", "ctrlsys", "ctrlvm", "ctrlprotect",
  "num", "numcore", "numguard", "numprotect",
  "state", "statecore", "stateguard", "stateprotect",
  "stack", "stackcore", "stackguard", "stackprotect",
  "reg", "regcore", "regguard", "regprotect",
  "tbl", "tblcore", "tblguard", "tblprotect",
  "fn", "fncore", "fnguard", "fnprotect",
  "str", "strcore", "strguard", "strprotect"
];

const VAR_SUFFIXES = [
  "", "_", "__", "x", "z", "core", "guard", "protect", "shield", 
  "sys", "vm", "exec", "mem", "ctrl", "state", "stack", "reg", "tbl", "fn", "str"
];

const VAR_PREFIXES = [
  "vip", "etr", "etretr", "guard", "protect", "shield", "armor", "defense",
  "sys", "exec", "mem", "ctrl", "state", "stack", "reg", "tbl", "fn", "str"
];

const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL"];

// ==================== TODOS LOS OPCODES ====================
const OPCODE_POOL = [
  "OP_ADD", "OP_SUB", "OP_MUL", "OP_DIV", "OP_MOD", "OP_POW", 
  "OP_CONCAT", "OP_LEN", "OP_EQ", "OP_LT", "OP_LE", "OP_NOT", 
  "OP_AND", "OP_OR", "OP_LOAD", "OP_STORE", "OP_CALL", "OP_RETURN"
];

// ==================== FUNCIONES AUXILIARES ====================

function generateVarName() {
  const prefix = VAR_PREFIXES[Math.floor(Math.random() * VAR_PREFIXES.length)];
  const suffix = VAR_SUFFIXES[Math.floor(Math.random() * VAR_SUFFIXES.length)];
  const number = Math.floor(Math.random() * 9999);
  
  const combinations = [
    `${prefix}${suffix}${number}`,
    `${prefix}${number}${suffix}`,
    `${prefix}_${number}`,
    `${prefix}${number}`,
    `${prefix}${suffix}`
  ];
  
  return combinations[Math.floor(Math.random() * combinations.length)];
}

function generateIlName() {
  return generateVarName();
}

function generateOpcodeName() {
  return OPCODE_POOL[Math.floor(Math.random() * OPCODE_POOL.length)] + "_" + Math.floor(Math.random() * 999);
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

function runtimeString(str) {
  return `string.char(${str.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`;
}

function applyCFF(blocks) {
  const stateVar = generateIlName();
  let lua = `local ${stateVar}=1 while true do `;
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) lua += `if ${stateVar}==1 then ${blocks[i]} ${stateVar}=2 `;
    else lua += `elseif ${stateVar}==${i+1} then ${blocks[i]} ${stateVar}=${i+2} `;
  }
  lua += `elseif ${stateVar}==${blocks.length+1} then break end end `;
  return lua;
}

// ==================== MATH SIMPLIFICADO ====================

function heavyMath(n) {
  if (Math.random() < 0.4) return n.toString();
  let a = Math.floor(Math.random() * 100) + 10;
  let b = Math.floor(Math.random() * 50) + 2;
  return `(((${n}+${a})*${b}/${b})-${a})`;
}

function mbaOptimized() {
  let n = Math.random() > 0.5 ? 1 : 2;
  let a = Math.floor(Math.random() * 70) + 15;
  return `(${n}*${a}-${a}+${n})`;
}

// ==================== CÓDIGO BASURA REDUCIDO ====================

function generateJunk(lines = 15) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const varName = generateIlName();
    const r = Math.random();
    if (r < 0.3) j += `local ${varName}=${heavyMath(Math.floor(Math.random() * 99))} `;
    else if (r < 0.6) j += `local ${varName}=string.char(${heavyMath(Math.floor(Math.random()*255))}) `;
    else j += `local ${varName}={} `;
  }
  return j;
}

// ==================== ANTI-DEBUG MINIMO ====================

function getProtections() {
  return `
    local _t=os.clock()for _=1,10000 do end if os.clock()-_t>3 then while true do end end
    if debug and debug.sethook then debug.sethook(function()while true do end end,"l",2)end
  `;
}

// ==================== SISTEMA DE OPCODES ====================

function generateOpcodeSystem() {
  const opcodeVars = {
    dispatch: generateIlName(),
    opTable: generateIlName(),
    exec: generateIlName(),
    stack: generateIlName()
  };

  return `
    -- Opcode System
    local ${opcodeVars.stack} = {}
    local ${opcodeVars.opTable} = {
      OP_LOAD = function(v) table.insert(${opcodeVars.stack}, v) end,
      OP_STORE = function(i, v) ${opcodeVars.stack}[i] = v end,
      OP_ADD = function(a, b) return a + b end,
      OP_SUB = function(a, b) return a - b end,
      OP_MUL = function(a, b) return a * b end,
      OP_DIV = function(a, b) return a / b end,
      OP_MOD = function(a, b) return a % b end,
      OP_POW = function(a, b) return a ^ b end,
      OP_CONCAT = function(a, b) return a .. b end,
      OP_LEN = function(a) return #a end,
      OP_EQ = function(a, b) return a == b end,
      OP_LT = function(a, b) return a < b end,
      OP_LE = function(a, b) return a <= b end,
      OP_NOT = function(a) return not a end,
      OP_AND = function(a, b) return a and b end,
      OP_OR = function(a, b) return a or b end,
      OP_CALL = function(f, ...) return f(...) end,
      OP_RETURN = function(v) return v end
    }
    
    local ${opcodeVars.dispatch} = function(op, ...)
      local func = ${opcodeVars.opTable}[op]
      if func then
        return func(...)
      end
      return nil
    end
    
    local ${opcodeVars.exec} = function(instructions)
      for _, instr in ipairs(instructions) do
        local op = instr[1]
        local args = {unpack(instr, 2)}
        ${opcodeVars.dispatch}(op, unpack(args))
      end
    end
  `;
}

// ==================== DETECCIÓN DE MAPPINGS ====================

function detectAndApplyMappings(code) {
  const MAPEO = {
    "ScreenGui":"Renaming","Frame":"String","TextLabel":"Table",
    "TextButton":"Boolean","Humanoid":"Junk","Player":"Flow",
    "RunService":"VM","TweenService":"Flow","Players":"Flow"
  };
  
  let modified = code, headers = "";
  
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      if (tech === "Renaming") { 
        const v = generateIlName(); 
        headers += `local ${v}="${word}";`; 
        modified = modified.replace(regex, v);
      } else if (tech === "String") {
        modified = modified.replace(regex, `string.char(${word.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`);
      } else if (tech === "Boolean") {
        modified = modified.replace(regex, `((${mbaOptimized()}==1 or true)and"${word}")`);
      }
    }
  }
  return headers + modified;
}

// ==================== VM CON OPCODES ====================

function buildVM(payloadStr) {
  const STACK = generateIlName();
  const KEY = generateIlName();
  const SALT = generateIlName();
  const seed = Math.floor(Math.random() * 100) + 10;
  const saltVal = Math.floor(Math.random() * 100) + 1;

  let vmCore = `
    ${generateOpcodeSystem()}
    local ${STACK}={}
    local ${KEY}=${heavyMath(seed)}
    local ${SALT}=${heavyMath(saltVal)}
  `;

  const chunkSize = 25;
  let chunks = [];
  for (let i = 0; i < payloadStr.length; i += chunkSize) {
    chunks.push(payloadStr.slice(i, i + chunkSize));
  }

  let poolVars = [];
  let realOrder = [];
  let totalChunks = chunks.length * 2;
  let currentReal = 0;
  let globalIndex = 0;

  for (let i = 0; i < totalChunks; i++) {
    let memName = generateIlName();
    poolVars.push(memName);

    if (currentReal < chunks.length && (Math.random() > 0.3 || (totalChunks - i) === (chunks.length - currentReal))) {
      realOrder.push(i + 1);
      let chunk = chunks[currentReal];
      let encrypted = [];
      for (let j = 0; j < chunk.length; j++) {
        let enc = (chunk.charCodeAt(j) + seed + (globalIndex * saltVal)) % 256;
        encrypted.push(heavyMath(enc));
        globalIndex++;
      }
      vmCore += `local ${memName}={${encrypted.join(',')}}`;
      currentReal++;
    } else {
      let fake = [];
      for (let j = 0; j < Math.floor(Math.random() * 8) + 3; j++) {
        fake.push(heavyMath(Math.floor(Math.random() * 255)));
      }
      vmCore += `local ${memName}={${fake.join(',')}}`;
    }
  }

  vmCore += `
    local _p={${poolVars.join(',')}}local _o={${realOrder.map(n => heavyMath(n)).join(',')}}local _g=0
    for _,i in ipairs(_o)do for _,b in ipairs(_p[i])do
      table.insert(${STACK},string.char((b-${KEY}-_g*${SALT})%256))_g=_g+1
    end end
    local _e=table.concat(${STACK})${STACK}=nil
  `;

  const ASSERT = `getfenv()[${runtimeString("assert")}]`;
  const LOADSTRING = `getfenv()[${runtimeString("loadstring")}]`;
  const GAME = `getfenv()[${runtimeString("game")}]`;

  if (payloadStr.includes("http")) {
    vmCore += `${ASSERT}(${LOADSTRING}(${GAME}["HttpGet"](${GAME},_e)))()`;
  } else {
    vmCore += `${ASSERT}(${LOADSTRING}(_e))()`;
  }

  return vmCore;
}

// ==================== CAPAS VM REDUCIDAS ====================

function buildFragileVM(innerCode, depth = 0) {
  const maxDepth = 3; // Solo 3 capas
  
  if (depth >= maxDepth) return innerCode;

  const vmName = generateIlName();
  const handlerCount = Math.floor(Math.random() * 2) + 2;
  const handlers = pickHandlers(handlerCount);
  const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName();

  let out = `local ${vmName}={} `;
  
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(${vmName}) `;
      out += `if ${vmName}[1]~=nil then error("corrupted") end `;
      out += buildFragileVM(innerCode, depth + 1);
      out += ` end `;
    } else {
      out += `local ${handlers[i]}=function(${vmName}) return nil end `;
    }
  }

  out += `local ${DISPATCH}={`;
  for (let i = 0; i < handlers.length; i++) {
    out += `[${i+1}]=${handlers[i]},`;
  }
  out += `} `;

  const execBlocks = [];
  for (let i = 0; i < handlers.length; i++) {
    execBlocks.push(`${DISPATCH}[${i+1}](${vmName})`);
  }
  out += applyCFF(execBlocks);
  return out;
}

// ==================== FUNCIÓN PRINCIPAL ====================

function obfuscate(sourceCode, settings = {}) {
  if (!sourceCode) return '-- Error: No Source';

  Object.assign(SETTINGS, settings);

  let payloadToProtect = sourceCode;
  const loadstringMatch = sourceCode.match(/loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i);
  if (loadstringMatch) {
    payloadToProtect = loadstringMatch[1];
  } else {
    payloadToProtect = detectAndApplyMappings(sourceCode);
  }

  let vm = buildVM(payloadToProtect);
  
  // Solo 2 capas
  for (let i = 0; i < 2; i++) {
    vm = buildFragileVM(vm, i);
  }

  let finalCode = `${HEADER}${getProtections()}${generateJunk(10)}${vm}`.replace(/\s+/g, " ").trim();

  // Tamaño objetivo 20-30KB
  const targetSize = 25 * 1024;
  let currentSize = Buffer.byteLength(finalCode, 'utf8');

  if (currentSize < targetSize) {
    const additionalLines = Math.ceil((targetSize - currentSize) / 50);
    finalCode = `${HEADER}${getProtections()}${generateJunk(10 + additionalLines)}${vm}`.replace(/\s+/g, " ").trim();
  }

  return finalCode;
}

module.exports = { obfuscate, SETTINGS };
