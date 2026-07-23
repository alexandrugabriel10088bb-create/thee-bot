const HEADER = `--[[ Eclipse Obfuscator v3 ]]`;

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

// ==================== ANTI-TAMPER LUA (SIN MENSAJES) ====================
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
    pcall(function()
        local mt=getmetatable(_G) or {}
        local gs={'env','logger','spy','dump','inspect','hook','inject','cheat','exploit'}
        for _,n in ipairs(gs)do if _G[n]~=nil then crash('GL:'..n)end end
    end)
    pcall(function()
        local o,r=pcall(function()return debug.getinfo(1)end)
        if not o then crash('DB')end
        local h=false
        local hf=function()h=true end
        debug.sethook(hf,'l')
        debug.sethook()
        if h then crash('HK')end
        local e=error
        local m=false
        debug.setupvalue(error,1,function()m=true end)
        if m then crash('FM')end
    end)
    pcall(function()
        local ts='test'
        local tb=buffer.fromstring(ts)
        local r=buffer.tostring(tb)
        if r~=ts then crash('BC')end
        buffer.destroy(tb)
    end)
    pcall(function()
        local svcs={'Players','Workspace','ServerScriptService','ReplicatedStorage','RunService','HttpService','MarketplaceService','DataStoreService','AssetService','Lighting','SoundService','TweenService','ServerStorage','StarterGui','StarterPack','Teams','Chat','CollectionService','ContextActionService','CoreGui','Debris','FriendService','GroupService','GuiService','InsertService','JointsService','KeyboardService','LogService','MaterialService','MouseService','NetworkClient','NetworkServer','PathfindingService','PhysicsService','PlayerMouse','PointsService','ProximityPromptService','RobloxReplicatedStorage','ScriptContext','ScriptInformationProvider','Selection','SelectionPartLasso','SocialService','SoundService','StarterPlayer','Stats','TeleportService','TestService','TextService','UserInputService','VirtualInputManager','VRService','Workspace'}
        for _,n in ipairs(svcs)do
            local o,r=pcall(function()return game:GetService(n)end)
            if not o then crash('SF:'..n)end
            if r and type(r)~='Instance' then crash('SI:'..n)end
        end
    end)
    pcall(function()
        local co=coroutine.create(function()coroutine.yield(1)return 2 end)
        local o1,r1=coroutine.resume(co)
        if not o1 or r1~=1 then crash('CF1')end
        local o2,r2=coroutine.resume(co)
        if not o2 or r2~=2 then crash('CF2')end
        local o3,r3=coroutine.resume(co)
        if o3 then crash('CD')end
    end)
    pcall(function()
        local fs={'pcall','xpcall','error','assert','type','rawget','rawset','next','pairs','ipairs','select','tonumber','tostring','string','table','math','bit32','coroutine','task','game','Instance','workspace','script','getfenv','setfenv'}
        for _,n in ipairs(fs)do
            local o=_G[n]
            if o==nil then crash('FM:'..n)end
            local t=type(o)
            if t~='function'and t~='table'and t~='userdata' then crash('FI:'..n..':'..t)end
        end
    end)
    pcall(function()
        local mt=getmetatable(game)
        if mt then
            if mt.__index and mt.__index~=game then crash('MI')end
            if mt.__newindex and mt.__newindex~=game then crash('MN')end
        end
        local t=false
        pcall(function()t=true end)
        if not t then crash('PM')end
        local ts='hello'
        if string.upper(ts)~='HELLO' then crash('SM')end
        local tt={1,2,3}
        if #tt~=3 then crash('TM')end
        table.insert(tt,4)
        if #tt~=4 then crash('TIM')end
    end)
    pcall(function()
        local m1=collectgarbage('count')
        local m2=collectgarbage('count')
        if m2<m1 then crash('GC')end
        local o={}
        setmetatable(o,{__mode='v'})
        o.data='test'
        collectgarbage()
        if o.data~=nil then crash('WT')end
    end)
    pcall(function()
        local t1=os.clock()
        local t2=os.clock()
        if t2<t1 then crash('TT')end
        local t3=os.time()
        task.wait(0.1)
        local t4=os.time()
        if t4<=t3 then crash('TS')end
    end)
    pcall(function()
        local e=getfenv()
        if not e then crash('EM')end
        if type(script)=='userdata' then
            if not script:IsA('BaseScript')and not script:IsA('ModuleScript')then
                crash('IST')
            end
        end
        local o,e=pcall(function()return game:GetService('RunService'):IsStudio()end)
        if not o then crash('SCF')end
    end)
    return true
end
local p,e=pcall(antiTamper)
if not p then
    while true do
        error('PF:'..tostring(e),0)
        task.wait(1)
    end
end
antiTamper=nil
p=nil
e=nil
collectgarbage()
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

function runtimeString(str) {
    return `string.char(${str.split('').map(c => c.charCodeAt(0)).join(',')})`;
}

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

function mba() {
    let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
    return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

function detectAndApplyMappings(code) {
    const MAPEO = {
        "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
        "TextButton":"Mixed Boolean Arithmetic","Humanoid":"Dynamic Junk","Player":"Fake Flow",
        "RunService":"Virtual Machine","TweenService":"Fake Flow","Players":"Fake Flow",
        "Workspace":"String to Math","ServerScriptService":"Aggressive Renaming",
        "ReplicatedStorage":"Table Indirection","DataStoreService":"Mixed Boolean Arithmetic"
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
            regex.lastIndex = 0;
            modified = modified.replace(regex, () => `game[${replacement}]`);
        }
    }
    return headers + modified;
}

function removeComments(code) {
    return code
      .replace(/--\[\[[\s\S]*?\]\]/g, '')
      .replace(/--[^\n]*/g, '');
}

function encodeAllStrings(code) {
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

        const varName = generateCustomName();
        const replacement = `_s[${varName}]`;
        replacements.push({
            original: fullMatch,
            replacement: replacement,
            varName: varName,
            content: content
        });
    }

    if (replacements.length === 0) return code;

    let result = 'local _s={} ';
    let offset = 0;
    for (const rep of replacements) {
        const key = rep.varName;
        result += `_s[${key}]=${JSON.stringify(rep.content)} `;
        const index = code.indexOf(rep.original, offset);
        if (index !== -1) {
            modified = modified.substring(0, index) + rep.replacement + modified.substring(index + rep.original.length);
            offset = index + rep.replacement.length;
        }
    }

    return result + modified;
}

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

function renameVariables(code) {
    const lines = code.split('\n');
    const localVars = new Map();
    const usedNames = new Set();

    for (let line of lines) {
        const localMatch = line.match(/local\s+(\w+)\s*=/);
        if (localMatch) {
            const varName = localMatch[1];
            if (!localVars.has(varName) && !usedNames.has(varName)) {
                const newName = generateCustomName();
                localVars.set(varName, newName);
                usedNames.add(newName);
            }
        }
    }

    let modified = code;
    for (const [oldName, newName] of localVars) {
        const regex = new RegExp(`\\b${oldName}\\b`, 'g');
        modified = modified.replace(regex, newName);
    }

    return modified;
}

function insertDeadCode(code) {
    const deadCodeBlocks = [
        `if false then local ${generateCustomName()}=${Math.floor(Math.random()*100)} end `,
        `local ${generateCustomName()}=function() return ${Math.floor(Math.random()*100)} end `,
        `do local ${generateCustomName()}=${Math.floor(Math.random()*100)} end `,
        `if true and false then print("dead") end `,
        `local ${generateCustomName()}=nil `,
        `for _=1,0 do end `
    ];

    const lines = code.split('\n');
    const insertPos = Math.floor(Math.random() * lines.length);
    const deadCode = deadCodeBlocks[Math.floor(Math.random() * deadCodeBlocks.length)];
    lines.splice(insertPos, 0, deadCode);

    return lines.join('\n');
}

function minify(code) {
    const regex = /(\[=*\[)[\s\S]*?(\]=*\])|(["'])(?:(?=(\\?))\2.)*?\3|--\[\[[\s\S]*?\]\]|--[^\n]*|\s+/g;
    return code.replace(regex, (match, bopen, bclose, quote) => {
        if (bopen || quote) return match;
        if (match.startsWith('--')) return '';
        return ' ';
    }).trim();
}

function getDynamicTargetSize(code) {
    return Math.max(code.length * 3, 5000);
}

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
    bootstrap += `for ${v_i}=1,#${v_payload} do `;
    bootstrap += `local ${v_char}=string.byte(${v_payload},${v_i}) `;
    bootstrap += `local ${v_buffer}=string.char(bit32.bxor(${v_char},${v_key})) `;
    bootstrap += `table.insert(${v_exec},${v_buffer}) `;
    bootstrap += `${v_key}=(${v_key}*${multiplier}+${shift})%256 end `;

    if (payloadStr.includes("http")) {
        bootstrap += `local ${v_result}=table.concat(${v_exec}) assert(loadstring(game:HttpGet(${v_result})))() `;
    } else {
        bootstrap += `local ${v_result}=table.concat(${v_exec}) assert(loadstring(${v_result}))() `;
    }

    return bootstrap;
}

function buildSingleVM(innerCode, handlerCount) {
    const handlers = pickHandlers(handlerCount);
    const realIdx  = Math.floor(Math.random() * handlerCount);
    const DISPATCH = generateCustomName();
    let out = `local lM={} `;

    for (let i = 0; i < handlers.length; i++) {
        if (i === realIdx) {
            out += `local ${handlers[i]}=function(lM) local lM=lM; ${innerCode} end `;
        } else {
            out += `local ${handlers[i]}=function(lM) local lM=lM; return nil end `;
        }
    }

    out += `local ${DISPATCH}={`;
    for (let i = 0; i < handlers.length; i++) {
        out += `[${i + 1}]=${handlers[i]},`;
    }
    out += `} `;

    const execBlocks = [];
    for (let i = 0; i < handlers.length; i++) {
        execBlocks.push(`${DISPATCH}[${i + 1}](lM)`);
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

    let codeVaultGuards = `local _guards={`;
    for (const t of rawTampers) {
        codeVaultGuards += `function() local _err=error ${t.replace("_err()", `_err("!")`)} end,`;
    }
    codeVaultGuards += `} for _, _g in ipairs(_guards) do _g() end `;

    return antiDebuggers + codeVaultGuards;
}

function buildFragileVM(innerCode, depth = 0) {
    if (depth >= 40) return innerCode;

    const vmName = generateCustomName();
    const handlerCount = Math.floor(Math.random() * 5) + 3;
    const realIdx = Math.floor(Math.random() * handlerCount);

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

// ==================== FUNCIÓN PRINCIPAL ====================
function obfuscate(sourceCode) {
    if (!sourceCode) return '-- Error: No Source';

    let code = removeComments(sourceCode);

    let payloadToProtect = "";
    const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
    const match = code.match(isLoadstringRegex);
    if (match) {
        payloadToProtect = match[1];
    } else {
        code = encodeAllStrings(code);
        code = obfuscateNumbers(code);
        code = renameVariables(code);
        code = detectAndApplyMappings(code);
        code = insertDeadCode(code);
        code = minify(code);
        payloadToProtect = code;
    }

    const protections = getProtections();

    let vm = buildTrueVM(payloadToProtect);
    vm = buildFragileVM(vm, 0);

    let finalCode = `${HEADER} ${protections} ${ANTI_TAMPER_LUA} ${vm}`.replace(/\s+/g, " ").trim();

    const targetSize = getDynamicTargetSize(sourceCode);
    const currentLen = finalCode.length;
    const bytesNeeded = targetSize - currentLen;
    if (bytesNeeded > 7) {
        finalCode += ` --[[${'X'.repeat(bytesNeeded - 7)}]]`;
    }

    return finalCode;
}

// ==================== EXPORTAR ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        obfuscate,
        ANTI_TAMPER_LUA,
        generateCustomName,
        pickHandlers,
        runtimeString,
        applyCFF,
        mba,
        detectAndApplyMappings,
        encodeAllStrings,
        obfuscateNumbers,
        renameVariables,
        insertDeadCode,
        buildTrueVM,
        buildSingleVM,
        getProtections,
        buildFragileVM
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
    console.log(obfuscate(testCode));
}
