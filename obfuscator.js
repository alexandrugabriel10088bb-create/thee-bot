const HEADER = `--[[ this code it's protected by vmmer obfoscator ]]`;

// ==================== VARIABLES PERSONALIZADAS ====================
// Puedes modificar estos arrays con tus propios nombres
const CUSTOM_VARS = [
    "data", "temp", "result", "value", "index", "count", "total", "amount",
    "position", "status", "flags", "config", "cache", "buffer", "stream",
    "packet", "frame", "token", "session", "client", "server", "node",
    "table_data", "string_data", "number_data", "boolean_data", "nil_data",
    "function_data", "thread_data", "userdata_data", "table_temp", "string_temp",
    "number_temp", "boolean_temp", "nil_temp", "function_temp", "thread_temp",
    "userdata_temp", "table_result", "string_result", "number_result", "boolean_result",
    "nil_result", "function_result", "thread_result", "userdata_result"
];

const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"];

// ==================== ANTI-TAMPER LUA ====================
const ANTI_TAMPER_LUA = `
local function antiTamper()
    local function crash(reason)
        while true do
            local stack = {}
            for i = 1, 20 do
                local info = debug.getinfo(i, 'S')
                if info then table.insert(stack, info.short_src or '?') end
            end
            error('ANTI-TAMPER:' .. reason .. '|' .. table.concat(stack, '->'), 0)
        end
    end
    
    pcall(function()
        local mt = getmetatable(_G) or {}
        if mt.__index or mt.__newindex then
            if mt.__index then
                for k, _ in pairs(_G) do
                    if k == 'env' or k == 'logger' or k == 'spy' or k == 'dump' or k == 'inspect' then
                        crash('ENV_LOGGER')
                    end
                end
            end
        end
    end)
    
    pcall(function()
        local ok = pcall(function() return debug.getinfo(1, 'S') end)
        if not ok then crash('DEBUG_DISABLED') end
        
        local hooked = false
        local hookFunc = function() hooked = true end
        debug.sethook(hookFunc, 'l')
        debug.sethook()
        if hooked then crash('HOOK_DETECTED') end
    end)
    
    pcall(function()
        local test = 'test'
        local buf = buffer.fromstring(test)
        local result = buffer.tostring(buf)
        if result ~= test then crash('BUFFER_CORRUPT') end
    end)
    
    pcall(function()
        local services = {
            'Players','Workspace','ServerScriptService','ReplicatedStorage',
            'RunService','HttpService','MarketplaceService','DataStoreService',
            'AssetService','Lighting','SoundService','TweenService'
        }
        for _, svc in ipairs(services) do
            local ok, result = pcall(function() return game:GetService(svc) end)
            if not ok then crash('SERVICE:' .. svc) end
            if result and type(result) ~= 'Instance' then crash('SERVICE_INVALID:' .. svc) end
        end
    end)
    
    pcall(function()
        local co = coroutine.create(function() coroutine.yield(1) end)
        local ok, result = coroutine.resume(co)
        if not ok or result ~= 1 then crash('COROUTINE_FAIL') end
    end)
    
    pcall(function()
        local funcs = {
            'pcall','xpcall','error','assert','type',
            'rawget','rawset','next','pairs','ipairs',
            'select','tonumber','tostring','string','table',
            'math','bit32','coroutine','task','game','Instance'
        }
        for _, f in ipairs(funcs) do
            if type(_G[f]) ~= 'function' and type(_G[f]) ~= 'table' then
                crash('FUNC_MISS:' .. f)
            end
        end
    end)
    
    return true
end

local protected, err = pcall(antiTamper)
if not protected then
    while true do
        error('PROTECTION_FAILED: ' .. tostring(err), 0)
    end
end
`;

// ==================== FUNCIONES AUXILIARES ====================

function generateCustomName() {
    // Mezcla palabras personalizadas con números aleatorios
    const base = CUSTOM_VARS[Math.floor(Math.random() * CUSTOM_VARS.length)];
    const suffix = Math.floor(Math.random() * 999999);
    // A veces añade prefijos como "get_", "set_", "is_", etc.
    const prefixes = ["", "get_", "set_", "is_", "has_", "on_", "do_"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return prefix + base + "_" + suffix;
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
  const stateVar = generateCustomName();
  let lua = `local ${stateVar}=${heavyMath(1)} while true do `;
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) lua += `if ${stateVar}==${heavyMath(1)} then ${blocks[i]} ${stateVar}=${heavyMath(2)} `;
    else         lua += `elseif ${stateVar}==${heavyMath(i + 1)} then ${blocks[i]} ${stateVar}=${heavyMath(i + 2)} `;
  }
  lua += `elseif ${stateVar}==${heavyMath(blocks.length + 1)} then break end end `;
  return lua;
}

function heavyMath(n) {
  if (Math.random() < 0.2) return n.toString();
  let a = Math.floor(Math.random() * 5000) + 1000;
  let b = Math.floor(Math.random() * 100) + 2;
  let c = Math.floor(Math.random() * 800) + 10;
  return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${c})/${c})-${c})`;
}

function mba() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

function generateJunk(lines = 100) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.2) j += `local ${generateCustomName()}=${heavyMath(Math.floor(Math.random() * 999))} `;
    else if (r < 0.4) j += `local ${generateCustomName()}=string.char(${heavyMath(Math.floor(Math.random()*255))}) `;
    else if (r < 0.5) j += `if not(${heavyMath(1)}==${heavyMath(1)}) then local x=1 end `;
    else if (r < 0.7) {
      const tp = generateCustomName();
      j += `if type(nil)=="number" then while true do local ${tp}=1 end end `;
    } else if (r < 0.85) {
      const vt = generateCustomName();
      j += `do local ${vt}={} ${vt}["_"]=1 ${vt}=nil end `;
    } else {
      j += `if type(math.pi)=="string" then local _=1 end `;
    }
  }
  return j;
}

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
      let replacement = `"${word}"`;
      if (tech.includes("Aggressive Renaming")) { 
        const v = generateCustomName(); 
        headers += `local ${v}="${word}";`; 
        replacement = v; 
      }
      else if (tech.includes("String to Math")) {
        replacement = `string.char(${word.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`;
      }
      else if (tech.includes("Mixed Boolean Arithmetic")) {
        replacement = `((${mba()}==1 or true)and"${word}")`;
      }
      regex.lastIndex = 0;
      modified = modified.replace(regex, () => `game[${replacement}]`);
    }
  }
  return headers + modified;
}

function buildTrueVM(payloadStr) {
  const STACK = generateCustomName(); 
  const KEY = generateCustomName(); 
  const SALT = generateCustomName();
  const seed = Math.floor(Math.random() * 200) + 50;
  const saltVal = Math.floor(Math.random() * 250) + 1;
  
  let vmCore = `local ${STACK}={} local ${KEY}=${heavyMath(seed)} local ${SALT}=${heavyMath(saltVal)} `;
  const chunkSize = 15; 
  let realChunks = [];
  
  for(let i = 0; i < payloadStr.length; i += chunkSize) { 
    realChunks.push(payloadStr.slice(i, i + chunkSize)); 
  }
  
  let poolVars = []; 
  let realOrder = [];
  let totalChunks = realChunks.length * 3; 
  let currentReal = 0; 
  let globalIndex = 0;
  
  for(let i = 0; i < totalChunks; i++) {
    let memName = generateCustomName(); 
    poolVars.push(memName);
    
    if (currentReal < realChunks.length && (Math.random() > 0.5 || (totalChunks - i) === (realChunks.length - currentReal))) {
      realOrder.push(i + 1);
      let chunk = realChunks[currentReal]; 
      let encryptedBytes = [];
      
      for(let j = 0; j < chunk.length; j++) {
        let enc = (chunk.charCodeAt(j) + seed + (globalIndex * saltVal)) % 256;
        encryptedBytes.push(heavyMath(enc));
        globalIndex++;
      }
      vmCore += `local ${memName}={${encryptedBytes.join(',')}} `;
      currentReal++;
    } else {
      let fakeBytes = []; 
      let fakeLen = Math.floor(Math.random() * 20) + 5;
      for(let j = 0; j < fakeLen; j++) { 
        fakeBytes.push(heavyMath(Math.floor(Math.random() * 255))); 
      }
      vmCore += `local ${memName}={${fakeBytes.join(',')}} `;
    }
  }
  
  vmCore += `local _pool={${poolVars.join(',')}} local _order={${realOrder.map(n => heavyMath(n)).join(',')}} `;
  vmCore += `local _gIdx=0 for _, idx in ipairs(_order) do for _, byte in ipairs(_pool[idx]) do `;
  vmCore += `if type(math.pi)=="string" then ${KEY}=(${KEY}+137)%256 end `;
  vmCore += `table.insert(${STACK}, string.char(math.floor((byte - ${KEY} - _gIdx * ${SALT}) % 256))) _gIdx=_gIdx+1 end end `;
  vmCore += `local _e = table.concat(${STACK}) ${STACK}=nil `;
  
  const ASSERT     = `getfenv()[${runtimeString("assert")}]`;
  const LOADSTRING = `getfenv()[${runtimeString("loadstring")}]`;
  const GAME       = `getfenv()[${runtimeString("game")}]`;
  const HTTPGET    = runtimeString("HttpGet");
  
  if (payloadStr.includes("http")) { 
    vmCore += `${ASSERT}(${LOADSTRING}(${GAME}[${HTTPGET}](${GAME}, _e)))() `; 
  } else { 
    vmCore += `${ASSERT}(${LOADSTRING}(_e))() `; 
  }
  return vmCore;
}

function buildSingleVM(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount);
  const realIdx  = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateCustomName();
  let out = `local lM={} `;
  
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) { 
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(5)} ${innerCode} end `; 
    } else { 
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(3)} return nil end `; 
    }
  }
  
  out += `local ${DISPATCH}={`;
  for (let i = 0; i < handlers.length; i++) { 
    out += `[${heavyMath(i + 1)}]=${handlers[i]},`; 
  }
  out += `} `;
  
  const execBlocks = [];
  for (let i = 0; i < handlers.length; i++) { 
    execBlocks.push(`${DISPATCH}[${heavyMath(i + 1)}](lM)`); 
  }
  out += applyCFF(execBlocks);
  return out;
}

function getProtections() {
  const antiDebuggers =
    `local _adT=os.clock() for _=1,150000 do end if os.clock()-_adT>5.0 then while true do end end ` +
    `if debug~=nil and debug.getinfo then local _i=debug.getinfo(1) if _i.what~="main" and _i.what~="Lua" then while true do end end end ` +
    `if debug and debug.sethook then debug.sethook(function() while true do end end, "l", 5) end `;

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
    const fnName  = generateCustomName();
    const errName = generateCustomName();
    codeVaultGuards += `local ${fnName}=function() local ${errName}=error ${t.replace("_err()", `${errName}("!")`)} end ${fnName}() `;
  }

  return antiDebuggers + codeVaultGuards;
}

function buildFragileVM(innerCode, depth = 0) {
  if (depth >= 45) return innerCode;

  const vmName = generateCustomName();
  const handlerCount = Math.floor(Math.random() * 5) + 3;
  const handlers = pickHandlers(handlerCount);
  const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateCustomName();

  let out = `local ${vmName}={} `;
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(${vmName}) `;
      out += `local _chk="${generateCustomName()}" `;
      out += `if ${vmName}[${heavyMath(1)}]~=nil then error("VM corrupted") end `;
      out += `${generateJunk(5)} `;
      out += buildFragileVM(innerCode, depth + 1);
      out += ` end `;
    } else {
      out += `local ${handlers[i]}=function(${vmName}) ${generateJunk(3)} return nil end `;
    }
  }

  out += `local ${DISPATCH}={`;
  for (let i = 0; i < handlers.length; i++) {
    out += `[${heavyMath(i + 1)}]=${handlers[i]},`;
  }
  out += `} `;

  const execBlocks = [];
  for (let i = 0; i < handlers.length; i++) {
    execBlocks.push(`${DISPATCH}[${heavyMath(i + 1)}](${vmName})`);
  }
  out += applyCFF(execBlocks);
  return out;
}

// ==================== FUNCIÓN PRINCIPAL ====================

function obfuscate(sourceCode) {
  if (!sourceCode) return '-- Error: No Source';

  const protections = getProtections();

  let payloadToProtect = "";
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
  const match = sourceCode.match(isLoadstringRegex);
  if (match) { payloadToProtect = match[1]; }
  else       { payloadToProtect = detectAndApplyMappings(sourceCode); }

  let vm = buildTrueVM(payloadToProtect);
  vm = buildFragileVM(vm, 0);

  let finalCode = `${HEADER} ${generateJunk(50)} ${protections} ${ANTI_TAMPER_LUA} ${vm}`.replace(/\s+/g, " ").trim();
  
  const targetSize = 246 * 1024;
  let currentSize = Buffer.byteLength(finalCode, 'utf8');

  if (currentSize < targetSize) {
    const neededBytes = targetSize - currentSize;
    const junkPerLine = 50;
    const additionalLines = Math.ceil(neededBytes / junkPerLine);
    finalCode = `${HEADER} ${generateJunk(50 + additionalLines)} ${protections} ${ANTI_TAMPER_LUA} ${vm}`.replace(/\s+/g, " ").trim();
  }

  return finalCode;
}

module.exports = { obfuscate };
