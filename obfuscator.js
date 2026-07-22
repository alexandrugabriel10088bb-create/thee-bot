const HEADER = `--[[ this code it's protected by vmmer obfoscator ]]`;

// ==================== VARIABLES PERSONALIZADAS ====================
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
    const base = CUSTOM_VARS[Math.floor(Math.random() * CUSTOM_VARS.length)];
    const suffix = Math.floor(Math.random() * 999999);
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

function generateJunk(lines = 100) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    const varName = generateCustomName();
    if (r < 0.2) j += `local ${varName}=${Math.floor(Math.random() * 999)} `;
    else if (r < 0.4) j += `local ${varName}=string.char(${Math.floor(Math.random()*255)}) `;
    else if (r < 0.5) j += `if not(1==1) then local x=1 end `;
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
        replacement = `string.char(${word.split('').map(c => c.charCodeAt(0)).join(',')})`;
      }
      else if (tech.includes("Mixed Boolean Arithmetic")) {
        const flag = generateCustomName();
        headers += `local ${flag}=${Math.random() > 0.5 ? 1 : 2};`;
        replacement = `((${flag}==1 or true)and"${word}")`;
      }
      regex.lastIndex = 0;
      modified = modified.replace(regex, () => `game[${replacement}]`);
    }
  }
  return headers + modified;
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

// ==================== VM CON VARIABLES PERSONALIZADAS ====================

function buildCustomVM(payloadStr) {
  const vmName = generateCustomName();
  const dataVar = generateCustomName();
  const execVar = generateCustomName();
  const resultVar = generateCustomName();
  
  let vm = `
    local ${vmName} = {}
    local ${dataVar} = [[
      ${payloadStr}
    ]]
    local ${execVar} = loadstring(${dataVar})
    if ${execVar} then
      local ${resultVar} = ${execVar}()
    end
  `;
  
  // Envolver en múltiples capas de funciones con nombres personalizados
  for (let i = 0; i < 3; i++) {
    const wrapperName = generateCustomName();
    const innerVar = generateCustomName();
    vm = `
      local ${wrapperName} = function()
        local ${innerVar} = function()
          ${vm}
        end
        ${innerVar}()
      end
      ${wrapperName}()
    `;
  }
  
  return vm;
}

function buildTableVM(payloadStr) {
  const tableName = generateCustomName();
  const keyName = generateCustomName();
  const valueName = generateCustomName();
  const execName = generateCustomName();
  
  let vm = `
    local ${tableName} = {
      ${generateCustomName()} = [[
        ${payloadStr}
      ]],
      ${generateCustomName()} = function(self)
        local ${execName} = loadstring(self[${generateCustomName()}])
        if ${execName} then ${execName}() end
      end
    }
    ${tableName}[${generateCustomName()}]( ${tableName} )
  `;
  
  return vm;
}

function buildFlowVM(payloadStr) {
  const stateVar = generateCustomName();
  const dataVar = generateCustomName();
  const execVar = generateCustomName();
  const step1 = generateCustomName();
  const step2 = generateCustomName();
  const step3 = generateCustomName();
  
  let vm = `
    local ${stateVar} = 1
    local ${dataVar} = [[
      ${payloadStr}
    ]]
    local ${execVar} = loadstring(${dataVar})
    
    if ${stateVar} == 1 then
      local ${step1} = ${execVar}
      ${stateVar} = 2
    end
    
    if ${stateVar} == 2 then
      local ${step2} = ${step1}
      if ${step2} then ${step2}() end
      ${stateVar} = 3
    end
    
    if ${stateVar} == 3 then
      local ${step3} = true
    end
  `;
  
  return vm;
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

  // Seleccionar aleatoriamente un tipo de VM
  const vmType = Math.floor(Math.random() * 3);
  let vm = "";
  if (vmType === 0) vm = buildCustomVM(payloadToProtect);
  else if (vmType === 1) vm = buildTableVM(payloadToProtect);
  else vm = buildFlowVM(payloadToProtect);

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
