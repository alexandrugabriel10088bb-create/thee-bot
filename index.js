require('dotenv').config();

const {
    Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder,
    AttachmentBuilder,
} = require('discord.js');
const axios = require('axios');

const { obfuscate } = require('./obfuscator.js');

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
    ];

    try {
        await client.application.commands.set(commands);
        console.log('Commands registered successfully');
    } catch (err) {
        console.error('Error registering commands:', err);
    }
}

client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'obfuscate' || interaction.commandName === 'obf') {
            await handleObfuscate(interaction);
        } else if (interaction.commandName === 'upload') {
            await handleUpload(interaction);
        } else if (interaction.commandName === 'help') {
            await handleHelp(interaction);
        }
    } catch (err) {
        console.error('Interaction error:', err);
    }
});

// ----------------------------------------------------------------------
// COMMAND HANDLERS
// ----------------------------------------------------------------------
async function handleObfuscate(interaction) {
    const code = interaction.options.getString('code');
    const file = interaction.options.getAttachment('file');

    if (!code && !file) {
        await interaction.reply({ content: 'Please provide code or a .lua file.' });
        return;
    }

    let srcCode = code || '';
    if (file) {
        try {
            const res = await axios.get(file.url);
            srcCode = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
        } catch (e) {
            await interaction.reply({ content: `Could not download the file: ${e.message}` });
            return;
        }
    }

    await interaction.deferReply();
    try {
        const obfuscated = obfuscate(srcCode);
        await deliverObfuscationResult(interaction, srcCode, obfuscated);
    } catch (err) {
        console.error(err);
        await interaction.editReply({ content: `Error during obfuscation: ${err.message}` });
    }
}

async function deliverObfuscationResult(interaction, original, obfuscated) {
    const fileBuffer = Buffer.from(obfuscated, 'utf-8');
    const attachment = new AttachmentBuilder(fileBuffer, { name: 'obfuscated.lua' });

    let pasteUrl = 'N/A';
    try {
        const pasteData = await uploadToPastefy(obfuscated);
        pasteUrl = pasteData.url || pasteData.id || 'N/A';
    } catch (_) {}

    const dmEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('Code Obfuscated')
        .addFields(
            { name: 'Pastefy', value: pasteUrl, inline: false },
            { name: 'Size', value: `Original: ${original.length} bytes\nObfuscated: ${obfuscated.length} bytes`, inline: false },
        )
        .setFooter({ text: 'Banana Obfuscator' });

    // Enviar archivo solo por DM
    try {
        await interaction.user.send({ embeds: [dmEmbed], files: [attachment] });
        // Mensaje en el canal avisando que se envió por DM
        const channelEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✅ Obfuscation completed')
            .setDescription(`${interaction.user}, check your DMs for the obfuscated file.`)
            .setFooter({ text: 'Banana Obfuscator' });
        
        await interaction.editReply({ embeds: [channelEmbed] });
    } catch (_) {
        // Si no se puede enviar DM, enviar como archivo adjunto en el canal
        const fallbackEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('⚠️ Obfuscation completed')
            .setDescription(`${interaction.user}, I couldn't send you a DM. Here is your file.`)
            .addFields(
                { name: 'Pastefy', value: pasteUrl, inline: false },
                { name: 'Size', value: `Original: ${original.length} bytes\nObfuscated: ${obfuscated.length} bytes`, inline: false },
            )
            .setFooter({ text: 'Banana Obfuscator' });

        await interaction.editReply({
            embeds: [fallbackEmbed],
            files: [new AttachmentBuilder(fileBuffer, { name: 'obfuscated.lua' })],
        });
    }
}

async function handleUpload(interaction) {
    const code = interaction.options.getString('code');
    const file = interaction.options.getAttachment('file');

    if (!code && !file) {
        await interaction.reply({ content: 'Please provide code or a file.' });
        return;
    }

    let content = code || '';
    if (file) {
        const res = await axios.get(file.url);
        content = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    }

    await interaction.deferReply();
    try {
        const data = await uploadToPastefy(content);
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Uploaded to Pastefy')
            .addFields({ name: 'URL', value: data.url || data.id || 'N/A' })
            .setFooter({ text: 'Banana Obfuscator' });
        await interaction.editReply({ embeds: [embed] });
    } catch (err) {
        await interaction.editReply({ content: `Upload failed: ${err.message}` });
    }
}

async function handleHelp(interaction) {
    const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle('Available Commands')
        .setDescription('All commands are slash commands.')
        .addFields(
            { name: '/obfuscate', value: 'Obfuscate Lua code or a .lua file. The obfuscated file will be sent to your DMs.', inline: false },
            { name: '/obf', value: 'Alias of /obfuscate.', inline: false },
            { name: '/upload', value: 'Upload Lua code or a file to Pastefy.', inline: false },
            { name: '/help', value: 'Show this help message.', inline: false },
        )
        .setFooter({ text: 'Banana Obfuscator' });

    await interaction.reply({ embeds: [embed] });
}

async function uploadToPastefy(code) {
    const res = await axios.post('https://pastefy.app/api/v2/paste', {
        content: code,
        title: 'obfuscated.lua',
        type: 'PASTE',
    }, {
        headers: { 'Content-Type': 'application/json' },
    });
    return {
        url: `https://pastefy.app/${res.data.paste?.id || res.data.id}`,
        id: res.data.paste?.id || res.data.id,
    };
}

client.login(process.env.TOKEN);
