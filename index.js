require('dotenv').config();

const {
    Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder,
    AttachmentBuilder,
} = require('discord.js');
const axios = require('axios');

const { obfuscate } = require('./obfuscator.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
});

client.once('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}`);
    registerCommands();
});

// Slash command registration
async function registerCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('obf')
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
            .setName('upload')
            .setDescription('Upload code to Pastefy')
            .addStringOption(opt =>
                opt.setName('code').setDescription('Code to upload').setRequired(false))
            .addAttachmentOption(opt =>
                opt.setName('file').setDescription('File to upload').setRequired(false)),
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

        if (interaction.commandName === 'obf') await handleObf(interaction);
        if (interaction.commandName === 'upload') await handleUpload(interaction);
    } catch (err) {
        console.error('Interaction error:', err);
    }
});

async function handleObf(interaction) {
    const code = interaction.options.getString('code');
    const file = interaction.options.getAttachment('file');

    if (!code && !file) {
        await interaction.reply({ content: 'Please provide code or a .lua file.', ephemeral: true });
        return;
    }

    let srcCode = code || '';
    if (file) {
        try {
            const res = await axios.get(file.url);
            srcCode = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
        } catch (e) {
            await interaction.reply({ content: `Could not download the file: ${e.message}`, ephemeral: true });
            return;
        }
    }

    await interaction.deferReply({ ephemeral: true });
    try {
        const obfuscated = obfuscate(srcCode);
        await deliverResult(interaction, srcCode, obfuscated);
    } catch (err) {
        console.error(err);
        await interaction.editReply({ content: `Error during obfuscation: ${err.message}` });
    }
}

async function deliverResult(interaction, original, obfuscated) {
    const fileBuffer = Buffer.from(obfuscated, 'utf-8');
    const attachment = new AttachmentBuilder(fileBuffer, { name: 'obfuscated.lua' });

    let pasteUrl = 'N/A';
    try {
        const pasteData = await uploadToPastefy(obfuscated);
        pasteUrl = pasteData.url || pasteData.id || 'N/A';
    } catch (_) {
        // Pastefy upload is optional
    }

    const dmEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('Code Obfuscated')
        .addFields(
            { name: 'Pastefy', value: pasteUrl, inline: false },
            { name: 'Size', value: `Original: ${original.length} bytes\nObfuscated: ${obfuscated.length} bytes`, inline: false },
        );

    try {
        await interaction.user.send({ embeds: [dmEmbed], files: [attachment] });
    } catch (_) {
        // DMs might be closed — fall back to reply attachment
    }

    const channelEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('Obfuscation completed')
        .setDescription(`${interaction.user}, check your DMs. File is also attached here.`);

    await interaction.editReply({
        embeds: [channelEmbed],
        files: [new AttachmentBuilder(fileBuffer, { name: 'obfuscated.lua' })],
    });
}

async function handleUpload(interaction) {
    const code = interaction.options.getString('code');
    const file = interaction.options.getAttachment('file');

    if (!code && !file) {
        await interaction.reply({ content: 'Please provide code or a file.', ephemeral: true });
        return;
    }

    let content = code || '';
    if (file) {
        const res = await axios.get(file.url);
        content = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    }

    await interaction.deferReply({ ephemeral: true });
    try {
        const data = await uploadToPastefy(content);
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Uploaded to Pastefy')
            .addFields({ name: 'URL', value: data.url || data.id || 'N/A' });
        await interaction.editReply({ embeds: [embed] });
    } catch (err) {
        await interaction.editReply({ content: `Upload failed: ${err.message}` });
    }
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
