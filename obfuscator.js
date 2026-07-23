--[[ Discord is protected by banana obfuscator ]]

-- ==================== CONFIGURACIÓN ====================
local CUSTOM_VARS = {
    "etr", "tr", "x", "y", "z", "a", "b", "c", "d", "e", "f", "g", "h",
    "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v",
    "w", "x1", "y1", "z1", "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"
}

local HANDLER_POOL = {"KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"}

-- ==================== BYTECODE OPCODES ====================
local OPCODES = {
    OP_LOAD = 0x01, OP_STORE = 0x02, OP_ADD = 0x03, OP_SUB = 0x04,
    OP_MUL = 0x05, OP_DIV = 0x06, OP_MOD = 0x07, OP_POW = 0x08,
    OP_CONCAT = 0x09, OP_CMP = 0x0A, OP_JMP = 0x0B, OP_CALL = 0x0C,
    OP_RET = 0x0D, OP_TABLE = 0x0E, OP_GET = 0x0F, OP_SET = 0x10,
    OP_FUNC = 0x11, OP_CLOSE = 0x12, OP_VAR = 0x13, OP_UPVAL = 0x14,
    OP_GLOBAL = 0x15, OP_META = 0x16, OP_TYPE = 0x17, OP_STR = 0x18,
    OP_NUM = 0x19, OP_BOOL = 0x1A, OP_NIL = 0x1B, OP_DUP = 0x1C,
    OP_SWAP = 0x1D, OP_ROT = 0x1E, OP_PUSH = 0x1F, OP_POP = 0x20,
    OP_XOR = 0x21, OP_SHL = 0x22, OP_SHR = 0x23, OP_NOT = 0x24,
    OP_AND = 0x25, OP_OR = 0x26, OP_BAND = 0x27, OP_BOR = 0x28,
    OP_BNOT = 0x29, OP_ENV = 0x2A, OP_DEC = 0xC4, OP_COMP = 0x11E,
    OP_STOP = 0x136, OP_LOADK = 0x2B, OP_MOVE = 0x2C, OP_LEN = 0x2D,
    OP_FORLOOP = 0x2E, OP_FORPREP = 0x2F, OP_TFORLOOP = 0x30,
    OP_SETLIST = 0x31, OP_SETUPVAL = 0x32, OP_GETUPVAL = 0x33,
    OP_NEWTABLE = 0x34, OP_SELF = 0x35, OP_EQ = 0x36, OP_LT = 0x37,
    OP_LE = 0x38, OP_NE = 0x39, OP_GT = 0x3A, OP_GE = 0x3B
}

-- ==================== ANTI-TAMPER ORIGINAL ====================
local ANTI_TAMPER = [[
local function f()local function g()local h={}local function i(t)if h[t]then return end h[t]=true if type(t)~="table"then return end for k,v in pairs(t)do if type(v)=="table"and not h[v]then i(v)end end table.freeze(t)end pcall(function()i(_G)end)local j={"getinfo","getupvalue","setupvalue","getlocal","setlocal","getmetatable","setmetatable","getregistry","getfenv","setfenv","getconstants","getconstant","getprotos","getuservalue","setuservalue"}for _,k in ipairs(j)do pcall(function()debug[k]=nil end)end pcall(function()getfenv=nil setfenv=nil loadstring=nil load=nil end)local l={}setmetatable(l,{__index=function(t,k)if k=="_G"or k=="getfenv"or k=="setfenv"then return nil end return rawget(t,k)end,__newindex=function(t,k,v)rawset(t,k,v)end,__metatable="SECURE"})setfenv(1,l)end local function m()local function n(r)while true do local s={}for i=1,10 do local t=debug.getinfo(i,"S")if t then table.insert(s,t.short_src or"?")end end error("TAMPER:"..r.."|"..table.concat(s,"->"),0)end end pcall(function()local u=getmetatable(_G)or{}if u.__index or u.__newindex then if u.__index then local v=false for k,_ in pairs(_G)do if k=="env"or k=="logger"or k=="spy"then v=true break end end if v then n("ENV_LOGGER")end end end local w={}local x,y=pcall(function()setmetatable(w,{})getmetatable(w)end)if not x then n("METATABLE")end local z={}for k,_ in pairs(_G)do z[k]=true end if #z>1000 then n("ENV_OVERFLOW")end end)pcall(function()local A=pcall(function()return debug.getinfo(1,"S")end)if not A then n("DEBUG_DISABLED")end local B=false local C=function()B=true end debug.sethook(C,"l")debug.sethook()if B then n("HOOK")end local D,E=pcall(function()debug.getinfo(999999,"S")end)if E and string.find(E,"invalid level")then n("BREAKPOINT")end end)pcall(function()local F="test"local G=buffer.fromstring(F)local H=buffer.tostring(G)if H~=F then n("MEMORY")end local I=buffer.create(4)buffer.writeu8(I,0,255)if buffer.readu8(I,0)~=255 then n("BUFFER")end local J,K=pcall(function()local L=buffer.create(1024)for i=1,1024 do buffer.writeu8(L,i-1,i%256)end end)if not K then n("MEMORY_ACCESS")end end)pcall(function()local M={"Players","Workspace","ServerScriptService","ReplicatedStorage","RunService","HttpService","MarketplaceService","DataStoreService"}for _,N in ipairs(M)do local O,P=pcall(function()return game:GetService(N)end)if not O then n("SERVICE:"..N)end if P and type(P)~="Instance"then n("SERVICE_INVALID:"..N)end end local Q,R=pcall(function()local S=Instance.new("Part")S.Name="Guard" S.Parent=workspace S:Destroy()end)if R then n("INSTANCE")end local T,U=pcall(function()return game:GetService("AssetService"):CreateEditableMesh()end)if T and U then local V=U:AddVertex(Vector3.new(0,0,0))if not V then n("MESH")end U:Destroy()end end)pcall(function()local W=coroutine.create(function()coroutine.yield(1)end)local X,Y=coroutine.resume(W)if not X or Y~=1 then n("COROUTINE")end local Z=0 for _ in pairs(coroutine)do Z=Z+1 end if Z<1 then n("THREAD")end end)pcall(function()local _=os.clock()local aa=0 for i=1,100000 do aa=aa+i end local ab=os.clock()-_ if ab>0.1 then n("PERFORMANCE")end local ac=os.time()local ad=os.time()if ad<ac then n("TIME")end end)pcall(function()local ae={"pcall","xpcall","error","assert","type","rawget","rawset","next","pairs","ipairs","select","tonumber","tostring"}for _,af in ipairs(ae)do if type(_G[af])~="function"then n("FUNC_MISS:"..af)end end end)return true end local function ag()local function ah(ai)while true do error("LOGGER:"..ai,0)end end pcall(function()local aj={"logger","log","debug","spy","monitor","hook","inject","dump","trace","profile","benchmark","performance","record","capture","snapshot","clone","copy"}for _,ak in ipairs(aj)do if _G[ak]~=nil then ah("KEY:"..ak)end end local al=getmetatable(_G)or{}if al.__index and type(al.__index)=="function"then local am=pcall(function()al.__index(_G,"test_key")end)if am then ah("METATABLE_INDEX")end end end)pcall(function()local an={}local function ao()end local ap=pcall(function()return debug.getinfo(ao,"S")end)if ap then ah("FUNCTION_CAPTURE")end end)pcall(function()local aq={}local ar,as=pcall(function()for k,v in pairs(_G)do aq[k]=true end end)if ar and #aq>0 then local at=getmetatable(_G)or{}if at.__newindex then local au="__guard__"local av=_G[au]_G[au]="test"if _G[au]~="test"then ah("ENV_CHANGE")end _G[au]=av end end end)pcall(function()local aw={"io","os","print","warn","error"}for _,ax in ipairs(aw)do if _G[ax]and type(_G[ax])=="function"then local ay=_G[ax]_G[ax]=nil if _G[ax]~=nil then ah("OVERRIDE:"..ax)end _G[ax]=ay end end end)return true end local function az()local function aA()while true do local aB,aC=pcall(function()local aD=getmetatable(_G)or{}if aD.__index or aD.__newindex then local aE=pcall(function()aD.__index=nil aD.__newindex=nil setmetatable(_G,{})end)if not aE then error("LOGGER_ACTIVE")end end local aF=debug.getinfo(1,"S")if aF and aF.short_src=="[C]"then error("C_HOOK")end end)if not aB then while true do error("GUARDIAN:"..tostring(aC),0)end end local aG=os.clock()while os.clock()-aG<0.001 do end end end local aH=coroutine.create(aA)local aI,aJ=coroutine.resume(aH)if not aI then error("THREAD_FAIL:"..tostring(aJ),0)end return aH end local function aK()g()local aL,aM=pcall(m)if not aL then error("ANTI_TAMPER:"..tostring(aM),0)end local aN,aO=pcall(ag)if not aN then error("ANTI_LOGGER:"..tostring(aO),0)end local aP=pcall(az)if not aP then error("THREAD_GUARDIAN",0)end return true,"OK"end local aQ,aR=pcall(aK)if not aQ then while true do local aS={}for i=1,10 do local aT=debug.getinfo(i,"S")if aT then table.insert(aS,aT.short_src or"?")end end error("INIT_FAIL:"..aR.."|"..table.concat(aS,"->"),0)end end pcall(function()local aU=getfenv()if aU and type(aU)=="table"then local aV=getmetatable(aU)or{}if aV.__metatable~="SECURE"then error("COMPROMISED",0)end end end)return true,"ACTIVE"end return f()
]]

-- ==================== FUNCIONES DE OFUSCACIÓN ====================
local function generateCustomName()
    local base = CUSTOM_VARS[math.random(1, #CUSTOM_VARS)]
    local suffix = math.random(1, 999999)
    local prefixes = {"", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"}
    local prefix = prefixes[math.random(1, #prefixes)]
    return prefix .. base .. "_" .. suffix
end

local function generateJunk(lines)
    lines = lines or 250
    local j = {}
    local junkTypes = {
        function() return "local " .. generateCustomName() .. "=" .. math.random(1, 99999) end,
        function() return "local " .. generateCustomName() .. "=string.char(" .. math.random(1, 255) .. ")" end,
        function() return "local " .. generateCustomName() .. "=function()return " .. math.random() * 1000 .. "end" end,
        function() return "local " .. generateCustomName() .. "={}" .. generateCustomName() .. "[1]=\"" .. generateCustomName() .. "\"" end,
        function() return "if not(1==1)then local x=1 end" end,
        function() return "if false then local " .. generateCustomName() .. "=1 end" end,
        function() return "if type(nil)==\"number\"then local " .. generateCustomName() .. "=1 end" end,
        function() return "while false do local " .. generateCustomName() .. "=1 end" end,
        function() return "repeat local " .. generateCustomName() .. "=1 until true" end,
        function() return "do local " .. generateCustomName() .. "={}" .. generateCustomName() .. "[\"_\"\"]=1 " .. generateCustomName() .. "=nil end" end,
        function() return "local " .. generateCustomName() .. "=math.floor(" .. math.random() * 1000 .. ")+" .. math.random(1, 100) end,
        function() return "local function " .. generateCustomName() .. "()local " .. generateCustomName() .. "=1 return " .. generateCustomName() .. "end" end,
        function() return "local " .. generateCustomName() .. "={}" .. generateCustomName() .. "=1," .. generateCustomName() .. "=2" end,
        function() return "local " .. generateCustomName() .. "=bit32.bxor(" .. math.random(1,255) .. "," .. math.random(1,255) .. ")" end,
        function() return "local " .. generateCustomName() .. "=string.gsub(\"t\",\"t\",\"" .. generateCustomName() .. "\")" end
    }
    for i = 1, lines do
        local randomIndex = math.random(1, #junkTypes)
        table.insert(j, junkTypes[randomIndex]())
        if math.random() < 0.02 then
            table.insert(j, "\n")
        end
    end
    return table.concat(j, " ")
end

local function detectAndApplyMappings(code)
    local MAPEO = {
        ["ScreenGui"] = "etr_ui", ["Frame"] = "etr_fr", ["TextLabel"] = "etr_lb",
        ["TextButton"] = "etr_bt", ["Humanoid"] = "etr_ch", ["Player"] = "etr_us",
        ["RunService"] = "etr_rs", ["TweenService"] = "etr_ts", ["Players"] = "etr_pl",
        ["Workspace"] = "etr_wp", ["ReplicatedStorage"] = "etr_rsd",
        ["ServerScriptService"] = "etr_ss", ["DataStoreService"] = "etr_ds",
        ["HttpService"] = "etr_http", ["MarketplaceService"] = "etr_mk"
    }
    
    local modified = code
    local headers = {}
    
    for original, replacement in pairs(MAPEO) do
        local pattern = "%f[%a]" .. original .. "%f[%A]"
        if string.find(modified, pattern) then
            local varName = generateCustomName()
            table.insert(headers, "local " .. varName .. "=\"" .. original .. "\"")
            modified = string.gsub(modified, pattern, "game[" .. varName .. "]")
        end
    end
    
    modified = string.gsub(modified, "\"([^\"]+)\"", function(content)
        if #content > 2 and math.random() > 0.3 then
            local varName = generateCustomName()
            table.insert(headers, "local " .. varName .. "=\"" .. content .. "\"")
            return varName
        end
        return "\"" .. content .. "\""
    end)
    
    modified = string.gsub(modified, "%f[%d](%d+)%f[%D]", function(number)
        local num = tonumber(number)
        if num > 10 and math.random() > 0.4 then
            local varName = generateCustomName()
            table.insert(headers, "local " .. varName .. "=" .. num)
            return varName
        end
        return number
    end)
    
    return table.concat(headers, " ") .. modified
end

local function getProtections()
    local antiDebuggers = [[
local etr_c=os.clock()local etr_n=0 for etr_i=1,300000 do etr_n=etr_n+1 if os.clock()-etr_c>5.0 then error()end end
if debug and debug.getinfo then local etr_i=debug.getinfo(1)if etr_i and etr_i.what~="main"and etr_i.what~="Lua"then error()end end
if debug and debug.sethook then debug.sethook(function()error()end,"l",1)end
if bit32 then local etr_t=bit32.bxor(123,456)if etr_t~=435 then error()end end
]]
    
    local rawTampers = {
        "if math.pi<3.14 or math.pi>3.15 then error()end",
        "if type(tostring)~=\"function\"then error()end",
        "if not string.match(\"t\",\"^t.*t$\")then error()end",
        "if type({})~=\"table\"then error()end",
        "if type(1)~=\"number\"then error()end",
        "if type(\"a\")~=\"string\"then error()end",
        "if type(true)~=\"boolean\"then error()end",
        "if type(nil)~=\"nil\"then error()end",
        "if type(function()end)~=\"function\"then error()end",
        "if type(game)~=\"userdata\"then error()end",
        "if type(workspace)~=\"userdata\"then error()end",
        "if type(Instance)~=\"function\"then error()end",
        "if type(getfenv)~=\"function\"then error()end",
        "if type(setfenv)~=\"function\"then error()end",
        "if type(coroutine)~=\"table\"then error()end",
        "if type(string)~=\"table\"then error()end",
        "if type(math)~=\"table\"then error()end",
        "if type(table)~=\"table\"then error()end"
    }
    
    local codeVaultGuards = ""
    for _, t in ipairs(rawTampers) do
        local fnName = generateCustomName()
        codeVaultGuards = codeVaultGuards .. "local " .. fnName .. "=function()" .. t .. "end " .. fnName .. "()"
    end
    
    return antiDebuggers .. codeVaultGuards
end

-- ==================== BYTECODE VM MEJORADA ====================
local function buildBytecodeVM(payloadStr)
    local bytecodeData = generateCustomName()
    local vmState = generateCustomName()
    local vmStack = generateCustomName()
    local vmRegs = generateCustomName()
    local vmPC = generateCustomName()
    local vmRunning = generateCustomName()
    
    local seed1 = math.random(1, 255)
    local seed2 = math.random(1, 255)
    local seed3 = math.random(1, 255)
    
    local bytecode = {}
    local key = (seed1 + seed2 + seed3) % 256
    
    for i = 1, #payloadStr do
        local val = string.byte(payloadStr, i)
        local xorKey = (key + i * 7 + 13) % 256
        table.insert(bytecode, string.char(val ~ xorKey))
    end
    
    local bytecodeStr = table.concat(bytecode)
    
    local vm = string.format([[
local %s=[[%s]]
local %s=1
local %s={}
local %s={}
local %s=1
local %s=true

local function %s()
    local %s=os.clock()*1000%%256
    local %s=%d
    local %s=%d
    local %s=%d
    local %s=(%s+%s+%s)%%256
    
    while %s do
        if %s==1 then
            local %s=string.byte(%s,%s) or 0
            local %s=(%s + %s * %s + %s) %% 256
            local %s=%s ~ %s
            
            if %s==0xC4 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                local %s=(%s + %s * %s + %s) %% 256
                %s[%s]=string.char(%s ~ %s)
                %s=%s+4
            elseif %s==0x11E then
                local %s=%s[1] or ""
                if %s~="" then
                    local %s=loadstring(%s)
                    if %s then
                        task.spawn(%s)
                        %s=false
                        break
                    end
                end
                %s=%s+1
            elseif %s==0x136 then
                %s=false
                break
            elseif %s==0x01 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                local %s=(%s + %s * %s + %s) %% 256
                %s[%s]=%s ~ %s
                %s=%s+4
            elseif %s==0x03 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                %s[%s]=(%s[%s] or 0) + (%s[%s] or 0)
                %s=%s+4
            elseif %s==0x04 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                %s[%s]=(%s[%s] or 0) - (%s[%s] or 0)
                %s=%s+4
            elseif %s==0x05 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                %s[%s]=(%s[%s] or 0) * (%s[%s] or 0)
                %s=%s+4
            elseif %s==0x06 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                %s[%s]=(%s[%s] or 0) / (%s[%s] or 0)
                %s=%s+4
            elseif %s==0x07 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                %s[%s]=(%s[%s] or 0) %% (%s[%s] or 0)
                %s=%s+4
            elseif %s==0x21 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                %s[%s]=bit32.bxor(%s[%s] or 0, %s[%s] or 0)
                %s=%s+4
            elseif %s==0x24 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                %s[%s]=not (%s[%s] or false)
                %s=%s+3
            elseif %s==0x25 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                %s[%s]=(%s[%s] and %s[%s])
                %s=%s+4
            elseif %s==0x26 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                %s[%s]=(%s[%s] or %s[%s])
                %s=%s+4
            elseif %s==0x1F then
                local %s=string.byte(%s,%s+1) or 0
                table.insert(%s, %s[%s] or 0)
                %s=%s+2
            elseif %s==0x20 then
                local %s=string.byte(%s,%s+1) or 0
                %s[%s]=table.remove(%s) or 0
                %s=%s+2
            elseif %s==0x0B then
                local %s=string.byte(%s,%s+1) or 0
                %s=%s
            elseif %s==0x0C then
                local %s=string.byte(%s,%s+1) or 0
                local %s=%s[%s] or function()end
                %s()
                %s=%s+2
            elseif %s==0x0D then
                return %s[%s] or 0
            elseif %s==0x2D then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                %s[%s]=#(%s[%s] or {})
                %s=%s+3
            elseif %s==0x36 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                %s[%s]=(%s[%s]==%s[%s])
                %s=%s+4
            elseif %s==0x37 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                %s[%s]=(%s[%s]<%s[%s])
                %s=%s+4
            elseif %s==0x38 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                %s[%s]=(%s[%s]<=%s[%s])
                %s=%s+4
            elseif %s==0x39 then
                local %s=string.byte(%s,%s+1) or 0
                local %s=string.byte(%s,%s+2) or 0
                local %s=string.byte(%s,%s+3) or 0
                %s[%s]=(%s[%s]~=%s[%s])
                %s=%s+4
            else
                %s=%s+1
            end
        end
        if %s > #%s then
            %s=false
            break
        end
        if %s>2000 then
            %s=false
            break
        end
        %s=%s+1
    end
end

%s()
]],
    bytecodeData, bytecodeStr,
    vmState,
    vmStack,
    vmRegs,
    vmPC,
    vmRunning,
    generateCustomName(),
    generateCustomName(),
    generateCustomName(), seed1,
    generateCustomName(), seed2,
    generateCustomName(), seed3,
    generateCustomName(), generateCustomName(), generateCustomName(), generateCustomName(),
    vmRunning,
    vmState,
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), generateCustomName(), generateCustomName(), vmPC, generateCustomName(),
    generateCustomName(), generateCustomName(), generateCustomName(),
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), generateCustomName(), generateCustomName(), vmPC, generateCustomName(),
    vmRegs, generateCustomName(), generateCustomName(), generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), vmRegs,
    generateCustomName(),
    generateCustomName(),
    vmRunning,
    vmPC, vmPC,
    generateCustomName(),
    vmRunning,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), generateCustomName(), generateCustomName(), vmPC, generateCustomName(),
    vmRegs, generateCustomName(), generateCustomName(), generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    vmRegs, generateCustomName(), vmRegs, generateCustomName(), vmRegs, generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    vmRegs, generateCustomName(), vmRegs, generateCustomName(), vmRegs, generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    vmRegs, generateCustomName(), vmRegs, generateCustomName(), vmRegs, generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    vmRegs, generateCustomName(), vmRegs, generateCustomName(), vmRegs, generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    vmRegs, generateCustomName(), vmRegs, generateCustomName(), vmRegs, generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    vmRegs, generateCustomName(), vmRegs, generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    vmRegs, generateCustomName(), vmRegs, generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    vmRegs, generateCustomName(), vmRegs, generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    vmRegs, generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    vmRegs, generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    vmRegs, generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    vmRegs, generateCustomName(),
    vmPC, vmPC,
    generateCustomName(),
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    generateCustomName(), bytecodeData, vmPC,
    vmRegs, generateCustomName(), vmRegs, generateCustomName(), vmRegs, generateCustomName(),
    vmPC, vmPC,
    generateCustomName()
    
    return vm
end

-- ==================== FUNCIÓN PRINCIPAL ====================
local function obfuscate(sourceCode)
    if not sourceCode or sourceCode == "" then
        return "-- Error: No Source"
    end
    
    math.randomseed(os.time())
    
    local protections = getProtections()
    
    local payloadToProtect = ""
    local isLoadstringRegex = 'loadstring%s*%(%s*game%s*:%s*HttpGet%s*%(%s*["\']([^"\']+)["\']%s*%)%s*%)%s*%(%s*%)'
    local match = string.match(sourceCode, isLoadstringRegex)
    
    if match then
        payloadToProtect = match
    else
        payloadToProtect = detectAndApplyMappings(sourceCode)
    end
    
    local vm = buildBytecodeVM(payloadToProtect)
    local junk = generateJunk(250)
    
    local finalCode = string.format([[
%s
%s
%s
%s
%s
]], HEADER, junk, protections, ANTI_TAMPER, vm)
    
    finalCode = string.gsub(finalCode, "%s+", " ")
    finalCode = string.gsub(finalCode, "^%s+", "")
    
    return finalCode
end

-- ==================== EXPORTAR ====================
return {
    obfuscate = obfuscate
}
