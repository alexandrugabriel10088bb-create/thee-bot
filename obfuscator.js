// ==================== HEADER ====================
const HEADER = `--[[ This code is protected by banana aposticator ]]`;

// ==================== VARIABLES ====================
const CUSTOM_VARS = [
    "etr", "tr", "x", "y", "z", "a", "b", "c", "d", "e", "f", "g", "h",
    "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v",
    "w", "x1", "y1", "z1", "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1",
    "i1", "j1", "k1", "l1", "m1", "n1", "o1", "p1", "q1", "r1", "s1", "t1"
];

// ==================== BYTECODE OPCODES ====================
const BYTECODE = {
    OP_LOAD: 0x01, OP_STORE: 0x02, OP_ADD: 0x03, OP_SUB: 0x04,
    OP_MUL: 0x05, OP_DIV: 0x06, OP_MOD: 0x07, OP_POW: 0x08,
    OP_CONCAT: 0x09, OP_CMP: 0x0A, OP_JMP: 0x0B, OP_CALL: 0x0C,
    OP_RET: 0x0D, OP_TABLE: 0x0E, OP_GET: 0x0F, OP_SET: 0x10,
    OP_FUNC: 0x11, OP_CLOSE: 0x12, OP_VAR: 0x13, OP_UPVAL: 0x14,
    OP_GLOBAL: 0x15, OP_META: 0x16, OP_TYPE: 0x17, OP_STR: 0x18,
    OP_NUM: 0x19, OP_BOOL: 0x1A, OP_NIL: 0x1B, OP_DUP: 0x1C,
    OP_SWAP: 0x1D, OP_ROT: 0x1E, OP_PUSH: 0x1F, OP_POP: 0x20,
    OP_XOR: 0x21, OP_SHL: 0x22, OP_SHR: 0x23, OP_NOT: 0x24,
    OP_AND: 0x25, OP_OR: 0x26, OP_BAND: 0x27, OP_BOR: 0x28,
    OP_BNOT: 0x29, OP_ENV: 0x2A, OP_DEC: 0xC4, OP_COMP: 0x11E,
    OP_STOP: 0x136
};

// ==================== HANDLER POOL ====================
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"];

// ==================== ANTI-TAMPER ORIGINAL COMPLETO ====================
const ANTI_TAMPER = `
local function f()local function g()local h={}local function i(t)if h[t]then return end h[t]=true if type(t)~="table"then return end for k,v in pairs(t)do if type(v)=="table"and not h[v]then i(v)end end table.freeze(t)end pcall(function()i(_G)end)local j={"getinfo","getupvalue","setupvalue","getlocal","setlocal","getmetatable","setmetatable","getregistry","getfenv","setfenv","getconstants","getconstant","getprotos","getuservalue","setuservalue"}for _,k in ipairs(j)do pcall(function()debug[k]=nil end)end pcall(function()getfenv=nil setfenv=nil loadstring=nil load=nil end)local l={}setmetatable(l,{__index=function(t,k)if k=="_G"or k=="getfenv"or k=="setfenv"then return nil end return rawget(t,k)end,__newindex=function(t,k,v)rawset(t,k,v)end,__metatable="SECURE"})setfenv(1,l)end local function m()local function n(r)while true do local s={}for i=1,10 do local t=debug.getinfo(i,"S")if t then table.insert(s,t.short_src or"?")end end error("TAMPER:"..r.."|"..table.concat(s,"->"),0)end end pcall(function()local u=getmetatable(_G)or{}if u.__index or u.__newindex then if u.__index then local v=false for k,_ in pairs(_G)do if k=="env"or k=="logger"or k=="spy"then v=true break end end if v then n("ENV_LOGGER")end end end local w={}local x,y=pcall(function()setmetatable(w,{})getmetatable(w)end)if not x then n("METATABLE")end local z={}for k,_ in pairs(_G)do z[k]=true end if #z>1000 then n("ENV_OVERFLOW")end end)pcall(function()local A=pcall(function()return debug.getinfo(1,"S")end)if not A then n("DEBUG_DISABLED")end local B=false local C=function()B=true end debug.sethook(C,"l")debug.sethook()if B then n("HOOK")end local D,E=pcall(function()debug.getinfo(999999,"S")end)if E and string.find(E,"invalid level")then n("BREAKPOINT")end end)pcall(function()local F="test"local G=buffer.fromstring(F)local H=buffer.tostring(G)if H~=F then n("MEMORY")end local I=buffer.create(4)buffer.writeu8(I,0,255)if buffer.readu8(I,0)~=255 then n("BUFFER")end local J,K=pcall(function()local L=buffer.create(1024)for i=1,1024 do buffer.writeu8(L,i-1,i%256)end end)if not K then n("MEMORY_ACCESS")end end)pcall(function()local M={"Players","Workspace","ServerScriptService","ReplicatedStorage","RunService","HttpService","MarketplaceService","DataStoreService"}for _,N in ipairs(M)do local O,P=pcall(function()return game:GetService(N)end)if not O then n("SERVICE:"..N)end if P and type(P)~="Instance"then n("SERVICE_INVALID:"..N)end end local Q,R=pcall(function()local S=Instance.new("Part")S.Name="Guard" S.Parent=workspace S:Destroy()end)if R then n("INSTANCE")end local T,U=pcall(function()return game:GetService("AssetService"):CreateEditableMesh()end)if T and U then local V=U:AddVertex(Vector3.new(0,0,0))if not V then n("MESH")end U:Destroy()end end)pcall(function()local W=coroutine.create(function()coroutine.yield(1)end)local X,Y=coroutine.resume(W)if not X or Y~=1 then n("COROUTINE")end local Z=0 for _ in pairs(coroutine)do Z=Z+1 end if Z<1 then n("THREAD")end end)pcall(function()local _=os.clock()local aa=0 for i=1,100000 do aa=aa+i end local ab=os.clock()-_ if ab>0.1 then n("PERFORMANCE")end local ac=os.time()local ad=os.time()if ad<ac then n("TIME")end end)pcall(function()local ae={"pcall","xpcall","error","assert","type","rawget","rawset","next","pairs","ipairs","select","tonumber","tostring"}for _,af in ipairs(ae)do if type(_G[af])~="function"then n("FUNC_MISS:"..af)end end end)return true end local function ag()local function ah(ai)while true do error("LOGGER:"..ai,0)end end pcall(function()local aj={"logger","log","debug","spy","monitor","hook","inject","dump","trace","profile","benchmark","performance","record","capture","snapshot","clone","copy"}for _,ak in ipairs(aj)do if _G[ak]~=nil then ah("KEY:"..ak)end end local al=getmetatable(_G)or{}if al.__index and type(al.__index)=="function"then local am=pcall(function()al.__index(_G,"test_key")end)if am then ah("METATABLE_INDEX")end end end)pcall(function()local an={}local function ao()end local ap=pcall(function()return debug.getinfo(ao,"S")end)if ap then ah("FUNCTION_CAPTURE")end end)pcall(function()local aq={}local ar,as=pcall(function()for k,v in pairs(_G)do aq[k]=true end end)if ar and #aq>0 then local at=getmetatable(_G)or{}if at.__newindex then local au="__guard__"local av=_G[au]_G[au]="test"if _G[au]~="test"then ah("ENV_CHANGE")end _G[au]=av end end end)pcall(function()local aw={"io","os","print","warn","error"}for _,ax in ipairs(aw)do if _G[ax]and type(_G[ax])=="function"then local ay=_G[ax]_G[ax]=nil if _G[ax]~=nil then ah("OVERRIDE:"..ax)end _G[ax]=ay end end end)return true end local function az()local function aA()while true do local aB,aC=pcall(function()local aD=getmetatable(_G)or{}if aD.__index or aD.__newindex then local aE=pcall(function()aD.__index=nil aD.__newindex=nil setmetatable(_G,{})end)if not aE then error("LOGGER_ACTIVE")end end local aF=debug.getinfo(1,"S")if aF and aF.short_src=="[C]"then error("C_HOOK")end end)if not aB then while true do error("GUARDIAN:"..tostring(aC),0)end end local aG=os.clock()while os.clock()-aG<0.001 do end end end local aH=coroutine.create(aA)local aI,aJ=coroutine.resume(aH)if not aI then error("THREAD_FAIL:"..tostring(aJ),0)end return aH end local function aK()g()local aL,aM=pcall(m)if not aL then error("ANTI_TAMPER:"..tostring(aM),0)end local aN,aO=pcall(ag)if not aN then error("ANTI_LOGGER:"..tostring(aO),0)end local aP=pcall(az)if not aP then error("THREAD_GUARDIAN",0)end return true,"OK"end local aQ,aR=pcall(aK)if not aQ then while true do local aS={}for i=1,10 do local aT=debug.getinfo(i,"S")if aT then table.insert(aS,aT.short_src or"?")end end error("INIT_FAIL:"..aR.."|"..table.concat(aS,"->"),0)end end pcall(function()local aU=getfenv()if aU and type(aU)=="table"then local aV=getmetatable(aU)or{}if aV.__metatable~="SECURE"then error("COMPROMISED",0)end end end)return true,"ACTIVE"end return f()
`;

// ==================== FUNCIONES AUXILIARES ====================

function generateCustomName() {
    const base = CUSTOM_VARS[Math.floor(Math.random() * CUSTOM_VARS.length)];
    const suffix = Math.floor(Math.random() * 999999);
    const prefixes = ["","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return prefix + base + "_" + suffix;
}

function pickHandlers(count) {
    const used = new Set();
    const result = [];
    while (result.length < count) {
        const base = HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)];
        const name = base + Math.floor(Math.random() * 999);
        if (!used.has(name)) { used.add(name); result.push(name); }
    }
    return result;
}

function generateJunk(lines = 300) {
    let j = '';
    const junkTypes = [
        () => `local ${generateCustomName()}=${Math.floor(Math.random() * 99999)}`,
        () => `local ${generateCustomName()}=string.char(${Math.floor(Math.random()*255)})`,
        () => `local ${generateCustomName()}=function()return ${Math.random()*1000}end`,
        () => `local ${generateCustomName()}={}${generateCustomName()}[1]="${generateCustomName()}"`,
        () => `if not(1==1)then local x=1 end`,
        () => `if false then local ${generateCustomName()}=1 end`,
        () => `if type(nil)=="number"then local ${generateCustomName()}=1 end`,
        () => `while false do local ${generateCustomName()}=1 end`,
        () => `repeat local ${generateCustomName()}=1 until true`,
        () => `do local ${generateCustomName()}={}${generateCustomName()}["_"]=1 ${generateCustomName()}=nil end`,
        () => `do local ${generateCustomName()}=function()return"t"end ${generateCustomName()}()end`,
        () => `local ${generateCustomName()}=math.floor(${Math.random()*1000})+${Math.floor(Math.random()*100)}`,
        () => `local ${generateCustomName()}=string.len("${generateCustomName()}")`,
        () => `local function ${generateCustomName()}()local ${generateCustomName()}=1 return ${generateCustomName()}end`,
        () => `local ${generateCustomName()}=function(${generateCustomName()})return ${generateCustomName()}+1 end`,
        () => `local ${generateCustomName()}={${generateCustomName()}=1,${generateCustomName()}=2}`,
        () => `local ${generateCustomName()}=setmetatable({},{__index=function()return nil end})`,
        () => `local ${generateCustomName()}="${generateCustomName()}".."${generateCustomName()}"`,
        () => `local ${generateCustomName()}=bit32.bxor(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`
    ];
    
    for (let i = 0; i < lines; i++) {
        const randomIndex = Math.floor(Math.random() * junkTypes.length);
        j += junkTypes[randomIndex]() + ' ';
        if (Math.random() < 0.02) {
            j += '\n';
        }
    }
    return j;
}

function encodeString(str) {
    let encoded = '';
    for (let i = 0; i < str.length; i++) {
        encoded += String.fromCharCode(str.charCodeAt(i) ^ 0x55);
    }
    return encoded;
}

function detectAndApplyMappings(code) {
    const MAPEO = {
        "ScreenGui": "etr_ui", "Frame": "etr_fr", "TextLabel": "etr_lb",
        "TextButton": "etr_bt", "Humanoid": "etr_ch", "Player": "etr_us",
        "RunService": "etr_rs", "TweenService": "etr_ts", "Players": "etr_pl",
        "Workspace": "etr_wp", "ReplicatedStorage": "etr_rsd",
        "ServerScriptService": "etr_ss", "DataStoreService": "etr_ds",
        "HttpService": "etr_http", "MarketplaceService": "etr_mk"
    };
    
    let modified = code;
    let headers = "";
    
    for (const [original, replacement] of Object.entries(MAPEO)) {
        const regex = new RegExp(`\\b${original}\\b`, "g");
        if (regex.test(modified)) {
            const varName = generateCustomName();
            headers += `local ${varName}="${original}"`;
            regex.lastIndex = 0;
            modified = modified.replace(regex, () => `game[${varName}]`);
        }
    }
    
    modified = modified.replace(/"([^"]+)"/g, (match, content) => {
        if (content.length > 2 && Math.random() > 0.3) {
            const varName = generateCustomName();
            const encoded = encodeString(content);
            headers += `local ${varName}=string.char(${Array.from(encoded).map(c => c.charCodeAt(0)).join(',')})`;
            return varName;
        }
        return match;
    });
    
    modified = modified.replace(/\b(\d+)\b/g, (match, number) => {
        if (parseInt(number) > 10 && Math.random() > 0.4) {
            const varName = generateCustomName();
            const encoded = parseInt(number) ^ 0x55;
            headers += `local ${varName}=${encoded}`;
            return varName;
        }
        return match;
    });
    
    return headers + modified;
}

function getProtections() {
    const antiDebuggers = `
local etr_c=os.clock()local etr_n=0 for etr_i=1,300000 do etr_n=etr_n+1 if os.clock()-etr_c>5.0 then error()end end
if debug and debug.getinfo then local etr_i=debug.getinfo(1)if etr_i and etr_i.what~="main"and etr_i.what~="Lua"then error()end end
if debug and debug.sethook then debug.sethook(function()error()end,"l",1)end
if bit32 then local etr_t=bit32.bxor(123,456)if etr_t~=435 then error()end end
`;

    const rawTampers = [
        `if math.pi<3.14 or math.pi>3.15 then error()end`,
        `if type(tostring)~="function"then error()end`,
        `if not string.match("t","^t.*t$")then error()end`,
        `if type({})~="table"then error()end`,
        `if type(1)~="number"then error()end`,
        `if type("a")~="string"then error()end`,
        `if type(true)~="boolean"then error()end`,
        `if type(nil)~="nil"then error()end`,
        `if type(function()end)~="function"then error()end`,
        `if type(game)~="userdata"then error()end`,
        `if type(workspace)~="userdata"then error()end`,
        `if type(Instance)~="function"then error()end`,
        `if type(getfenv)~="function"then error()end`,
        `if type(setfenv)~="function"then error()end`,
        `if type(coroutine)~="table"then error()end`,
        `if type(string)~="table"then error()end`,
        `if type(math)~="table"then error()end`,
        `if type(table)~="table"then error()end`
    ];

    let codeVaultGuards = "";
    for (const t of rawTampers) {
        const fnName = generateCustomName();
        codeVaultGuards += `local ${fnName}=function()${t}end ${fnName}()`;
    }

    return antiDebuggers + codeVaultGuards;
}

// ==================== BYTECODE VM ====================

function buildBytecodeVM(payloadStr) {
    const bytecodeData = generateCustomName();
    const vmState = generateCustomName();
    const vmStack = generateCustomName();
    const vmRegs = generateCustomName();
    const vmPC = generateCustomName();
    const vmRunning = generateCustomName();
    
    const seed1 = Math.floor(Math.random() * 255);
    const seed2 = Math.floor(Math.random() * 255);
    const seed3 = Math.floor(Math.random() * 255);
    
    let bytecode = [];
    let payload = payloadStr;
    
    const key = (seed1 + seed2 + seed3) % 256;
    
    for (let i = 0; i < payload.length; i++) {
        let val = payload.charCodeAt(i);
        let xorKey = (key + i * 3 + 7) % 256;
        bytecode.push(val ^ xorKey);
    }
    
    const bytecodeStr = bytecode.join(',');
    
    let vm = `
local ${bytecodeData}={${bytecodeStr}}
local ${vmState}=1
local ${vmStack}={}
local ${vmRegs}={}
local ${vmPC}=1
local ${vmRunning}=true

local function ${generateCustomName()}()
    local ${generateCustomName()}=os.clock()*1000%256
    local ${generateCustomName()}=${seed1}
    local ${generateCustomName()}=${seed2}
    local ${generateCustomName()}=${seed3}
    local ${generateCustomName()}=(${generateCustomName()}+${generateCustomName()}+${generateCustomName()})%256
    
    while ${vmRunning} do
        if ${vmState}==1 then
            local ${generateCustomName()}=${bytecodeData}[${vmPC}] or 0
            local ${generateCustomName()}=(${generateCustomName()} + ${generateCustomName()} * ${vmPC}) % 256
            local ${generateCustomName()}=${generateCustomName()} ~ ${generateCustomName()}
            
            if ${generateCustomName()}==0xC4 then
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+1] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+2] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+3] or 0
                local ${generateCustomName()}=(${generateCustomName()} + ${generateCustomName()} * ${vmPC}) % 256
                ${vmRegs}[${generateCustomName()}]=string.char(${generateCustomName()} ~ ${generateCustomName()})
                ${vmPC}=${vmPC}+4
            elseif ${generateCustomName()}==0x11E then
                local ${generateCustomName()}=${vmRegs}[1] or ""
                if ${generateCustomName()}~="" then
                    local ${generateCustomName()}=loadstring(${generateCustomName()})
                    if ${generateCustomName()} then
                        task.spawn(${generateCustomName()})
                        ${vmRunning}=false
                        break
                    end
                end
                ${vmPC}=${vmPC}+1
            elseif ${generateCustomName()}==0x136 then
                ${vmRunning}=false
                break
            elseif ${generateCustomName()}==0x01 then
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+1] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+2] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+3] or 0
                local ${generateCustomName()}=(${generateCustomName()} + ${generateCustomName()} * ${vmPC}) % 256
                ${vmRegs}[${generateCustomName()}]=${generateCustomName()} ~ ${generateCustomName()}
                ${vmPC}=${vmPC}+4
            elseif ${generateCustomName()}==0x03 then
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+1] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+2] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+3] or 0
                ${vmRegs}[${generateCustomName()}] = (${vmRegs}[${generateCustomName()}] or 0) + (${vmRegs}[${generateCustomName()}] or 0)
                ${vmPC}=${vmPC}+4
            elseif ${generateCustomName()}==0x04 then
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+1] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+2] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+3] or 0
                ${vmRegs}[${generateCustomName()}] = (${vmRegs}[${generateCustomName()}] or 0) - (${vmRegs}[${generateCustomName()}] or 0)
                ${vmPC}=${vmPC}+4
            elseif ${generateCustomName()}==0x05 then
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+1] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+2] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+3] or 0
                ${vmRegs}[${generateCustomName()}] = (${vmRegs}[${generateCustomName()}] or 0) * (${vmRegs}[${generateCustomName()}] or 0)
                ${vmPC}=${vmPC}+4
            elseif ${generateCustomName()}==0x06 then
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+1] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+2] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+3] or 0
                ${vmRegs}[${generateCustomName()}] = (${vmRegs}[${generateCustomName()}] or 0) / (${vmRegs}[${generateCustomName()}] or 0)
                ${vmPC}=${vmPC}+4
            elseif ${generateCustomName()}==0x21 then
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+1] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+2] or 0
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+3] or 0
                ${vmRegs}[${generateCustomName()}] = bit32.bxor(${vmRegs}[${generateCustomName()}] or 0, ${vmRegs}[${generateCustomName()}] or 0)
                ${vmPC}=${vmPC}+4
            elseif ${generateCustomName()}==0x1F then
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+1] or 0
                table.insert(${vmStack}, ${vmRegs}[${generateCustomName()}] or 0)
                ${vmPC}=${vmPC}+2
            elseif ${generateCustomName()}==0x20 then
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+1] or 0
                ${vmRegs}[${generateCustomName()}]=table.remove(${vmStack}) or 0
                ${vmPC}=${vmPC}+2
            elseif ${generateCustomName()}==0x0B then
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+1] or 0
                ${vmPC}=${generateCustomName()}
            elseif ${generateCustomName()}==0x0C then
                local ${generateCustomName()}=${bytecodeData}[${vmPC}+1] or 0
                local ${generateCustomName()}=${vmRegs}[${generateCustomName()}] or function()end
                ${generateCustomName()}()
                ${vmPC}=${vmPC}+2
            else
                ${vmPC}=${vmPC}+1
            end
        end
        if ${vmPC} > #${bytecodeData} then
            ${vmRunning}=false
            break
        end
        if ${vmState}>1000 then
            ${vmRunning}=false
            break
        end
        ${vmState}=${vmState}+1
    end
end

${generateCustomName()}()
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
    if (match) { 
        payloadToProtect = match[1]; 
    } else { 
        payloadToProtect = detectAndApplyMappings(sourceCode); 
    }

    const vm = buildBytecodeVM(payloadToProtect);
    const junk = generateJunk(300);

    const finalCode = `
        ${HEADER}
        ${junk}
        ${protections}
        ${ANTI_TAMPER}
        ${vm}
    `.replace(/\s+/g, " ").trim();

    return finalCode;
}

module.exports = { obfuscate };
