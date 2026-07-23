require('dotenv').config();

const {
    Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder,
    AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const axios = require('axios');
const { obfuscate } = require('./obfuscator.js');
const db = require('./db');
const { startServer } = require('./apiServer');

// ----------------------------------------------------------------------
// SERVER CONFIG
// ----------------------------------------------------------------------
const GUILD_ID = process.env.GUILD_ID || '1528140415276941555';
const AUTO_ROLE_ID = process.env.AUTO_ROLE_ID || '1529532495832416326';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
    ],
});

client.once('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}`);
    registerCommands();
    startServer(); // Inicia el servidor API en el puerto adecuado
});

// ----------------------------------------------------------------------
// AUTO ROLE
// ----------------------------------------------------------------------
client.on('guildMemberAdd', async member => {
    if (member.guild.id !== GUILD_ID) return;
    try {
        await member.roles.add(AUTO_ROLE_ID);
        console.log(`Assigned role ${AUTO_ROLE_ID} to ${member.user.tag}`);
    } catch (err) {
        console.error(`Failed to assign auto role: ${err.message}`);
    }
});

// ----------------------------------------------------------------------
// SLASH COMMAND REGISTRATION
// ----------------------------------------------------------------------
async function registerCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('obfuscate')
            .setDescription('Obfuscate your Lua code')
            .addStringOption(opt =>
                opt.setName('code')
                    .setDescription('Lua code to obfuscate')
                    .setRequired(false))
            .addAttachmentOption(opt =>
                opt.setName('file')
                    .setDescription('Lua file to obfuscate')
                    .setRequired(false)),
        new SlashCommandBuilder()
            .setName('obf')
            .setDescription('Obfuscate your Lua code (alias)')
            .addStringOption(opt =>
                opt.setName('code')
                    .setDescription('Lua code to obfuscate')
                    .setRequired(false))
            .addAttachmentOption(opt =>
                opt.setName('file')
                    .setDescription('Lua file to obfuscate')
                    .setRequired(false)),
        new SlashCommandBuilder()
            .setName('upload')
            .setDescription('Upload code to Pastefy')
            .addStringOption(opt =>
                opt.setName('code').setDescription('Code to upload').setRequired(false))
            .addAttachmentOption(opt =>
                opt.setName('file').setDescription('File to upload').setRequired(false)),
        new SlashCommandBuilder()
            .setName('help')
            .setDescription('Show available commands'),
        new SlashCommandBuilder()
            .setName('api')
            .setDescription('Generate or show your API key'),
        new SlashCommandBuilder()
            .setName('api_make')
            .setDescription('Generate or show your API key (alias)'),
        new SlashCommandBuilder()
            .setName('api_conf')
            .setDescription('View and manage your API key settings'),
    ];

    try {
        await client.application.commands.set(commands);
        console.log('Commands registered successfully');
    } catch (err) {
        console.error('Error registering commands:', err);
    }
}

// ----------------------------------------------------------------------
// INTERACTION HANDLER
// ----------------------------------------------------------------------
client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            const cmd = interaction.commandName;
            if (cmd === 'obfuscate' || cmd === 'obf') {
                await handleObfuscate(interaction);
            } else if (cmd === 'upload') {
                await handleUpload(interaction);
            } else if (cmd === 'help') {
                await handleHelp(interaction);
            } else if (cmd === 'api' || cmd === 'api_make') {
                await handleApi(interaction);
            } else if (cmd === 'api_conf') {
                await handleApiConf(interaction);
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'copy_api_key') {
                await handleCopyKey(interaction);
            } else if (interaction.customId === 'toggle_api_active') {
                await handleToggleActive(interaction);
            }
        }
    } catch (err) {
        console.error('Interaction error:', err);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'An error occurred.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'An error occurred.', ephemeral: true });
        }
    }
});

// ----------------------------------------------------------------------
// COMMAND HANDLERS (los mismos que antes)
// ----------------------------------------------------------------------
// ... (copia todas las funciones handleObfuscate, deliverObfuscationResult, handleUpload, handleHelp, handleApi, handleApiConf, handleCopyKey, handleToggleActive, generateCodeExamples, uploadToPastefy) ...
// Pero asegúrate de que generateCodeExamples use process.env.API_BASE_URL

// Voy a reescribir generateCodeExamples para que use la variable de entorno
function generateCodeExamples(apiKey) {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const endpoint = `${baseUrl}/api/obfuscate`;

    const examples = `
=== cURL ===
curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{"apiKey":"${apiKey}","code":"print('Hello World')"}'

=== Python ===
import requests
url = "${endpoint}"
payload = {
    "apiKey": "${apiKey}",
    "code": "print('Hello World')"
}
response = requests.post(url, json=payload)
print(response.json())

=== JavaScript (Node.js) ===
const fetch = require('node-fetch');
const url = "${endpoint}";
const payload = {
    apiKey: "${apiKey}",
    code: "print('Hello World')"
};
fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
.then(res => res.json())
.then(console.log);

=== Lua (with lua-requests) ===
local http = require("socket.http")
local ltn12 = require("ltn12")
local json = require("json")

local payload = [[
{
    "apiKey": "${apiKey}",
    "code": "print('Hello World')"
}
]]
local res, code = http.request{
    url = "${endpoint}",
    method = "POST",
    headers = { ["Content-Type"] = "application/json" },
    source = ltn12.source.string(payload)
}
print(res)

=== Java (using OkHttp) ===
import okhttp3.*;
import java.io.IOException;

public class Main {
    public static void main(String[] args) throws IOException {
        OkHttpClient client = new OkHttpClient();
        MediaType JSON = MediaType.get("application/json; charset=utf-8");
        String json = "{\\"apiKey\\":\\"${apiKey}\\",\\"code\\":\\"print('Hello World')\\"}";
        RequestBody body = RequestBody.create(json, JSON);
        Request request = new Request.Builder()
                .url("${endpoint}")
                .post(body)
                .build();
        try (Response response = client.newCall(request).execute()) {
            System.out.println(response.body().string());
        }
    }
}

=== C# (using HttpClient) ===
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        using var client = new HttpClient();
        var json = "{\\"apiKey\\":\\"${apiKey}\\",\\"code\\":\\"print('Hello World')\\"}";
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync("${endpoint}", content);
        Console.WriteLine(await response.Content.ReadAsStringAsync());
    }
}

=== Ruby ===
require 'net/http'
require 'json'

uri = URI("${endpoint}")
req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
req.body = { apiKey: "${apiKey}", code: "print('Hello World')" }.to_json
res = Net::HTTP.start(uri.hostname, uri.port) do |http|
  http.request(req)
end
puts res.body

=== PHP (with cURL) ===
<?php
$ch = curl_init("${endpoint}");
$payload = json_encode([
    "apiKey" => "${apiKey}",
    "code" => "print('Hello World')"
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>

=== Go ===
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    url := "${endpoint}"
    payload := map[string]string{
        "apiKey": "${apiKey}",
        "code":   "print('Hello World')",
    }
    jsonData, _ := json.Marshal(payload)
    resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    // read response...
}
`;
    return Buffer.from(examples, 'utf-8');
}

// El resto de funciones (handleObfuscate, etc.) se mantienen igual que en el código anterior.
// No los repito aquí por brevedad, pero asegúrate de copiarlos completos.

client.login(process.env.TOKEN);
