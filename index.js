require('dotenv').config();

const {
    Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder,
    ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
} = require('discord.js');
const axios = require('axios');

const normalObfuscate = require('./normal.js');
const hardObfuscate   = require('./hard.js');
const { customObfuscate, maxObfuscate } = require('./custom.js');

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

// ─── Slash command registration ─────────────────────────────────

async function registerCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('obf')
            .setDescription('Obfuscate your Lua code')
            .addStringOption(opt =>
                opt.setName('mode')
                    .setDescription('Obfuscation level')
                    .setRequired(true)
                    .addChoices(
                        { name: '🟢 Normal — Low/Medium aggressiveness', value: 'normal' },
                        { name: '🔴 Hard   — High aggressiveness',         value: 'hard'   },
                        { name: '💀 Max    — Extreme (all techniques)',    value: 'max'    },
                        { name: '⚙️  Custom — Choose extreme techniques', value: 'custom' },
                    ))
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

// ─── Custom mode: all 💀 extreme techniques ───────────────────────

const CUSTOM_TECHNIQUES = [
    { id: 'chaotic_rename',   label: '💀 Chaotic renaming',           desc: 'Names up to 20 chars, mixed random' },
    { id: 'obf_strings',      label: '💀 String obfuscation',         desc: 'Every string → string.char()' },
    { id: 'extreme_math',     label: '💀 Extreme math',               desc: '8-10 nested operations per number' },
    { id: 'extreme_mba',      label: '💀 Extreme MBA',                desc: 'Mixed Boolean Arithmetic' },
    { id: 'obf_booleans',     label: '💀 Boolean obfuscation',        desc: 'true→(1==1), false→(1==0)' },
    { id: 'obf_nil',          label: '💀 Nil obfuscation',            desc: 'nil→(function() end)()' },
    { id: 'massive_junk',     label: '💀 Massive junk',               desc: '500-800 lines of dead code' },
    { id: 'ultra_cff',        label: '💀 Ultra CFF',                  desc: 'Nested states with false conditions' },
    { id: 'recursive_vm',     label: '💀 Recursive VM (50-80 layers)', desc: 'Fragile VM with integrity check' },
    { id: 'polymorphic_vm',   label: '💀 Polymorphic VM',             desc: 'Different structure each run' },
    { id: 'full_antidebug',   label: '💀 Full anti-debug',            desc: 'All anti-debug techniques' },
    { id: 'total_antihook',   label: '💀 Total anti-hook',            desc: 'Hooks on all native functions' },
    { id: 'anti_getlocal',    label: '💀 Anti-getlocal',              desc: 'Blocks debug.getlocal/setlocal' },
    { id: 'anti_getinfo',     label: '💀 Anti-getinfo',               desc: 'Blocks debug.getinfo' },
    { id: 'anti_stacktrace',  label: '💀 Anti-stacktrace',            desc: 'Obfuscates stack traces' },
    { id: 'anti_timing',      label: '💀 Extreme anti-timing',        desc: 'Strict 5-7 second timeouts' },
    { id: 'anti_profile',     label: '💀 Anti-profile',                desc: 'Prevents profiling and analysis' },
    { id: 'anti_print',       label: '💀 Anti-print/rconsole',          desc: 'Blocks print, warn, rconsole' },
    { id: 'executor_detect',  label: '💀 Executor detection',         desc: 'Synapse, KRNL, ScriptWare...' },
    { id: 'checksum',         label: '💀 Checksum (MD5 simulated)',   desc: 'Runtime self-checksum' },
    { id: 'auto_restore',     label: '💀 Self-restore',               desc: 'Detects in-memory modifications' },
    { id: 'integrity_checks', label: '💀 8 integrity checks',         desc: 'Verifies native functions' },
];

// ─── Interaction router ───────────────────────────────────────

const userSessions = new Map();

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            if (interaction.commandName === 'obf')    await handleObf(interaction);
            if (interaction.commandName === 'upload') await handleUpload(interaction);
        } else if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
        } else if (interaction.isStringSelectMenu()) {
            await handleSelectMenuInteraction(interaction);
        }
    } catch (err) {
        console.error('Interaction error:', err);
    }
});

// ─── /obf handler ─────────────────────────────────────────────

async function handleObf(interaction) {
    const mode = interaction.options.getString('mode');
    const code = interaction.options.getString('code');
    const file = interaction.options.getAttachment('file');

    if (!code && !file) {
        await interaction.reply({ content: '❌ Please provide code or a .lua file.', ephemeral: true });
        return;
    }

    let srcCode = code || '';
    if (file) {
        try {
            const res = await axios.get(file.url);
            srcCode = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
        } catch (e) {
            await interaction.reply({ content: `❌ Could not download the file: ${e.message}`, ephemeral: true });
            return;
        }
    }

    if (mode === 'custom') {
        return showCustomMenu(interaction, srcCode);
    }

    await interaction.deferReply({ ephemeral: true });
    try {
        let obfuscated;
        if (mode === 'normal')       obfuscated = normalObfuscate(srcCode);
        else if (mode === 'hard')    obfuscated = hardObfuscate(srcCode);
        else                         obfuscated = maxObfuscate(srcCode); // max

        await deliverResult(interaction, srcCode, obfuscated, mode.toUpperCase());
    } catch (err) {
        console.error(err);
        await interaction.editReply({ content: `❌ Error during obfuscation: ${err.message}` });
    }
}

// ─── Custom mode UI ───────────────────────────────────────────

async function showCustomMenu(interaction, srcCode) {
    const sessionId = interaction.user.id + '_' + Date.now();
    userSessions.set(sessionId, { code: srcCode, selected: new Set(), user: interaction.user.id });

    const half = Math.ceil(CUSTOM_TECHNIQUES.length / 2);
    const group1 = CUSTOM_TECHNIQUES.slice(0, half);
    const group2 = CUSTOM_TECHNIQUES.slice(half);

    const menu1 = new StringSelectMenuBuilder()
        .setCustomId(`sel1_${sessionId}`)
        .setPlaceholder('Extreme techniques (group 1) — select one or more')
        .setMinValues(0)
        .setMaxValues(group1.length)
        .addOptions(group1.map(t =>
            new StringSelectMenuOptionBuilder()
                .setLabel(t.label.slice(0, 100))
                .setValue(t.id)
                .setDescription(t.desc.slice(0, 100))
        ));

    const menu2 = new StringSelectMenuBuilder()
        .setCustomId(`sel2_${sessionId}`)
        .setPlaceholder('Extreme techniques (group 2) — select one or more')
        .setMinValues(0)
        .setMaxValues(group2.length)
        .addOptions(group2.map(t =>
            new StringSelectMenuOptionBuilder()
                .setLabel(t.label.slice(0, 100))
                .setValue(t.id)
                .setDescription(t.desc.slice(0, 100))
        ));

    const obfBtn = new ButtonBuilder()
        .setCustomId(`obfuscate_${sessionId}`)
        .setLabel('💀 Obfuscate now')
        .setStyle(ButtonStyle.Danger);

    const statusBtn = new ButtonBuilder()
        .setCustomId(`status_${sessionId}`)
        .setLabel('View selection')
        .setStyle(ButtonStyle.Secondary);

    const allBtn = new ButtonBuilder()
        .setCustomId(`all_${sessionId}`)
        .setLabel('Select all')
        .setStyle(ButtonStyle.Primary);

    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('💀 Custom Obfuscation — Extreme Techniques')
        .setDescription(
            'Select the techniques you want to apply from the menus below.\n' +
            'Then press **💀 Obfuscate now**.\n\n' +
            '> ⚠️ Combining every technique produces very heavy output.'
        )
        .addFields(
            { name: 'Group 1', value: group1.map(t => `\`${t.id}\``).join(', '), inline: false },
            { name: 'Group 2', value: group2.map(t => `\`${t.id}\``).join(', '), inline: false },
        )
        .setFooter({ text: 'Only you can see this message • Session: ' + sessionId.slice(-6) });

    await interaction.reply({
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(menu1),
            new ActionRowBuilder().addComponents(menu2),
            new ActionRowBuilder().addComponents(obfBtn, statusBtn, allBtn),
        ],
        ephemeral: true,
    });
}

// ─── Select menu interactions ─────────────────────────────────

async function handleSelectMenuInteraction(interaction) {
    const parts = interaction.customId.split('_');
    const group = parts[0]; // "sel1" or "sel2"
    const sessionId = parts.slice(1).join('_');

    const session = userSessions.get(sessionId);
    if (!session || session.user !== interaction.user.id) {
        await interaction.reply({ content: '❌ This is not your session.', ephemeral: true });
        return;
    }

    const half = Math.ceil(CUSTOM_TECHNIQUES.length / 2);
    const groupIds = group === 'sel1'
        ? CUSTOM_TECHNIQUES.slice(0, half).map(t => t.id)
        : CUSTOM_TECHNIQUES.slice(half).map(t => t.id);

    groupIds.forEach(id => session.selected.delete(id));
    interaction.values.forEach(id => session.selected.add(id));

    await interaction.deferUpdate();
}

// ─── Button interactions ──────────────────────────────────────

async function handleButtonInteraction(interaction) {
    const parts = interaction.customId.split('_');
    const action = parts[0];
    const sessionId = parts.slice(1).join('_');

    const session = userSessions.get(sessionId);
    if (!session || session.user !== interaction.user.id) {
        await interaction.reply({ content: '❌ This is not your session.', ephemeral: true });
        return;
    }

    if (action === 'status') {
        const list = session.selected.size > 0
            ? [...session.selected].join(', ')
            : 'None selected';
        const embed = new EmbedBuilder()
            .setColor(0x2f3136)
            .setTitle('Selected techniques')
            .setDescription(`\`\`\`${list}\`\`\``);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    if (action === 'all') {
        CUSTOM_TECHNIQUES.forEach(t => session.selected.add(t.id));
        await interaction.reply({
            content: `✅ All techniques selected (${session.selected.size})`,
            ephemeral: true,
        });
        return;
    }

    if (action === 'obfuscate') {
        if (session.selected.size === 0) {
            await interaction.reply({
                content: '❌ You have not selected any technique.',
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply({ ephemeral: true });
        try {
            const obfuscated = customObfuscate(session.code, [...session.selected]);
            const techs = [...session.selected].join(', ');
            await deliverResult(interaction, session.code, obfuscated, `CUSTOM [${techs}]`);
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: `❌ Error: ${err.message}` });
        }

        userSessions.delete(sessionId);
    }
}

// ─── Deliver obfuscated result ────────────────────────────────

async function deliverResult(interaction, original, obfuscated, modeLabel) {
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
        .setTitle('✅ Code Obfuscated')
        .addFields(
            { name: 'Mode', value: modeLabel, inline: false },
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
        .setTitle('✅ Obfuscation completed')
        .setDescription(`${interaction.user}, check your DMs. File is also attached here.`);

    await interaction.editReply({
        embeds: [channelEmbed],
        files: [new AttachmentBuilder(fileBuffer, { name: 'obfuscated.lua' })],
    });
}

// ─── /upload handler ──────────────────────────────────────────

async function handleUpload(interaction) {
    const code = interaction.options.getString('code');
    const file = interaction.options.getAttachment('file');

    if (!code && !file) {
        await interaction.reply({ content: '❌ Please provide code or a file.', ephemeral: true });
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
            .setTitle('📋 Uploaded to Pastefy')
            .addFields({ name: 'URL', value: data.url || data.id || 'N/A' });
        await interaction.editReply({ embeds: [embed] });
    } catch (err) {
        await interaction.editReply({ content: `❌ Upload failed: ${err.message}` });
    }
}

// ─── Pastefy upload ───────────────────────────────────────────

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

// ─── Start ────────────────────────────────────────────────────

client.login(process.env.TOKEN);
