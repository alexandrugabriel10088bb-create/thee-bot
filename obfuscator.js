const HEADER = `--[[ VMProtect Ultimate ]]`;

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
  debugVM: false
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

// ==================== TÉCNICAS DE OFUSCACIÓN ====================

// 1. String Splitting
function técnica_StringSplitting(str) {
  const parts = [];
  for (let i = 0; i < str.length; i += 3) {
    parts.push(`"${str.slice(i, i + 3)}"`);
  }
  return parts.join('..');
}

// 2. Table Indirection
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

// 3. Function Wrapping
function técnica_FunctionWrapping(code) {
  const fnName = generateIlName();
  return `${fnName}=function()${code}end ${fnName}()`;
}

// 4. Control Flow Flattening
function técnica_ControlFlowFlattening(blocks) {
  const stateVar = generateIlName();
  let code = `${stateVar}=1 while true do `;
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) code += `if ${stateVar}==1 then ${blocks[i]} ${stateVar}=2 `;
    else code += `elseif ${stateVar}==${i+1} then ${blocks[i]} ${stateVar}=${i+2} `;
  }
  code += `elseif ${stateVar}==${blocks.length+1} then break end end `;
  return code;
}

// 5. Dead Code Insertion
function técnica_DeadCode() {
  const varName = generateIlName();
  return `${varName}=function()${varName}()end`;
}

// 6. Opaque Predicates
function técnica_OpaquePredicates() {
  const a = Math.floor(Math.random() * 100);
  const b = Math.floor(Math.random() * 100);
  const c = Math.floor(Math.random() * 100);
  return `((${a}+${b})*${c}==${(a+b)*c})`;
}

// 7. Self-Modifying Code
function técnica_SelfModifying(code) {
  const varName = generateIlName();
  return `${varName}=[[${code}]] loadstring(${varName})()`;
}

// 8. Environment Swapping
function técnica_EnvironmentSwapping(code) {
  const envName = generateIlName();
  return `${envName}=getfenv() getfenv=function()return ${envName}end ${code}`;
}

// 9. Garbage Variables
function técnica_GarbageVars(count = 15) {
  let code = '';
  for (let i = 0; i < count; i++) {
    const name = generateIlName();
    code += `${name}=${Math.random() > 0.5 ? `"${generateIlName()}"` : '{}'} `;
  }
  return code;
}

// 10. String Encoding XOR
function técnica_StringEncoding(str) {
  const encoded = [];
  const key = Math.floor(Math.random() * 255);
  for (let i = 0; i < str.length; i++) {
    encoded.push(str.charCodeAt(i) ^ key);
  }
  const tableName = generateIlName();
  return `${tableName}={${encoded.join(',')}} string.char(unpack(${tableName}))`;
}

// 11. Dynamic Dispatch
function técnica_DynamicDispatch(handlers) {
  const dispatchName = generateIlName();
  let code = `${dispatchName}=function(idx)`;
  code += `local handlers={${handlers.join(',')}}`;
  code += `return handlers[idx]`;
  code += `end`;
  return code;
}

// 12. Metatable Obfuscation
function técnica_MetatableObfuscation() {
  const tableName = generateIlName();
  const metaName = generateIlName();
  return `
    ${tableName}={}
    ${metaName}={__index=function(t,k)return rawget(t,k)or nil end}
    setmetatable(${tableName},${metaName})
  `;
}

// 13. Coroutine Obfuscation
function técnica_CoroutineObfuscation(code) {
  const coName = generateIlName();
  return `${coName}=coroutine.wrap(function()${code}end) ${coName}()`;
}

// 14. Bytecode Obfuscation
function técnica_BytecodeObfuscation(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(string.char(str.charCodeAt(i) + 1));
  }
  return bytes.join('');
}

// 15. Variable Renaming
function técnica_VariableRenaming() {
  return generateIlName();
}

// ==================== VM MACHINES ====================

// VM 1: Stack-Based VM
function VM_StackBased(payload) {
  const stackName = generateIlName();
  const ipName = generateIlName();
  const code = `
    -- Stack-Based VM
    ${stackName}={}
    ${ipName}=1
    _instructions={${payload}}
    while ${ipName}<=#_instructions do
      local op=_instructions[${ipName}]
      if op=="push" then
        ${ipName}=${ipName}+1
        table.insert(${stackName},_instructions[${ipName}])
      elseif op=="add" then
        local b=table.remove(${stackName})
        local a=table.remove(${stackName})
        table.insert(${stackName},a+b)
      elseif op=="call" then
        local f=table.remove(${stackName})
        f()
      end
      ${ipName}=${ipName}+1
    end
  `;
  return code;
}

// VM 2: Register-Based VM
function VM_RegisterBased(payload) {
  const regName = generateIlName();
  const code = `
    -- Register-Based VM
    ${regName}={}
    _instructions={${payload}}
    for _,instr in ipairs(_instructions) do
      if instr[1]=="mov" then ${regName}[instr[2]]=instr[3]
      elseif instr[1]=="add" then ${regName}[instr[2]]=${regName}[instr[2]]+${regName}[instr[3]]
      elseif instr[1]=="call" then ${regName}[instr[2]]()
      end
    end
  `;
  return code;
}

// VM 3: Thread-Based VM
function VM_ThreadBased(payload) {
  const threadName = generateIlName();
  const code = `
    -- Thread-Based VM
    ${threadName}=coroutine.create(function()
      ${payload}
    end)
    while coroutine.status(${threadName})~="dead" do
      coroutine.resume(${threadName})
    end
  `;
  return code;
}

// VM 4: Table-Based VM
function VM_TableBased(payload) {
  const tableName = generateIlName();
  const code = `
    -- Table-Based VM
    ${tableName}={}
    ${tableName}.instructions={${payload}}
    ${tableName}.pc=1
    ${tableName}.stack={}
    function ${tableName}.exec()
      while ${tableName}.pc<=#${tableName}.instructions do
        local op=${tableName}.instructions[${tableName}.pc]
        if op=="push" then
          ${tableName}.pc=${tableName}.pc+1
          table.insert(${tableName}.stack,${tableName}.instructions[${tableName}.pc])
        elseif op=="call" then
          local f=table.remove(${tableName}.stack)
          f()
        end
        ${tableName}.pc=${tableName}.pc+1
      end
    end
    ${tableName}.exec()
  `;
  return code;
}

// VM 5: Metatable-Based VM
function VM_MetatableBased(payload) {
  const vmName = generateIlName();
  const metaName = generateIlName();
  const code = `
    -- Metatable-Based VM
    ${vmName}={}
    ${metaName}={}
    ${metaName}.__index=function(t,k)
      return function(...)
        return t[k](...)
      end
    end
    setmetatable(${vmName},${metaName})
    ${vmName}.instructions={${payload}}
    ${vmName}.pc=1
    ${vmName}.stack={}
    ${vmName}.exec=function(self)
      while self.pc<=#self.instructions do
        local op=self.instructions[self.pc]
        if op=="push" then
          self.pc=self.pc+1
          table.insert(self.stack,self.instructions[self.pc])
        elseif op=="call" then
          local f=table.remove(self.stack)
          f()
        end
        self.pc=self.pc+1
      end
    end
    ${vmName}:exec()
  `;
  return code;
}

// VM 6: Environment-Based VM
function VM_EnvironmentBased(payload) {
  const envName = generateIlName();
  const code = `
    -- Environment-Based VM
    ${envName}={}
    setfenv(0,${envName})
    ${envName}.instructions={${payload}}
    ${envName}.pc=1
    ${envName}.stack={}
    ${envName}.exec=function()
      while ${envName}.pc<=#${envName}.instructions do
        local op=${envName}.instructions[${envName}.pc]
        if op=="push" then
          ${envName}.pc=${envName}.pc+1
          table.insert(${envName}.stack,${envName}.instructions[${envName}.pc])
        elseif op=="call" then
          local f=table.remove(${envName}.stack)
          f()
        end
        ${envName}.pc=${envName}.pc+1
      end
    end
    ${envName}.exec()
  `;
  return code;
}

// VM 7: Closure-Based VM
function VM_ClosureBased(payload) {
  const closureName = generateIlName();
  const code = `
    -- Closure-Based VM
    ${closureName}=function()
      local stack={}
      local pc=1
      local instructions={${payload}}
      while pc<=#instructions do
        local op=instructions[pc]
        if op=="push" then
          pc=pc+1
          table.insert(stack,instructions[pc])
        elseif op=="call" then
          local f=table.remove(stack)
          f()
        end
        pc=pc+1
      end
    end
    ${closureName}()
  `;
  return code;
}

// VM 8: Hybrid VM (Stack + Register)
function VM_Hybrid(payload) {
  const vmName = generateIlName();
  const code = `
    -- Hybrid VM
    ${vmName}={
      stack={},
      registers={},
      pc=1,
      instructions={${payload}}
    }
    function ${vmName}:exec()
      while self.pc<=#self.instructions do
        local op=self.instructions[self.pc]
        if op=="push" then
          self.pc=self.pc+1
          table.insert(self.stack,self.instructions[self.pc])
        elseif op=="mov" then
          self.pc=self.pc+1
          self.registers[self.instructions[self.pc]]=self.instructions[self.pc+1]
        elseif op=="add" then
          local b=table.remove(self.stack)
          local a=table.remove(self.stack)
          table.insert(self.stack,a+b)
        elseif op=="call" then
          local f=table.remove(self.stack)
          f()
        end
        self.pc=self.pc+1
      end
    end
    ${vmName}:exec()
  `;
  return code;
}

// ==================== COMPONENTES DE VM ====================

function componente_InstructionDecoder() {
  const decoderName = generateIlName();
  return `
    -- Instruction Decoder
    ${decoderName}=function(instruction)
      local op=string.sub(instruction,1,3)
      local args={}
      local count=0
      for arg in string.gmatch(string.sub(instruction,4),"[^,]+") do
        count=count+1
        args[count]=arg
      end
      return op,args
    end
  `;
}

function componente_MemoryManager() {
  const memName = generateIlName();
  return `
    -- Memory Manager
    ${memName}={
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
    end
  `;
}

function componente_BytecodeCompiler() {
  const compilerName = generateIlName();
  return `
    -- Bytecode Compiler
    ${compilerName}=function(source)
      local bytecode={}
      for line in string.gmatch(source,"[^\\n]+") do
        local op,args=componente_InstructionDecoder(line)
        table.insert(bytecode,{op,args})
      end
      return bytecode
    end
  `;
}

function componente_ExecutionEngine() {
  const engineName = generateIlName();
  return `
    -- Execution Engine
    ${engineName}=function(bytecode)
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
    end
  `;
}

function componente_Debugger() {
  const debugName = generateIlName();
  return `
    -- Debugger
    ${debugName}={
      breakpoints={},
      watchpoints={},
      step=false
    }
    function ${debugName}:addBreakpoint(address)
      self.breakpoints[address]=true
    end
    function ${debugName}:addWatchpoint(variable)
      self.watchpoints[variable]=true
    end
    function ${debugName}:stepInto()
      self.step=true
    end
    function ${debugName}:check(address,variables)
      if self.breakpoints[address] then
        print("Breakpoint hit at",address)
      end
      for k,v in pairs(self.watchpoints) do
        if variables[k]~=v then
          print("Watchpoint triggered:",k,variables[k])
        end
      end
    end
  `;
}

function componente_Profiler() {
  const profName = generateIlName();
  return `
    -- Profiler
    ${profName}={
      counters={},
      startTime=os.clock()
    }
    function ${profName}:start()
      self.startTime=os.clock()
    end
    function ${profName}:stop()
      return os.clock()-self.startTime
    end
    function ${profName}:count(instruction)
      self.counters[instruction]=(self.counters[instruction] or 0)+1
    end
  `;
}

function componente_GarbageCollector() {
  const gcName = generateIlName();
  return `
    -- Garbage Collector
    ${gcName}={
      threshold=1000,
      count=0
    }
    function ${gcName}:collect()
      self.count=self.count+1
      if self.count>=self.threshold then
        collectgarbage()
        self.count=0
      end
    end
  `;
}

function componente_ExceptionHandler() {
  const ehName = generateIlName();
  return `
    -- Exception Handler
    ${ehName}=function(err)
      local stack=debug and debug.traceback or "No traceback"
      return {
        error=err,
        traceback=stack
      }
    end
  `;
}

function componente_Optimizer() {
  const optName = generateIlName();
  return `
    -- Optimizer
    ${optName}=function(bytecode)
      local optimized={}
      local pc=1
      while pc<=#bytecode do
        local instr=bytecode[pc]
        local nextInstr=bytecode[pc+1]
        if instr[1]=="push" and nextInstr and nextInstr[1]=="pop" then
          pc=pc+2
        else
          table.insert(optimized,instr)
          pc=pc+1
        end
      end
      return optimized
    end
  `;
}

function componente_Linker() {
  const linkerName = generateIlName();
  return `
    -- Linker
    ${linkerName}=function(modules)
      local linked={}
      for _,module in ipairs(modules) do
        for _,instr in ipairs(module) do
          table.insert(linked,instr)
        end
      end
      return linked
    end
  `;
}

// ==================== GENERADOR DE CÓDIGO BASURA AVANZADO ====================

function generateAdvancedJunk(lines = 30) {
  let j = '';
  const techniques = [
    () => técnica_DeadCode(),
    () => técnica_MetatableObfuscation(),
    () => técnica_OpaquePredicates(),
    () => {
      const name = generateIlName();
      return `${name}=setmetatable({}, {__index=function()return nil end})`;
    },
    () => {
      const name = generateIlName();
      return `${name}=coroutine.wrap(function()coroutine.yield()end)`;
    },
    () => {
      const name = generateIlName();
      return `${name}=debug and debug.getinfo and debug.getinfo(1) or {}`;
    },
    () => {
      const name = generateIlName();
      return `${name}=string.gsub("${generateIlName()}", ".", function(c)return string.char(string.byte(c)+1)end)`;
    },
    () => {
      const name = generateIlName();
      return `${name}=table.pack and table.pack(${generateIlName()}) or {}`;
    },
    () => {
      const name = generateIlName();
      return `${name}=tonumber("${Math.floor(Math.random() * 999)}") or 0`;
    }
  ];

  for (let i = 0; i < lines; i++) {
    const tech = techniques[Math.floor(Math.random() * techniques.length)];
    j += tech() + ' ';
  }
  return j;
}

// ==================== ANTI-DEBUG AVANZADO ====================

function getAdvancedProtections() {
  return `
    -- Anti-Debug System
    _t=os.clock()for _=1,50000 do end if os.clock()-_t>3 then while true do end end
    if debug and debug.sethook then debug.sethook(function()while true do end end,"l",2)end
    if debug and debug.getinfo then 
      _stack=debug.getinfo(2) 
      if _stack and _stack.what~="main" and _stack.what~="Lua" then while true do end end 
    end
    if getfenv and getfenv()~=_ENV then while true do end end
    if bit32 and bit32.bxor then
      if bit32.bxor(10,5)~=15 then while true do end end
    end
    if type(tostring)~="function" then while true do end end
    if not string.match("chk","^c.*k$") then while true do end end
    local _tm1=os.time() local _tm2=os.time() if _tm2<_tm1 then while true do end end
  `;
}

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

// ==================== DETECCIÓN DE MAPPINGS ====================

function detectAndApplyMappings(code) {
  const MAPEO = {
    "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
    "TextButton":"Mixed Boolean Arithmetic","Humanoid":"Dynamic Junk","Player":"Fake Flow",
    "RunService":"Virtual Machine","TweenService":"Fake Flow","Players":"Fake Flow"
  };
  
  let modified = code, headers = "";
  
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      if (tech.includes("Aggressive Renaming")) { 
        const v = generateIlName(); 
        headers += `${v}="${word}";`; 
        modified = modified.replace(regex, v);
      } else if (tech.includes("Table Indirection")) {
        const { code: tableCode, tableName, keys } = técnica_TableIndirection(word);
        headers += tableCode;
        modified = modified.replace(regex, `${tableName}[${keys[Math.floor(Math.random() * keys.length)]}]`);
      } else if (tech.includes("Fake Flow")) {
        const blocks = [
          `${word}="fake"`,
          `${word}="real"`,
          `${word}="${word}"`
        ];
        modified = modified.replace(regex, técnica_ControlFlowFlattening(blocks));
      } else if (tech.includes("String to Math")) {
        modified = modified.replace(regex, técnica_StringEncoding(word));
      }
    }
  }
  return headers + modified;
}

// ==================== VM PRINCIPAL ====================

function buildVM(payloadStr) {
  const STACK = generateIlName();
  const KEY = generateIlName();
  const SALT = generateIlName();
  const seed = Math.floor(Math.random() * 200) + 50;
  const saltVal = Math.floor(Math.random() * 250) + 1;

  // Seleccionar VM aleatoria
  const vmTypes = [
    VM_StackBased,
    VM_RegisterBased,
    VM_ThreadBased,
    VM_TableBased,
    VM_MetatableBased,
    VM_EnvironmentBased,
    VM_ClosureBased,
    VM_Hybrid
  ];
  
  const selectedVM = vmTypes[Math.floor(Math.random() * vmTypes.length)];

  let vmCore = `
    -- ===== COMPONENTES DE VM =====
    ${componente_InstructionDecoder()}
    ${componente_MemoryManager()}
    ${componente_BytecodeCompiler()}
    ${componente_ExecutionEngine()}
    ${componente_Debugger()}
    ${componente_Profiler()}
    ${componente_GarbageCollector()}
    ${componente_ExceptionHandler()}
    ${componente_Optimizer()}
    ${componente_Linker()}
    
    -- ===== VM SELECCIONADA =====
    ${selectedVM(payloadStr)}
  `;

  return vmCore;
}

// ==================== CAPAS VM ====================

function buildFragileVM(innerCode, depth = 0) {
  const maxDepth = 5;
  if (depth >= maxDepth) return innerCode;

  const vmName = generateIlName();
  const handlerCount = Math.floor(Math.random() * 4) + 2;
  const handlers = pickHandlers(handlerCount);
  const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName();

  let out = `${vmName}={} `;
  
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `${handlers[i]}=function(${vmName}) `;
      out += `if ${vmName}[1]~=nil then error("corrupted") end `;
      out += `_vmState="executing" `;
      out += buildFragileVM(innerCode, depth + 1);
      out += `_vmState="done" end `;
    } else {
      out += `${handlers[i]}=function(${vmName}) `;
      out += `_vmState="fake" return nil end `;
    }
  }

  out += técnica_DynamicDispatch(handlers);
  
  const execBlocks = [];
  for (let i = 0; i < handlers.length; i++) {
    execBlocks.push(`${DISPATCH}(${i+1})(${vmName})`);
  }
  out += técnica_ControlFlowFlattening(execBlocks);
  
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

  // Aplicar técnicas de ofuscación
  let obfuscatedPayload = payloadToProtect;
  
  // Técnicas aplicadas secuencialmente
  obfuscatedPayload = técnica_StringSplitting(obfuscatedPayload);
  obfuscatedPayload = técnica_FunctionWrapping(obfuscatedPayload);
  obfuscatedPayload = técnica_SelfModifying(obfuscatedPayload);
  obfuscatedPayload = técnica_EnvironmentSwapping(obfuscatedPayload);
  obfuscatedPayload = técnica_CoroutineObfuscation(obfuscatedPayload);

  let vm = buildVM(obfuscatedPayload);
  
  for (let i = 0; i < 3; i++) {
    vm = buildFragileVM(vm, i);
  }

  let finalCode = `
    ${HEADER}
    ${getAdvancedProtections()}
    ${técnica_GarbageVars(15)}
    ${generateAdvancedJunk(20)}
    ${vm}
  `.replace(/\s+/g, " ").trim();

  const targetSize = 50 * 1024;
  let currentSize = Buffer.byteLength(finalCode, 'utf8');

  if (currentSize < targetSize) {
    const additionalLines = Math.ceil((targetSize - currentSize) / 50);
    finalCode = `
      ${HEADER}
      ${getAdvancedProtections()}
      ${técnica_GarbageVars(15)}
      ${generateAdvancedJunk(20 + additionalLines)}
      ${vm}
    `.replace(/\s+/g, " ").trim();
  }

  return finalCode;
}

module.exports = { obfuscate, SETTINGS };
