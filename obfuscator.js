// obfuscator.js - Ofuscador principal con anti-tamper integrado

const antitamper = require('./antitamper.js');

// ==================== HEADER ====================
const HEADER = `--[[ protected ]]`;

// ==================== CONFIGURACIÓN ====================
const SETTINGS = {
  targetVersion: 'Roblox',
  optimizationLevel: 3,
  disableLineInfo: true,
  staticEnvironment: true,
  compatibilityMode: false,
  useDebugLibrary: true,
  enableGCFixes: false,
  intenseVMStructure: true,
  vmCompression: false,
  enableFFI: false,
  hardcodeGlobals: true,
  debugVM: false,
  antiTamper: true // Activado por defecto
};

// ==================== POOLS ====================
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

const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"];

// ==================== FUNCIONES AUXILIARES ====================

function generateVarName() {
  const prefix = VAR_PREFIXES[Math.floor(Math.random() * VAR_PREFIXES.length)];
  const suffix = VAR_SUFFIXES[Math.floor(Math.random() * VAR_SUFFIXES.length)];
  const number = Math.floor(Math.random() * 9999);
  return `${prefix}${suffix}${number}`;
}

function generateIlName() {
  return generateVarName();
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
  return `string.char(${str.split('').map(c => c.charCodeAt(0)).join(',')})`;
}

// ==================== TÉCNICAS DE OFUSCACIÓN ====================

function técnica_StringSplitting(str) {
  const parts = [];
  for (let i = 0; i < str.length; i += 3) {
    parts.push(`"${str.slice(i, i + 3)}"`);
  }
  return parts.join('..');
}

function técnica_TableIndirection(str) {
  const tableName = generateIlName();
  const keys = [];
  let code = `${tableName}={`;
  for (let i = 0; i < str.length; i++) {
    const key = generateIlName();
    keys.push(key);
    code += `[${key}]="${str[i]}",`;
  }
  code += `}`;
  return { code, tableName, keys };
}

function técnica_FunctionWrapping(code) {
  const fnName = generateIlName();
  return `do ${fnName}=function()${code}end ${fnName}() end`;
}

function técnica_ControlFlowFlattening(blocks) {
  const stateVar = generateIlName();
  let code = `do ${stateVar}=1 while true do `;
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) code += `if ${stateVar}==1 then ${blocks[i]} ${stateVar}=2 `;
    else code += `elseif ${stateVar}==${i+1} then ${blocks[i]} ${stateVar}=${i+2} `;
  }
  code += `elseif ${stateVar}==${blocks.length+1} then break end end end `;
  return code;
}

function técnica_DeadCode() {
  const varName = generateIlName();
  return `do ${varName}=function()${varName}()end end`;
}

function técnica_OpaquePredicates() {
  const a = Math.floor(Math.random() * 100);
  const b = Math.floor(Math.random() * 100);
  const c = Math.floor(Math.random() * 100);
  return `((${a}+${b})*${c}==${(a+b)*c})`;
}

function técnica_SelfModifying(code) {
  const varName = generateIlName();
  return `do ${varName}=[[${code}]] loadstring(${varName})() end`;
}

function técnica_GarbageVars(count = 5) {
  let code = '';
  for (let i = 0; i < count; i++) {
    const name = generateIlName();
    code += `${name}=${Math.random() > 0.5 ? `"${generateIlName()}"` : '{}'} `;
  }
  return `do ${code} end`;
}

function técnica_StringEncoding(str) {
  const encoded = [];
  const key = Math.floor(Math.random() * 255);
  for (let i = 0; i < str.length; i++) {
    encoded.push(str.charCodeAt(i) ^ key);
  }
  const tableName = generateIlName();
  return `do ${tableName}={${encoded.join(',')}} string.char(unpack(${tableName})) end`;
}

function técnica_DynamicDispatch(handlers) {
  const dispatchName = generateIlName();
  let code = `do ${dispatchName}=function(idx)`;
  code += `local handlers={${handlers.join(',')}}`;
  code += `return handlers[idx]`;
  code += `end end`;
  return code;
}

function técnica_CoroutineObfuscation(code) {
  const coName = generateIlName();
  return `do ${coName}=coroutine.wrap(function()${code}end) ${coName}() end`;
}

// ==================== COMPONENTES DE VM ====================

function componente_InstructionDecoder() {
  const decoderName = generateIlName();
  return `
    do ${decoderName}=function(instruction)
      local op=string.sub(instruction,1,3)
      local args={}
      local count=0
      for arg in string.gmatch(string.sub(instruction,4),"[^,]+") do
        count=count+1
        args[count]=arg
      end
      return op,args
    end end
  `;
}

function componente_MemoryManager() {
  const memName = generateIlName();
  return `
    do ${memName}={
      heap={},
      stack={},
      globals={}
    }
    function ${memName}:alloc(size)
      local addr=#self.heap+1
      self.heap[addr]={}
      return addr
    end
    function ${memName}:free(addr)
      self.heap[addr]=nil
    end
    function ${memName}:push(value)
      table.insert(self.stack,value)
    end
    function ${memName}:pop()
      return table.remove(self.stack)
    end end
  `;
}

function componente_ExecutionEngine() {
  const engineName = generateIlName();
  return `
    do ${engineName}=function(bytecode)
      local pc=1
      while pc<=#bytecode do
        local instr=bytecode[pc]
        local op=instr[1]
        local args=instr[2]
        if op=="push" then
          componente_MemoryManager:push(args[1])
        elseif op=="call" then
          local f=componente_MemoryManager:pop()
          f()
        elseif op=="add" then
          local b=componente_MemoryManager:pop()
          local a=componente_MemoryManager:pop()
          componente_MemoryManager:push(a+b)
        end
        pc=pc+1
      end
    end end
  `;
}

function componente_GarbageCollector() {
  const gcName = generateIlName();
  return `
    do ${gcName}={
      threshold=1000,
      count=0
    }
    function ${gcName}:collect()
      self.count=self.count+1
      if self.count>=self.threshold then
        collectgarbage()
        self.count=0
      end
    end end
  `;
}

function componente_ExceptionHandler() {
  const ehName = generateIlName();
  return `
    do ${ehName}=function(err)
      local stack=debug and debug.traceback or "No traceback"
      return {
        error=err,
        traceback=stack
      }
    end end
  `;
}

// ==================== VM PRINCIPAL ====================

function buildVM(payloadStr) {
  const STACK = generateIlName();
  const KEY = generateIlName();
  const SALT = generateIlName();
  const seed = Math.floor(Math.random() * 200) + 50;
  const saltVal = Math.floor(Math.random() * 250) + 1;

  let vmCore = `
    ${componente_InstructionDecoder()}
    ${componente_MemoryManager()}
    ${componente_ExecutionEngine()}
    ${componente_GarbageCollector()}
    ${componente_ExceptionHandler()}
    do
    ${STACK}={}
    ${KEY}=${seed}
    ${SALT}=${saltVal}
  `;

  const chunkSize = 15;
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
        encrypted.push(enc);
        globalIndex++;
      }
      vmCore += `${memName}={${encrypted.join(',')}}`;
      currentReal++;
    } else {
      let fake = [];
      for (let j = 0; j < Math.floor(Math.random() * 10) + 3; j++) {
        fake.push(Math.floor(Math.random() * 255));
      }
      vmCore += `${memName}={${fake.join(',')}}`;
    }
  }

  vmCore += `
    _pool={${poolVars.join(',')}}
    _order={${realOrder.join(',')}}
    _gIdx=0
    for _, idx in ipairs(_order) do
      for _, byte in ipairs(_pool[idx]) do
        table.insert(${STACK}, string.char(math.floor((byte - ${KEY} - _gIdx * ${SALT}) % 256)))
        _gIdx=_gIdx+1
      end
    end
    _e=table.concat(${STACK})
    ${STACK}=nil
  `;

  const ASSERT = `assert`;
  const LOADSTRING = `loadstring`;
  const GAME = `game`;

  if (payloadStr.includes("http")) {
    vmCore += `${ASSERT}(${LOADSTRING}(${GAME}:HttpGet(_e)))()`;
  } else {
    vmCore += `${ASSERT}(${LOADSTRING}(_e))()`;
  }

  vmCore += ` end `;
  return vmCore;
}

// ==================== CAPAS VM ====================

function buildFragileVM(innerCode, depth = 0) {
  const maxDepth = 2;
  if (depth >= maxDepth) return innerCode;

  const vmName = generateIlName();
  const handlerCount = Math.floor(Math.random() * 2) + 2;
  const handlers = pickHandlers(handlerCount);
  const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName();

  let out = `do ${vmName}={} `;
  
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `${handlers[i]}=function(${vmName}) `;
      out += `if ${vmName}[1]~=nil then error("corrupted") end `;
      out += buildFragileVM(innerCode, depth + 1);
      out += ` end `;
    } else {
      out += `${handlers[i]}=function(${vmName}) return nil end `;
    }
  }

  out += técnica_DynamicDispatch(handlers);
  
  const execBlocks = [];
  for (let i = 0; i < handlers.length; i++) {
    execBlocks.push(`${DISPATCH}(${i+1})(${vmName})`);
  }
  out += técnica_ControlFlowFlattening(execBlocks);
  out += ` end `;
  
  return out;
}

// ==================== GENERADOR DE CÓDIGO BASURA ====================

function generateAdvancedJunk(lines = 8) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const varName = generateIlName();
    const r = Math.random();
    if (r < 0.3) j += `do ${varName}=function()${varName}()end end `;
    else if (r < 0.6) j += `do ${varName}=setmetatable({}, {__index=function()return nil end}) end `;
    else j += `do ${varName}=coroutine.wrap(function()coroutine.yield()end) end `;
  }
  return j;
}

// ==================== DETECCIÓN DE MAPPINGS ====================

function detectAndApplyMappings(code) {
  const MAPEO = {
    "ScreenGui":"Renaming","Frame":"String","TextLabel":"Table",
    "TextButton":"Boolean","Humanoid":"Junk","Player":"Flow"
  };
  
  let modified = code, headers = "";
  
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      if (tech === "Renaming") { 
        const v = generateIlName(); 
        headers += `${v}="${word}";`; 
        modified = modified.replace(regex, v);
      } else if (tech === "String") {
        modified = modified.replace(regex, técnica_StringEncoding(word));
      }
    }
  }
  return headers + modified;
}

// ==================== FUNCIÓN PRINCIPAL ====================

function obfuscate(sourceCode, settings = {}) {
  if (!sourceCode) return '-- Error: No Source';

  Object.assign(SETTINGS, settings);

  // Si el anti-tamper está activado, usarlo
  if (SETTINGS.antiTamper) {
    // Generar el código con anti-tamper integrado
    return antitamper.obfuscate(sourceCode);
  }

  // Si no, usar el ofuscador normal
  let payloadToProtect = sourceCode;
  const loadstringMatch = sourceCode.match(/loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i);
  if (loadstringMatch) {
    payloadToProtect = loadstringMatch[1];
  } else {
    payloadToProtect = detectAndApplyMappings(sourceCode);
  }

  let obfuscatedPayload = payloadToProtect;
  obfuscatedPayload = técnica_StringSplitting(obfuscatedPayload);
  obfuscatedPayload = técnica_FunctionWrapping(obfuscatedPayload);
  obfuscatedPayload = técnica_SelfModifying(obfuscatedPayload);

  let vm = buildVM(obfuscatedPayload);
  
  for (let i = 0; i < 2; i++) {
    vm = buildFragileVM(vm, i);
  }

  let finalCode = `
    ${HEADER}
    ${técnica_GarbageVars(5)}
    ${generateAdvancedJunk(5)}
    ${vm}
  `;

  finalCode = finalCode.replace(/\s+/g, " ").trim();

  const targetSize = 20 * 1024;
  let currentSize = Buffer.byteLength(finalCode, 'utf8');

  if (currentSize < targetSize) {
    const additionalLines = Math.ceil((targetSize - currentSize) / 50);
    finalCode = `
      ${HEADER}
      ${técnica_GarbageVars(5)}
      ${generateAdvancedJunk(5 + additionalLines)}
      ${vm}
    `.replace(/\s+/g, " ").trim();
  }

  return finalCode;
}

// ==================== EXPORTACIÓN ====================
module.exports = { 
  obfuscate, 
  SETTINGS,
  // Exportar también las funciones del anti-tamper para uso directo
  antitamper
};
