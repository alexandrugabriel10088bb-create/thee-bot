// ==================== HEADER ====================
const HEADER = `--[[ Protected by Custom VM Obfuscator ]]`;

// ==================== VARIABLES PERSONALIZADAS (RANDOM) ====================
const CUSTOM_VARS = [
    "etr", "tr", "etr_", "_etr", "tr_", "_tr", "etr1", "tr1", "etr2", "tr2",
    "etrx", "trx", "ETR", "TR", "etr_data", "tr_data", "etr_temp", "tr_temp",
    "data", "temp", "result", "value", "index", "count", "total", "amount",
    "position", "status", "flags", "config", "cache", "buffer", "stream",
    "packet", "frame", "token", "session", "client", "server", "node"
];

// ==================== OPCODES PERSONALIZADOS ====================
const OPCODES = {
    NOP: 0x00,
    LOAD: 0x01,
    STORE: 0x02,
    ADD: 0x03,
    SUB: 0x04,
    MUL: 0x05,
    DIV: 0x06,
    MOD: 0x07,
    POW: 0x08,
    CONCAT: 0x09,
    CMP_EQ: 0x0A,
    CMP_NE: 0x0B,
    CMP_LT: 0x0C,
    CMP_GT: 0x0D,
    CMP_LE: 0x0E,
    CMP_GE: 0x0F,
    JMP: 0x10,
    JMP_IF: 0x11,
    JMP_IF_NOT: 0x12,
    CALL: 0x13,
    RETURN: 0x14,
    NEW_TABLE: 0x15,
    SET_TABLE: 0x16,
    GET_TABLE: 0x17,
    NEW_FUNCTION: 0x18,
    CLOSURE: 0x19,
    VARARG: 0x1A,
    GET_UPVAL: 0x1B,
    SET_UPVAL: 0x1C,
    GET_GLOBAL: 0x1D,
    SET_GLOBAL: 0x1E,
    GET_METATABLE: 0x1F,
    SET_METATABLE: 0x20,
    TYPE_CHECK: 0x21,
    TOSTRING: 0x22,
    TONUMBER: 0x23,
    LENGTH: 0x24,
    NEXT: 0x25,
    PAIRS: 0x26,
    IPAIRS: 0x27,
    SELECT: 0x28,
    ASSERT: 0x29,
    ERROR: 0x2A,
    PCALL: 0x2B,
    XOR: 0x2C,
    SHL: 0x2D,
    SHR: 0x2E,
    NOT: 0x2F,
    AND: 0x30,
    OR: 0x31,
    BAND: 0x32,
    BOR: 0x33,
    BNOT: 0x34,
    GET_ENV: 0x35,
    SET_ENV: 0x36,
    LOAD_STRING: 0x37,
    LOAD_NUMBER: 0x38,
    LOAD_BOOLEAN: 0x39,
    LOAD_NIL: 0x3A,
    DUP: 0x3B,
    SWAP: 0x3C,
    ROT: 0x3D,
    PUSH: 0x3E,
    POP: 0x3F,
    // OPCODES PERSONALIZADOS
    DECRYPT_STRING: 0xC4,  // 196 - load decrypted string into register
    COMPILE_LOAD: 0x11E,   // 286 - get string from register and compile
    STOP_VM: 0x136         // 310 - stop VM
};

// ==================== HANDLER POOL ====================
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"];

// ==================== ANTI-TAMPER COMPLETO ====================
const ANTI_TAMPER = `
local function etr_protect()
    local function etr_check_env()
        if not _G then error("ENV_ERROR") end
        local funcs = {"pcall","xpcall","error","assert","type","rawget","rawset"}
        for _,f in ipairs(funcs) do
            if type(_G[f]) ~= "function" then error("FUNC_ERROR:"..f) end
        end
        if type(game) ~= "userdata" then error("GAME_ERROR") end
        return true
    end
    
    local function etr_anti_debug()
        if debug then
            local d_funcs = {"getinfo","getupvalue","setupvalue","getlocal","setlocal",
                "getmetatable","setmetatable","getregistry","getfenv","setfenv"}
            for _,f in ipairs(d_funcs) do
                pcall(function() debug[f] = nil end)
            end
            if debug.getinfo then error("DEBUG_ACTIVE") end
        end
        if debug and debug.sethook then
            local hook = false
            debug.sethook(function() hook = true end, "l", 1)
            debug.sethook()
            if hook then error("HOOK_DETECTED") end
        end
        return true
    end
    
    local function etr_protect_constants()
        local protected_constants = {}
        local function protect_value(val)
            if type(val) == "string" then
                local encoded = ""
                for i = 1, #val do
                    encoded = encoded .. string.char(string.byte(val, i) + 1)
                end
                return encoded
            elseif type(val) == "number" then
                return val + 1
            elseif type(val) == "boolean" then
                return not val
            else
                return val
            end
        end
        local function restore_value(val, orig_type)
            if orig_type == "string" then
                local decoded = ""
                for i = 1, #val do
                    decoded = decoded .. string.char(string.byte(val, i) - 1)
                end
                return decoded
            elseif orig_type == "number" then
                return val - 1
            elseif orig_type == "boolean" then
                return not val
            else
                return val
            end
        end
        return protect_value, restore_value
    end
    
    local function etr_protect_memory()
        local protected = {}
        local function protect_table(t, name)
            if type(t) ~= "table" then return end
            local meta = getmetatable(t) or {}
            meta.__index = function(tbl, k)
                if protected[tbl] and protected[tbl][k] then
                    return protected[tbl][k]
                end
                return rawget(tbl, k)
            end
            meta.__newindex = function(tbl, k, v)
                if protected[tbl] and protected[tbl][k] then
                    error("PROTECTED:"..name)
                end
                rawset(tbl, k, v)
            end
            meta.__metatable = "PROTECTED"
            setmetatable(t, meta)
        end
        local tables = {_G, game, workspace, script}
        for _,t in ipairs(tables) do
            if type(t) == "table" then protect_table(t, "critical") end
        end
        return true
    end
    
    local function etr_check_time()
        local start = os.time()
        local count = 0
        for i = 1, 100000 do count = count + 1 end
        if os.time() < start then error("TIME_ERROR") end
        return true
    end
    
    local function etr_check_integrity()
        local check_funcs = {"print","warn","error","type","tostring","tonumber"}
        for _,f in ipairs(check_funcs) do
            if type(_G[f]) ~= "function" then error("FUNC_MISS:"..f) end
        end
        if string.lower("TEST") ~= "test" then error("STRING_ERROR") end
        if math.floor(123.456) ~= 123 then error("MATH_ERROR") end
        return true
    end
    
    local function etr_guardian()
        local function guardian_thread()
            local counter = 0
            while true do
                counter = counter + 1
                if counter % 100 == 0 then
                    if type(_G) ~= "table" then error("G_MODIFIED") end
                    if type(game) ~= "userdata" then error("GAME_REMOVED") end
                    if debug and debug.getinfo then error("DEBUG_REACTIVATED") end
                end
                local pause = os.clock()
                while os.clock() - pause < 0.001 do end
            end
        end
        local thread = coroutine.create(guardian_thread)
        local success, err = coroutine.resume(thread)
        if not success then error("GUARDIAN_FAIL:"..tostring(err)) end
        return thread
    end
    
    local function etr_execute()
        local checks = {
            etr_check_env,
            etr_anti_debug,
            etr_protect_memory,
            etr_check_time,
            etr_check_integrity
        }
        for _,check in ipairs(checks) do
            local success, err = pcall(check)
            if not success then error("CHECK_FAIL:"..tostring(err)) end
        end
        local guardian = etr_guardian()
        local protect, restore = etr_protect_constants()
        return true, "OK", protect, restore
    end
    
    local success, msg, protect_fn, restore_fn = pcall(etr_execute)
    if not success then
        while true do
            error("ANTI_TAMPER:"..tostring(msg), 0)
        end
    end
    return protect_fn, restore_fn
end

local etr_protect, etr_restore = pcall(etr_protect)
`;

// ==================== FUNCIONES AUXILIARES ====================

function generateCustomName() {
    const base = CUSTOM_VARS[Math.floor(Math.random() * CUSTOM_VARS.length)];
    const suffix = Math.floor(Math.random() * 999999);
    const prefixes = ["", "get_", "set_", "is_", "has_", "on_", "do_", "check_", "verify_", "exec_", "proc_", "handle_", "calc_", "load_"];
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

function generateJunk(lines = 250) {
    let j = '';
    const junkTypes = [
        () => `local ${generateCustomName()}=${Math.floor(Math.random() * 99999)} `,
        () => `local ${generateCustomName()}=string.char(${Math.floor(Math.random()*255)}) `,
        () => `local ${generateCustomName()}=function() return ${Math.random() * 1000} end `,
        () => `local ${generateCustomName()}={} ${generateCustomName()}[1]="${generateCustomName()}" `,
        () => `if not(1==1) then local x=1 end `,
        () => `if false then local ${generateCustomName()}=1 end `,
        () => `if type(nil)=="number" then local ${generateCustomName()}=1 end `,
        () => `while false do local ${generateCustomName()}=1 end `,
        () => `repeat local ${generateCustomName()}=1 until true `,
        () => `do local ${generateCustomName()}={} ${generateCustomName()}["_"]=1 ${generateCustomName()}=nil end `,
        () => `do local ${generateCustomName()}=function() return "test" end ${generateCustomName()}() end `,
        () => `local ${generateCustomName()}=math.floor(${Math.random()*1000}) + ${Math.floor(Math.random()*100)} `,
        () => `local ${generateCustomName()}=string.len("${generateCustomName()}") `,
        () => `local function ${generateCustomName()}() local ${generateCustomName()}=1 return ${generateCustomName()} end `,
        () => `local ${generateCustomName()}=function(${generateCustomName()}) return ${generateCustomName()}+1 end `,
        () => `local ${generateCustomName()}={${generateCustomName()}=1,${generateCustomName()}=2} `,
        () => `local ${generateCustomName()}=setmetatable({}, {__index=function() return nil end}) `,
        () => `local ${generateCustomName()}="${generateCustomName()}".."${generateCustomName()}" `,
        () => `local ${generateCustomName()}=bit32.bxor(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}) `,
        () => `local ${generateCustomName()}=string.gsub("test","t","${generateCustomName()}") `
    ];
    
    for (let i = 0; i < lines; i++) {
        const randomIndex = Math.floor(Math.random() * junkTypes.length);
        j += junkTypes[randomIndex]();
        if (Math.random() < 0.03) {
            j += '\n';
        }
    }
    return j;
}

function encodeConstant(value) {
    const type = typeof value;
    if (type === 'string') {
        let encoded = '';
        for (let i = 0; i < value.length; i++) {
            encoded += String.fromCharCode(value.charCodeAt(i) + 1);
        }
        return `"${encoded}"`;
    } else if (type === 'number') {
        return `(${value} + 1)`;
    } else if (type === 'boolean') {
        return `not ${value}`;
    } else if (type === 'nil') {
        return 'nil';
    } else if (type === 'table') {
        return '{}';
    } else {
        return `"${value}"`;
    }
}

function decodeConstant(value, type) {
    if (type === 'string') {
        let decoded = '';
        for (let i = 0; i < value.length; i++) {
            decoded += String.fromCharCode(value.charCodeAt(i) - 1);
        }
        return `"${decoded}"`;
    } else if (type === 'number') {
        return `(${value} - 1)`;
    } else if (type === 'boolean') {
        return `not ${value}`;
    } else {
        return value;
    }
}

function detectAndApplyMappings(code) {
    const MAPEO = {
        "ScreenGui": "etr_ui",
        "Frame": "etr_frame",
        "TextLabel": "etr_label",
        "TextButton": "etr_button",
        "Humanoid": "etr_char",
        "Player": "etr_user",
        "RunService": "etr_run",
        "TweenService": "etr_tween",
        "Players": "etr_players",
        "Workspace": "etr_world",
        "ReplicatedStorage": "etr_storage",
        "ServerScriptService": "etr_server",
        "DataStoreService": "etr_data",
        "HttpService": "etr_http",
        "MarketplaceService": "etr_market",
        "Instance.new": "etr_new",
        "game:GetService": "etr_get",
        "wait": "etr_wait",
        "spawn": "etr_spawn",
        "delay": "etr_delay"
    };
    
    let modified = code;
    let headers = "";
    let constants = {};
    
    // Proteger constantes
    modified = modified.replace(/"([^"]+)"/g, (match, content) => {
        if (content.length > 2 && Math.random() > 0.3) {
            const varName = generateCustomName();
            constants[varName] = { value: content, type: 'string' };
            headers += `local ${varName}=etr_restore("${encodeConstant(content)}","string") `;
            return varName;
        }
        return match;
    });
    
    modified = modified.replace(/\b(\d+)\b/g, (match, number) => {
        if (parseInt(number) > 10 && Math.random() > 0.4) {
            const varName = generateCustomName();
            constants[varName] = { value: parseInt(number), type: 'number' };
            headers += `local ${varName}=etr_restore(${encodeConstant(parseInt(number))},"number") `;
            return varName;
        }
        return match;
    });
    
    modified = modified.replace(/\b(true|false)\b/g, (match, bool) => {
        if (Math.random() > 0.5) {
            const varName = generateCustomName();
            const val = bool === 'true';
            constants[varName] = { value: val, type: 'boolean' };
            headers += `local ${varName}=etr_restore(${encodeConstant(val)},"boolean") `;
            return varName;
        }
        return match;
    });
    
    for (const [original, replacement] of Object.entries(MAPEO)) {
        const regex = new RegExp(`\\b${original}\\b`, "g");
        if (regex.test(modified)) {
            const varName = generateCustomName();
            headers += `local ${varName}="${original}" `;
            regex.lastIndex = 0;
            modified = modified.replace(regex, () => `game[${varName}]`);
        }
    }
    
    return headers + modified;
}

function getProtections() {
    const antiDebuggers = `
        local etr_clock=os.clock() 
        local etr_count=0 
        for etr_i=1,300000 do 
            etr_count=etr_count+1 
            if os.clock()-etr_clock>5.0 then error("TIMEOUT") end 
        end 
        if debug and debug.getinfo then 
            local etr_info=debug.getinfo(1) 
            if etr_info and etr_info.what~="main" and etr_info.what~="Lua" then 
                error("DEBUG_DETECTED") 
            end 
        end 
        if debug and debug.sethook then 
            debug.sethook(function() error("HOOK_DETECTED") end, "l", 1) 
        end
        if bit32 then
            local etr_test=bit32.bxor(123,456)
            if etr_test~=435 then error("BIT32_ERROR") end
        end
    `;

    const rawTampers = [
        `if math.pi<3.14 or math.pi>3.15 then error("PI_ERROR") end`,
        `if type(tostring)~="function" then error("TOSTRING_ERROR") end`,
        `if not string.match("test","^t.*t$") then error("STRING_ERROR") end`,
        `if type({})~="table" then error("TABLE_ERROR") end`,
        `if type(1)~="number" then error("NUMBER_ERROR") end`,
        `if type("a")~="string" then error("STRING_TYPE_ERROR") end`,
        `if type(true)~="boolean" then error("BOOLEAN_ERROR") end`,
        `if type(nil)~="nil" then error("NIL_ERROR") end`,
        `if type(function() end)~="function" then error("FUNCTION_ERROR") end`,
        `if type(game)~="userdata" then error("GAME_ERROR") end`,
        `if type(workspace)~="userdata" then error("WORKSPACE_ERROR") end`,
        `if type(Instance)~="function" then error("INSTANCE_ERROR") end`,
        `if type(getfenv)~="function" then error("GETFENV_ERROR") end`,
        `if type(setfenv)~="function" then error("SETFENV_ERROR") end`,
        `if type(coroutine)~="table" then error("COROUTINE_ERROR") end`,
        `if type(string)~="table" then error("STRING_TABLE_ERROR") end`,
        `if type(math)~="table" then error("MATH_TABLE_ERROR") end`,
        `if type(table)~="table" then error("TABLE_TABLE_ERROR") end`
    ];

    let codeVaultGuards = "";
    for (const t of rawTampers) {
        const fnName = generateCustomName();
        codeVaultGuards += `local ${fnName}=function() ${t} end ${fnName}() `;
    }

    return antiDebuggers + codeVaultGuards;
}

// ==================== VM CON OPCODES PERSONALIZADOS ====================

function buildHandlerVM(payloadStr) {
    const handlerCount = Math.floor(Math.random() * 12) + 8;
    const handlers = pickHandlers(handlerCount);
    const realIdx = Math.floor(Math.random() * handlerCount);
    const dispatchTable = generateCustomName();
    const stateVar = generateCustomName();
    const dataVar = generateCustomName();
    const wrapperVar = "VM_" + Math.floor(Math.random() * 99999);
    const resultVar = generateCustomName();
    const opcodeVar = generateCustomName();
    const stackVar = generateCustomName();
    const pcVar = generateCustomName();
    const regVar = generateCustomName();
    
    // Generar opcodes ofuscados
    const opcodeNames = {};
    for (const [name, code] of Object.entries(OPCODES)) {
        opcodeNames[name] = generateCustomName();
    }
    
    let vm = `
    -- ==================== CUSTOM VM PRO ====================
    local ${wrapperVar}={}
    local ${dataVar}=[[${payloadStr}]]
    local ${dispatchTable}={}
    local ${stackVar}={}
    local ${regVar}={}
    local ${pcVar}=1
    local ${opcodeVar}=0
    
    -- ==================== OPCODES ====================
    `;
    
    // Definir opcodes
    for (const [name, code] of Object.entries(OPCODES)) {
        vm += `local ${opcodeNames[name]}=${code} `;
    }
    
    vm += `
    -- ==================== HANDLERS ====================
    `;
    
    // Crear handlers con diferentes opcodes incluyendo los personalizados
    const opcodeKeys = Object.keys(OPCODES);
    for (let i = 0; i < handlers.length; i++) {
        const opcodeKey = opcodeKeys[i % opcodeKeys.length];
        if (i === realIdx) {
            vm += `local ${handlers[i]}=function(self)
                local ${generateCustomName()}=${opcodeNames.DECRYPT_STRING}
                local ${generateCustomName()}=${opcodeNames.COMPILE_LOAD}
                local ${generateCustomName()}=${opcodeNames.STOP_VM}
                
                -- Decrypt string (opcode 196)
                if ${generateCustomName()}==196 then
                    local ${generateCustomName()}=loadstring(${dataVar})
                    if ${generateCustomName()} then
                        local ${resultVar}=${generateCustomName()}()
                        if ${resultVar} then
                            self.reg[1]=${resultVar}
                            return ${resultVar}
                        end
                    end
                end
                
                -- Compile and load (opcode 286)
                if ${generateCustomName()}==286 then
                    local ${generateCustomName()}=self.reg[1]
                    if ${generateCustomName()} then
                        local ${generateCustomName()}=loadstring(${generateCustomName()})
                        if ${generateCustomName()} then
                            task.spawn(${generateCustomName()})
                            return true
                        end
                    end
                end
                
                -- Stop VM (opcode 310)
                if ${generateCustomName()}==310 then
                    self.running=false
                    return "STOP"
                end
                
                return nil
            end `;
        } else if (i === (realIdx + 1) % handlers.length) {
            vm += `local ${handlers[i]}=function(self)
                local ${generateCustomName()}=${opcodeNames[opcodeKey]}
                if ${generateCustomName()}==${OPCODES.DECRYPT_STRING} then
                    local ${generateCustomName()}="decrypted"
                    self.reg[1]=${generateCustomName()}
                    return ${generateCustomName()}
                end
                return nil
            end `;
        } else if (i === (realIdx + 2) % handlers.length) {
            vm += `local ${handlers[i]}=function(self)
                local ${generateCustomName()}=${opcodeNames[opcodeKey]}
                if ${generateCustomName()}==${OPCODES.COMPILE_LOAD} then
                    local ${generateCustomName()}=self.reg[1] or ""
                    if ${generateCustomName()}~="" then
                        local ${generateCustomName()}=loadstring(${generateCustomName()})
                        if ${generateCustomName()} then
                            task.spawn(${generateCustomName()})
                            return true
                        end
                    end
                end
                return nil
            end `;
        } else if (i === (realIdx + 3) % handlers.length) {
            vm += `local ${handlers[i]}=function(self)
                local ${generateCustomName()}=${opcodeNames[opcodeKey]}
                if ${generateCustomName()}==${OPCODES.STOP_VM} then
                    self.running=false
                    return "STOPPED"
                end
                return nil
            end `;
        } else {
            vm += `local ${handlers[i]}=function(self)
                local ${generateCustomName()}=${opcodeNames[opcodeKey]}
                local ${generateCustomName()}=${generateCustomName()}
                local ${generateCustomName()}=${generateCustomName()}
                local ${generateCustomName()}=${generateCustomName()}
                return nil
            end `;
        }
        vm += `${dispatchTable}[${i+1}]=${handlers[i]} `;
    }
    
    vm += `
    -- ==================== EJECUTOR DE VM ====================
    ${wrapperVar}.handlers=${dispatchTable}
    ${wrapperVar}.state=0
    ${wrapperVar}.counter=0
    ${wrapperVar}.stack=${stackVar}
    ${wrapperVar}.reg=${regVar}
    ${wrapperVar}.pc=${pcVar}
    ${wrapperVar}.running=true
    
    function ${wrapperVar}:execute()
        local ${stateVar}=1
        local ${generateCustomName()}=0
        local ${generateCustomName()}=false
        
        while self.running do
            if ${stateVar}==1 then
                if self.handlers[1] then
                    local ${resultVar}=self.handlers[1](self)
                    if ${resultVar} then
                        self.state=1
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=2
            elseif ${stateVar}==2 then
                if self.handlers[2] then
                    local ${resultVar}=self.handlers[2](self)
                    if ${resultVar} then
                        self.state=2
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=3
            elseif ${stateVar}==3 then
                if self.handlers[3] then
                    local ${resultVar}=self.handlers[3](self)
                    if ${resultVar} then
                        self.state=3
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=4
            elseif ${stateVar}==4 then
                if self.handlers[4] then
                    local ${resultVar}=self.handlers[4](self)
                    if ${resultVar} then
                        self.state=4
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=5
            elseif ${stateVar}==5 then
                if self.handlers[5] then
                    local ${resultVar}=self.handlers[5](self)
                    if ${resultVar} then
                        self.state=5
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=6
            elseif ${stateVar}==6 then
                if self.handlers[6] then
                    local ${resultVar}=self.handlers[6](self)
                    if ${resultVar} then
                        self.state=6
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=7
            elseif ${stateVar}==7 then
                if self.handlers[7] then
                    local ${resultVar}=self.handlers[7](self)
                    if ${resultVar} then
                        self.state=7
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=8
            elseif ${stateVar}==8 then
                if self.handlers[8] then
                    local ${resultVar}=self.handlers[8](self)
                    if ${resultVar} then
                        self.state=8
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=9
            elseif ${stateVar}==9 then
                if self.handlers[9] then
                    local ${resultVar}=self.handlers[9](self)
                    if ${resultVar} then
                        self.state=9
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=10
            elseif ${stateVar}==10 then
                if self.handlers[10] then
                    local ${resultVar}=self.handlers[10](self)
                    if ${resultVar} then
                        self.state=10
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=11
            elseif ${stateVar}==11 then
                if self.handlers[11] then
                    local ${resultVar}=self.handlers[11](self)
                    if ${resultVar} then
                        self.state=11
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=12
            elseif ${stateVar}==12 then
                if self.handlers[12] then
                    local ${resultVar}=self.handlers[12](self)
                    if ${resultVar} then
                        self.state=12
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=13
            elseif ${stateVar}==13 then
                if self.handlers[13] then
                    local ${resultVar}=self.handlers[13](self)
                    if ${resultVar} then
                        self.state=13
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=14
            elseif ${stateVar}==14 then
                if self.handlers[14] then
                    local ${resultVar}=self.handlers[14](self)
                    if ${resultVar} then
                        self.state=14
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=15
            elseif ${stateVar}==15 then
                if self.handlers[15] then
                    local ${resultVar}=self.handlers[15](self)
                    if ${resultVar} then
                        self.state=15
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=16
            elseif ${stateVar}==16 then
                if self.handlers[16] then
                    local ${resultVar}=self.handlers[16](self)
                    if ${resultVar} then
                        self.state=16
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=17
            elseif ${stateVar}==17 then
                if self.handlers[17] then
                    local ${resultVar}=self.handlers[17](self)
                    if ${resultVar} then
                        self.state=17
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=18
            elseif ${stateVar}==18 then
                if self.handlers[18] then
                    local ${resultVar}=self.handlers[18](self)
                    if ${resultVar} then
                        self.state=18
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=19
            elseif ${stateVar}==19 then
                if self.handlers[19] then
                    local ${resultVar}=self.handlers[19](self)
                    if ${resultVar} then
                        self.state=19
                        table.insert(self.stack, ${resultVar})
                        if ${resultVar}=="STOP" or ${resultVar}=="STOPPED" then
                            self.running=false
                            break
                        end
                        return ${resultVar}
                    end
                end
                ${stateVar}=20
            else
                self.state=20
                break
            end
            self.counter=self.counter+1
            if self.counter>5000 then error("VM_LIMIT") end
            self.pc=self.pc+1
        end
        return true
    end
    
    -- ==================== EJECUTAR VM ====================
    local ${generateCustomName()}=${wrapperVar}:execute()
    if not ${generateCustomName()} then error("VM_FAILED") end
    `;
    
    return vm;
}

// ==================== FUNCIÓN PRINCIPAL ====================

function obfuscate(sourceCode) {
    if (!sourceCode) return '-- Error: No Source';

    // 1. Protecciones
    const protections = getProtections();

    // 2. Preparar payload con protección de constantes
    let payloadToProtect = "";
    const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
    const match = sourceCode.match(isLoadstringRegex);
    if (match) { 
        payloadToProtect = match[1]; 
    } else { 
        payloadToProtect = detectAndApplyMappings(sourceCode); 
    }

    // 3. Construir VM mejorada con opcodes personalizados
    const vm = buildHandlerVM(payloadToProtect);

    // 4. Generar JUNK masivo
    const junk = generateJunk(250);

    // 5. Montar final
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
