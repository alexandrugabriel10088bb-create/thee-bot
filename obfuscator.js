const HEADER = `--[[ this code it's protected by vmmer obfoscator ]]`;

// ==================== CONFIGURACIÓN DE SETTINGS ====================
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
  debugVM: true // Nueva opción para debugging de VM
};

// ==================== POOL DE VARIABLES MEJORADO ====================
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
const OPCODE_POOL = ["OP_ADD", "OP_SUB", "OP_MUL", "OP_DIV", "OP_MOD", "OP_POW", "OP_CONCAT", "OP_LEN", "OP_EQ", "OP_LT", "OP_LE", "OP_NOT", "OP_AND", "OP_OR"];

// ==================== VARIABLES DE DEBUG PERSONALIZADAS ====================
const DEBUG_VARS = {
  vmState: "vmstate",
  vmCounter: "vmcounter",
  vmStack: "vmstack",
  vmReg: "vmreg",
  vmFlags: "vmflags",
  vmTrace: "vmtrace",
  vmBreak: "vmbreak",
  vmWatch: "vmwatch",
  vmLog: "vmlog",
  vmError: "vmerror",
  vmStatus: "vmstatus"
};

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

function generateDebugVarName() {
  const debugKeys = Object.keys(DEBUG_VARS);
  const key = debugKeys[Math.floor(Math.random() * debugKeys.length)];
  return DEBUG_VARS[key] + "_" + Math.floor(Math.random() * 999);
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
  return `string.char(${str.split('').map(c => heavyMathOptimized(c.charCodeAt(0))).join(',')})`;
}

function applyCFF(blocks) {
  const stateVar = generateIlName();
  let lua = `local ${stateVar}=${heavyMathOptimized(1)} while true do `;
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) lua += `if ${stateVar}==${heavyMathOptimized(1)} then ${blocks[i]} ${stateVar}=${heavyMathOptimized(2)} `;
    else         lua += `elseif ${stateVar}==${heavyMathOptimized(i + 1)} then ${blocks[i]} ${stateVar}=${heavyMathOptimized(i + 2)} `;
  }
  lua += `elseif ${stateVar}==${heavyMathOptimized(blocks.length + 1)} then break end end `;
  return lua;
}

// ==================== OPTIMIZACIONES DE NIVEL ====================

function heavyMathOptimized(n) {
  if (SETTINGS.optimizationLevel >= 1) {
    if (Math.random() < 0.3) return n.toString();
  }
  
  let a = Math.floor(Math.random() * 5000) + 1000;
  let b = Math.floor(Math.random() * 100) + 2;
  let c = Math.floor(Math.random() * 800) + 10;
  
  if (SETTINGS.optimizationLevel >= 2) {
    return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${c})/${c})-${c})`;
  }
  
  if (SETTINGS.optimizationLevel >= 3) {
    return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${c})/${c})-${c})`;
  }
  
  return n.toString();
}

function mbaOptimized() {
  let n = Math.random() > 0.5 ? 1 : 2;
  let a = Math.floor(Math.random() * 70) + 15;
  let b = Math.floor(Math.random() * 40) + 8;
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

// ==================== GENERADOR DE CÓDIGO BASURA OPTIMIZADO ====================

function generateJunkOptimized(lines = 100) {
  let j = '';
  const optimizationLevel = SETTINGS.optimizationLevel;
  
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    
    if (optimizationLevel >= 3 && r < 0.3) continue;
    if (optimizationLevel >= 2 && r < 0.2) continue;
    
    const varName = generateIlName();
    
    if (r < 0.2) j += `local ${varName}=${heavyMathOptimized(Math.floor(Math.random() * 999))} `;
    else if (r < 0.4) j += `local ${varName}=string.char(${heavyMathOptimized(Math.floor(Math.random()*255))}) `;
    else if (r < 0.5) j += `if not(${heavyMathOptimized(1)}==${heavyMathOptimized(1)}) then local x=1 end `;
    else if (r < 0.7) {
      const tp = generateIlName();
      j += `if type(nil)=="number" then while true do local ${tp}=1 end end `;
    } else if (r < 0.85) {
      const vt = generateIlName();
      j += `do local ${vt}={} ${vt}["_"]=1 ${vt}=nil end `;
    } else {
      j += `if type(math.pi)=="string" then local _=1 end `;
    }
  }
  return j;
}

// ==================== SISTEMA DE RECONSTRUCCIÓN DE VM DESDE CERO ====================

function generateVMReconstructionSystem() {
  const rebuildVars = {
    vmCore: generateIlName(),
    vmContext: generateIlName(),
    vmMemory: generateIlName(),
    vmRegisters: generateIlName(),
    vmCounter: generateIlName(),
    vmState: generateIlName(),
    vmFlags: generateIlName(),
    vmStackPtr: generateIlName(),
    vmBasePtr: generateIlName(),
    vmCode: generateIlName(),
    vmData: generateIlName(),
    vmHeap: generateIlName()
  };

  return `
    -- VM Reconstruction System
    local ${rebuildVars.vmCore} = {}
    local ${rebuildVars.vmContext} = {}
    local ${rebuildVars.vmMemory} = {}
    local ${rebuildVars.vmRegisters} = {}
    local ${rebuildVars.vmCounter} = 0
    local ${rebuildVars.vmState} = "idle"
    local ${rebuildVars.vmFlags} = {}
    local ${rebuildVars.vmStackPtr} = 0
    local ${rebuildVars.vmBasePtr} = 0
    local ${rebuildVars.vmCode} = {}
    local ${rebuildVars.vmData} = {}
    local ${rebuildVars.vmHeap} = {}
    
    -- VM Initialization
    function ${rebuildVars.vmCore}.init()
      ${rebuildVars.vmState} = "initializing"
      ${rebuildVars.vmCounter} = 0
      ${rebuildVars.vmStackPtr} = 0
      ${rebuildVars.vmBasePtr} = 0
      ${rebuildVars.vmContext}.version = "1.0"
      ${rebuildVars.vmContext}.platform = "${SETTINGS.targetVersion}"
      ${rebuildVars.vmContext}.debug = ${SETTINGS.debugVM}
      ${rebuildVars.vmRegisters} = {
        pc = 0,
        sp = 0,
        bp = 0,
        flags = 0,
        acc = 0
      }
      ${rebuildVars.vmState} = "ready"
      return true
    end
    
    -- VM Reset
    function ${rebuildVars.vmCore}.reset()
      ${rebuildVars.vmState} = "resetting"
      ${rebuildVars.vmMemory} = {}
      ${rebuildVars.vmRegisters} = {
        pc = 0,
        sp = 0,
        bp = 0,
        flags = 0,
        acc = 0
      }
      ${rebuildVars.vmStackPtr} = 0
      ${rebuildVars.vmCode} = {}
      ${rebuildVars.vmData} = {}
      ${rebuildVars.vmHeap} = {}
      ${rebuildVars.vmState} = "ready"
      return true
    end
    
    -- VM Load
    function ${rebuildVars.vmCore}.load(code, data)
      ${rebuildVars.vmState} = "loading"
      ${rebuildVars.vmCode} = code or {}
      ${rebuildVars.vmData} = data or {}
      ${rebuildVars.vmRegisters}.pc = 0
      ${rebuildVars.vmState} = "loaded"
      return true
    end
    
    -- VM Execute
    function ${rebuildVars.vmCore}.execute()
      ${rebuildVars.vmState} = "executing"
      local _pc = ${rebuildVars.vmRegisters}.pc
      while _pc < #${rebuildVars.vmCode} do
        local instr = ${rebuildVars.vmCode}[_pc + 1]
        if instr then
          local op = instr[1]
          local args = {unpack(instr, 2)}
          ${rebuildVars.vmCore}.dispatch(op, args)
          _pc = _pc + 1
          ${rebuildVars.vmRegisters}.pc = _pc
          ${rebuildVars.vmCounter} = ${rebuildVars.vmCounter} + 1
        end
        if ${rebuildVars.vmState} == "halted" then
          break
        end
      end
      ${rebuildVars.vmState} = "completed"
      return true
    end
    
    -- VM Dispatch
    function ${rebuildVars.vmCore}.dispatch(op, args)
      local ops = {
        NOP = function() end,
        HALT = function() ${rebuildVars.vmState} = "halted" end,
        LOAD = function(v) ${rebuildVars.vmRegisters}.acc = v end,
        STORE = function(i) ${rebuildVars.vmMemory}[i] = ${rebuildVars.vmRegisters}.acc end,
        ADD = function(a, b) ${rebuildVars.vmRegisters}.acc = a + b end,
        SUB = function(a, b) ${rebuildVars.vmRegisters}.acc = a - b end,
        MUL = function(a, b) ${rebuildVars.vmRegisters}.acc = a * b end,
        DIV = function(a, b) ${rebuildVars.vmRegisters}.acc = a / b end,
        MOD = function(a, b) ${rebuildVars.vmRegisters}.acc = a % b end,
        POW = function(a, b) ${rebuildVars.vmRegisters}.acc = a ^ b end,
        CONCAT = function(a, b) ${rebuildVars.vmRegisters}.acc = a .. b end,
        LEN = function(a) ${rebuildVars.vmRegisters}.acc = #a end,
        EQ = function(a, b) ${rebuildVars.vmRegisters}.acc = (a == b) end,
        LT = function(a, b) ${rebuildVars.vmRegisters}.acc = (a < b) end,
        LE = function(a, b) ${rebuildVars.vmRegisters}.acc = (a <= b) end,
        NOT = function(a) ${rebuildVars.vmRegisters}.acc = not a end,
        AND = function(a, b) ${rebuildVars.vmRegisters}.acc = a and b end,
        OR = function(a, b) ${rebuildVars.vmRegisters}.acc = a or b end,
        CALL = function(f, ...) ${rebuildVars.vmRegisters}.acc = f(...) end,
        RETURN = function(v) ${rebuildVars.vmRegisters}.acc = v end
      }
      local func = ops[op]
      if func then
        func(unpack(args or {}))
      end
    end
    
    -- VM Debug
    function ${rebuildVars.vmCore}.debug()
      if ${rebuildVars.vmContext}.debug then
        return {
          state = ${rebuildVars.vmState},
          counter = ${rebuildVars.vmCounter},
          registers = ${rebuildVars.vmRegisters},
          memory = ${rebuildVars.vmMemory},
          stack = ${rebuildVars.vmStackPtr},
          code = ${rebuildVars.vmCode},
          data = ${rebuildVars.vmData},
          heap = ${rebuildVars.vmHeap}
        }
      end
      return nil
    end
    
    -- Initialize VM
    ${rebuildVars.vmCore}.init()
  `;
}

// ==================== SISTEMA DE DEBUG DE VM ====================

function generateVMDebugSystem() {
  const debugVars = {
    trace: generateDebugVarName(),
    breakpoints: generateDebugVarName(),
    watchpoints: generateDebugVarName(),
    log: generateDebugVarName(),
    errorHandler: generateDebugVarName(),
    status: generateDebugVarName()
  };

  return `
    -- VM Debug System
    local ${debugVars.trace} = {}
    local ${debugVars.breakpoints} = {}
    local ${debugVars.watchpoints} = {}
    local ${debugVars.log} = {}
    local ${debugVars.status} = "active"
    
    -- Add breakpoint
    function ${debugVars.breakpoints}.add(address, condition)
      ${debugVars.breakpoints}[address] = condition or true
    end
    
    -- Remove breakpoint
    function ${debugVars.breakpoints}.remove(address)
      ${debugVars.breakpoints}[address] = nil
    end
    
    -- Add watchpoint
    function ${debugVars.watchpoints}.add(variable, condition)
      ${debugVars.watchpoints}[variable] = condition or true
    end
    
    -- Remove watchpoint
    function ${debugVars.watchpoints}.remove(variable)
      ${debugVars.watchpoints}[variable] = nil
    end
    
    -- Log message
    function ${debugVars.log}.write(message, level)
      level = level or "info"
      table.insert(${debugVars.log}, {
        time = os.time(),
        level = level,
        message = message
      })
      if #${debugVars.log} > 1000 then
        table.remove(${debugVars.log}, 1)
      end
    end
    
    -- Error handler
    function ${debugVars.errorHandler}.handle(err)
      ${debugVars.log}.write(err, "error")
      ${debugVars.status} = "error"
      return err
    end
    
    -- Get debug info
    function ${debugVars.trace}.get()
      return {
        status = ${debugVars.status},
        log = ${debugVars.log},
        breakpoints = ${debugVars.breakpoints},
        watchpoints = ${debugVars.watchpoints}
      }
    end
  `;
}

// ==================== DETECCIÓN Y APLICACIÓN DE MAPPINGS ====================

function detectAndApplyMappingsOptimized(code) {
  const MAPEO = {
    "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
    "TextButton":"Mixed Boolean Arithmetic","Humanoid":"Dynamic Junk","Player":"Fake Flow",
    "RunService":"Virtual Machine","TweenService":"Fake Flow","Players":"Fake Flow"
  };
  
  let modified = code, headers = "";
  
  if (SETTINGS.hardcodeGlobals) {
    for (const [word, tech] of Object.entries(MAPEO)) {
      const regex = new RegExp(`\\b${word}\\b`, "g");
      if (regex.test(modified)) {
        headers += `local ${word} = ${word} `;
      }
    }
  }
  
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech.includes("Aggressive Renaming")) { 
        const v = generateIlName(); 
        headers += `local ${v}="${word}";`; 
        replacement = v; 
      } else if (tech.includes("String to Math")) {
        replacement = `string.char(${word.split('').map(c => heavyMathOptimized(c.charCodeAt(0))).join(',')})`;
      } else if (tech.includes("Mixed Boolean Arithmetic")) {
        replacement = `((${mbaOptimized()}==1 or true)and"${word}")`;
      }
      regex.lastIndex = 0;
      modified = modified.replace(regex, () => `game[${replacement}]`);
    }
  }
  return headers + modified;
}

// ==================== GUARDIAS ANTI-DEBUG OPTIMIZADAS ====================

function getOptimizedProtections() {
  const useDebug = SETTINGS.useDebugLibrary;
  const staticEnv = SETTINGS.staticEnvironment;
  
  const guardVars = {
    check1: generateIlName(),
    check2: generateIlName(),
    check3: generateIlName(),
    timer: generateIlName(),
    counter: generateIlName(),
    hook: generateIlName(),
    debugState: generateIlName()
  };

  let antiDebuggers = `
    -- Anti-Debug Guard System
    local ${guardVars.debugState} = false
    local ${guardVars.timer} = os.clock()
    
    -- Temporal Anti-Debug
    for _=1,250000 do 
      if os.clock() - ${guardVars.timer} > 3.0 then 
        ${guardVars.debugState} = true 
        break 
      end 
    end
    if ${guardVars.debugState} then 
      while true do end 
    end
  `;

  if (useDebug) {
    antiDebuggers += `
      -- Debug Library Protection
      if debug and debug.getinfo then
        local _stack = debug.getinfo(2)
        if _stack and _stack.what ~= "main" and _stack.what ~= "Lua" then
          while true do end
        end
      end
      
      if debug and debug.sethook then
        debug.sethook(function() 
          while true do end 
        end, "l", 2)
      end
      
      if debug and debug.getregistry then
        local _reg = debug.getregistry()
        if _reg and type(_reg) == "table" then
          if _reg._G and _reg._G ~= getfenv() then
            while true do end
          end
        end
      end
    `;
  }

  if (staticEnv) {
    antiDebuggers += `
      -- Static Environment Check
      if getfenv and getfenv() ~= _ENV then
        while true do end
      end
    `;
  }

  antiDebuggers += `
    -- Global Variable Guard
    local _g = getfenv and getfenv(0) or _G
    if _g and _g._VERSION then
      local _ver = _g._VERSION
      if type(_ver) ~= "string" or not string.match(_ver, "Lua") then
        while true do end
      end
    end
  `;

  const rawTampers = [
    `if math.pi<3.14 or math.pi>3.15 then _err() end`,
    `if bit32 and bit32.bxor(10,5)~=15 then _err() end`,
    `if type(tostring)~="function" then _err() end`,
    `if not string.match("chk","^c.*k$") then _err() end`,
    `local _tm1=os.time() local _tm2=os.time() if _tm2<_tm1 then _err() end`,
    `if math.abs(-10)~=10 then _err() end`,
    `if string.char(65)~="A" then _err() end`,
    `if type({})~="table" then _err() end`,
    `if type(1)~="number" then _err() end`,
    `if type("a")~="string" then _err() end`,
    `if type(true)~="boolean" then _err() end`,
    `if type(nil)~="nil" then _err() end`,
    `if type(function() end)~="function" then _err() end`,
    `if type(coroutine.create(function() end))~="thread" then _err() end`,
    `if type(io)~="userdata" then _err() end`,
    `if type(game)~="userdata" then _err() end`,
    `if type(workspace)~="userdata" then _err() end`,
    `if type(script)~="userdata" then _err() end`,
    `if type(Instance)~="function" then _err() end`,
    `if type(getfenv)~="function" then _err() end`,
    `if type(setfenv)~="function" then _err() end`
  ];

  let codeVaultGuards = "";
  for (const t of rawTampers) {
    const fnName  = generateIlName();
    const errName = generateIlName();
    codeVaultGuards += `local ${fnName}=function() local ${errName}=error ${t.replace("_err()", `${errName}("!")`)} end ${fnName}() `;
  }

  return antiDebuggers + codeVaultGuards;
}

// ==================== VARIABLES GUARDIAS ====================

function generateGuardVariables() {
  const guards = {
    integrity: generateIlName(),
    checksum: generateIlName(),
    timestamp: generateIlName(),
    counter: generateIlName(),
    state: generateIlName(),
    validate: generateIlName()
  };

  let guardCode = `
    -- Guard Variables System
    local ${guards.integrity} = {}
    local ${guards.checksum} = 0
    local ${guards.timestamp} = os.time()
    local ${guards.counter} = 0
    local ${guards.state} = true
  `;

  if (SETTINGS.enableGCFixes) {
    guardCode += `
      -- GC Fixes Enabled
      local _gcCount = 0
      local _gcTimer = os.clock()
      setmetatable(${guards.integrity}, {
        __gc = function()
          _gcCount = _gcCount + 1
          if _gcCount > 1000 then
            collectgarbage()
            _gcCount = 0
          end
        end
      })
    `;
  }

  guardCode += `
    local ${guards.validate} = function()
      ${guards.counter} = ${guards.counter} + 1
      if ${guards.counter} > 1000000 then
        ${guards.state} = false
      end
      if os.time() < ${guards.timestamp} then
        ${guards.state} = false
      end
      if ${guards.state} == false then
        while true do end
      end
    end
    
    ${guards.integrity}.check = function()
      ${guards.validate}()
      return ${guards.state}
    end
  `;

  return guardCode;
}

// ==================== SISTEMA DE OPCODES ====================

function generateOpcodeSystem() {
  const opcodeVars = {
    dispatch: generateIlName(),
    opTable: generateIlName(),
    exec: generateIlName(),
    stack: generateIlName()
  };

  let opcodes = `
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
  `;

  if (SETTINGS.intenseVMStructure) {
    opcodes += `
      -- Intense VM Structure
      local _vmLayer1 = {}
      local _vmLayer2 = {}
      
      _vmLayer1.execute = function(op, ...)
        return ${opcodeVars.opTable}[op](...)
      end
      
      _vmLayer2.process = function(instructions)
        for _, instr in ipairs(instructions) do
          _vmLayer1.execute(instr[1], unpack(instr, 2))
        end
      end
      
      local ${opcodeVars.dispatch} = function(op, ...)
        return _vmLayer1.execute(op, ...)
      end
    `;
  } else {
    opcodes += `
      local ${opcodeVars.dispatch} = function(op, ...)
        local func = ${opcodeVars.opTable}[op]
        if func then
          return func(...)
        end
        return nil
      end
    `;
  }

  opcodes += `
    local ${opcodeVars.exec} = function(instructions)
      for _, instr in ipairs(instructions) do
        local op = instr[1]
        local args = {unpack(instr, 2)}
        ${opcodeVars.dispatch}(op, unpack(args))
      end
    end
  `;

  return opcodes;
}

// ==================== VM MEJORADA CON RECONSTRUCCIÓN ====================

function buildTrueVMOptimized(payloadStr) {
  const STACK = generateIlName(); 
  const KEY = generateIlName(); 
  const SALT = generateIlName();
  const OPCODE_STACK = generateIlName();
  const INSTRUCTION_PTR = generateIlName();
  
  const seed = Math.floor(Math.random() * 200) + 50;
  const saltVal = Math.floor(Math.random() * 250) + 1;
  
  let vmCore = `
    -- Enhanced VM System with Reconstruction
    local ${STACK}={} 
    local ${KEY}=${heavyMathOptimized(seed)} 
    local ${SALT}=${heavyMathOptimized(saltVal)}
    local ${OPCODE_STACK}={}
    local ${INSTRUCTION_PTR}=1
    
    ${generateVMReconstructionSystem()}
    ${generateVMDebugSystem()}
    ${generateOpcodeSystem()}
    ${generateGuardVariables()}
    
    -- VM State Variables
    local _vmState = {
      running = false,
      paused = false,
      halted = false,
      error = nil,
      debug = ${SETTINGS.debugVM}
    }
  `;
  
  const chunkSize = 15; 
  let realChunks = [];
  for(let i = 0; i < payloadStr.length; i += chunkSize) { 
    realChunks.push(payloadStr.slice(i, i + chunkSize)); 
  }
  
  let poolVars = []; 
  let realOrder = [];
  let totalChunks = realChunks.length * 4; 
  let currentReal = 0; 
  let globalIndex = 0;
  
  for(let i = 0; i < totalChunks; i++) {
    let memName = generateIlName(); 
    poolVars.push(memName);
    
    if (currentReal < realChunks.length && (Math.random() > 0.4 || (totalChunks - i) === (realChunks.length - currentReal))) {
      realOrder.push(i + 1);
      let chunk = realChunks[currentReal]; 
      let encryptedBytes = [];
      
      for(let j = 0; j < chunk.length; j++) {
        let enc = (chunk.charCodeAt(j) + seed + (globalIndex * saltVal)) % 256;
        encryptedBytes.push(heavyMathOptimized(enc));
        globalIndex++;
      }
      
      vmCore += `local ${memName}={${encryptedBytes.join(',')}} `;
      currentReal++;
    } else {
      let fakeBytes = []; 
      let fakeLen = Math.floor(Math.random() * 25) + 8;
      for(let j = 0; j < fakeLen; j++) { 
        fakeBytes.push(heavyMathOptimized(Math.floor(Math.random() * 255))); 
      }
      vmCore += `local ${memName}={${fakeBytes.join(',')}} `;
    }
  }
  
  vmCore += `
    local _pool={${poolVars.join(',')}} 
    local _order={${realOrder.map(n => heavyMathOptimized(n)).join(',')}} 
    local _gIdx=0 
    
    -- VM Execution with Reconstruction
    _vmState.running = true
    
    for _, idx in ipairs(_order) do 
      for _, byte in ipairs(_pool[idx]) do 
        if type(math.pi)=="string" then 
          ${KEY}=(${KEY}+137)%256 
        end
        local _decrypted = math.floor((byte - ${KEY} - _gIdx * ${SALT}) % 256)
        table.insert(${STACK}, string.char(_decrypted)) 
        _gIdx=_gIdx+1 
        
        -- Debug check
        if _vmState.debug then
          if _vmState.paused then
            while _vmState.paused do
              wait(0.1)
            end
          end
        end
      end 
    end 
    
    -- VM Integrity Check
    local _check = ${STACK}.check and ${STACK}.check()
    if not _check then
      _vmState.error = "Integrity check failed"
      _vmState.halted = true
      while true do end
    end
    
    local _e = table.concat(${STACK}) 
    ${STACK}=nil 
    _vmState.running = false
  `;
  
  if (SETTINGS.disableLineInfo) {
    vmCore = vmCore.replace(/debug\.getinfo/g, 'function() return nil end');
  }
  
  const ASSERT = SETTINGS.compatibilityMode ? `assert` : `getfenv()[${runtimeString("assert")}]`;
  const LOADSTRING = SETTINGS.compatibilityMode ? `loadstring` : `getfenv()[${runtimeString("loadstring")}]`;
  const GAME = SETTINGS.compatibilityMode ? `game` : `getfenv()[${runtimeString("game")}]`;
  const HTTPGET = runtimeString("HttpGet");
  
  if (payloadStr.includes("http")) { 
    vmCore += `${ASSERT}(${LOADSTRING}(${GAME}[${HTTPGET}](${GAME}, _e)))() `; 
  } else { 
    vmCore += `${ASSERT}(${LOADSTRING}(_e))() `; 
  }
  
  return vmCore;
}

// ==================== VM FRÁGIL CON ESTRUCTURA INTENSA ====================

function buildFragileVMOptimized(innerCode, depth = 0) {
  const maxDepth = SETTINGS.intenseVMStructure ? 60 : 45;
  
  if (depth >= maxDepth) return innerCode;

  const vmName = generateIlName();
  const handlerCount = Math.floor(Math.random() * 5) + 3;
  const handlers = pickHandlers(handlerCount);
  const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName();

  let out = `local ${vmName}={} `;
  
  if (SETTINGS.intenseVMStructure && depth % 2 === 0) {
    const extraHandlers = pickHandlers(3);
    for (const h of extraHandlers) {
      out += `local ${h}=function(${vmName}) ${generateJunkOptimized(5)} return nil end `;
    }
  }
  
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(${vmName}) `;
      out += `local _chk="${generateIlName()}" `;
      out += `if ${vmName}[${heavyMathOptimized(1)}]~=nil then error("VM corrupted") end `;
      out += `${generateJunkOptimized(5)} `;
      out += buildFragileVMOptimized(innerCode, depth + 1);
      out += ` end `;
    } else {
      out += `local ${handlers[i]}=function(${vmName}) ${generateJunkOptimized(3)} return nil end `;
    }
  }

  out += `local ${DISPATCH}={`;
  for (let i = 0; i < handlers.length; i++) {
    out += `[${heavyMathOptimized(i + 1)}]=${handlers[i]},`;
  }
  out += `} `;

  const execBlocks = [];
  for (let i = 0; i < handlers.length; i++) {
    execBlocks.push(`${DISPATCH}[${heavyMathOptimized(i + 1)}](${vmName})`);
  }
  out += applyCFF(execBlocks);
  return out;
}

// ==================== FUNCIÓN PRINCIPAL ====================

function obfuscate(sourceCode, settings = {}) {
  if (!sourceCode) return '-- Error: No Source';
  
  Object.assign(SETTINGS, settings);

  const extraProtections = getOptimizedProtections();
  
  let payloadToProtect = "";
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
  const match = sourceCode.match(isLoadstringRegex);
  
  if (match) { 
    payloadToProtect = match[1]; 
  } else { 
    payloadToProtect = detectAndApplyMappingsOptimized(sourceCode); 
  }

  let vm = buildTrueVMOptimized(payloadToProtect);
  
  const layers = SETTINGS.intenseVMStructure ? 25 : 20;
  for (let i = 0; i < layers; i++) {
    vm = buildFragileVMOptimized(vm, i);
  }

  let finalCode = `${HEADER} ${generateJunkOptimized(50)} ${extraProtections} ${vm}`.replace(/\s+/g, " ").trim();
  
  if (SETTINGS.vmCompression) {
    finalCode = finalCode.replace(/--[^\n]*/g, '').replace(/\s+/g, ' ');
  }
  
  const targetSize = 246 * 1024;
  let currentSize = Buffer.byteLength(finalCode, 'utf8');

  if (currentSize < targetSize) {
    const neededBytes = targetSize - currentSize;
    const junkPerLine = 50;
    const additionalLines = Math.ceil(neededBytes / junkPerLine);
    finalCode = `${HEADER} ${generateJunkOptimized(50 + additionalLines)} ${extraProtections} ${vm}`.replace(/\s+/g, " ").trim();
  }

  return finalCode;
}

module.exports = { obfuscate, SETTINGS };
