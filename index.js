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

// ─── Slash command registration ───────────────────────────────

async function registerCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('obf')
            .setDescription('Obfusca tu código Lua')
            .addStringOption(opt =>
                opt.setName('mode')
                    .setDescription('Nivel de obfuscación')
                    .setRequired(true)
                    .addChoices(
                        { name: '🟢 Normal  — Baja/Media agresividad',    value: 'normal' },
                        { name: '🔴 Hard    — Alta agresividad',          value: 'hard'   },
                        { name: '💀 Max     — Extrema (todas las técnicas)', value: 'max' },
                        { name: '⚙️  Custom  — Elige técnicas extremas',  value: 'custom' },
                    ))
            .addStringOption(opt =>
                opt.setName('code')
                    .setDescription('Código Lua a obfuscar')
                    .setRequired(false))
            .addAttachmentOption(opt =>
                opt.setName('file')
                    .setDescription('Archivo .lua a obfuscar')
                    .setRequired(false)),

        new SlashCommandBuilder()
            .setName('upload')
            .setDescription('Sube código a Pastefy')
            .addStringOption(opt =>
                opt.setName('code').setDescription('Código a subir').setRequired(false))
            .addAttachmentOption(opt =>
                opt.setName('file').setDescription('Archivo a subir').setRequired(false)),
    ];

    try {
        await client.application.commands.set(commands);
        console.log('Comandos registrados correctamente');
    } catch (err) {
        console.error('Error al registrar comandos:', err);
    }
}

// ─── Custom mode: all 💀 extreme techniques ───────────────────

const CUSTOM_TECHNIQUES = [
    { id: 'chaotic_rename',   label: '💀 Renombrado caótico',       desc: 'Nombres hasta 20 chars, mezcla aleatoria' },
    { id: 'obf_strings',      label: '💀 Ofuscación de strings',     desc: 'Todos los strings → string.char()' },
    { id: 'extreme_math',     label: '💀 Matemáticas extremas',      desc: '8-10 operaciones anidadas' },
    { id: 'extreme_mba',      label: '💀 MBA extremo',               desc: 'Mixed Boolean Arithmetic' },
    { id: 'obf_booleans',     label: '💀 Ofuscar booleanos',         desc: 'true→(1==1), false→(1==0)' },
    { id: 'obf_nil',          label: '💀 Ofuscar nil',               desc: 'nil→(function() end)()' },
    { id: 'massive_junk',     label: '💀 Junk masivo',               desc: '500-800 líneas de basura' },
    { id: 'ultra_cff',        label: '💀 CFF ultracomplejo',         desc: 'Estados anidados con condiciones falsas' },
    { id: 'recursive_vm',     label: '💀 VM recursiva (50-80 capas)', desc: 'VM frágil con verificación' },
    { id: 'polymorphic_vm',   label: '💀 VM polimórfica',            desc: 'Estructura diferente en cada ejecución' },
    { id: 'full_antidebug',   label: '💀 Anti-debug completo',       desc: 'Todas las técnicas anti-debug' },
    { id: 'total_antihook',   label: '💀 Anti-hook total',           desc: 'Hook en todas las funciones nativas' },
    { id: 'anti_getlocal',    label: '💀 Anti-getlocal',             desc: 'Bloquea debug.getlocal/setlocal' },
    { id: 'anti_getinfo',     label: '💀 Anti-getinfo',              desc: 'Bloquea debug.getinfo' },
    { id: 'anti_stacktrace',  label: '💀 Anti-stacktrace',           desc: 'Ofusca stack traces' },
    { id: 'anti_timing',      label: '💀 Anti-timing extremo',       desc: 'Timeouts 5-7 segundos estrictos' },
    { id: 'anti_profile',     label: '💀 Anti-profile',              desc: 'Previene profiling y análisis' },
    { id: 'anti_print',       label: '💀 Anti-print/rconsole',       desc: 'Bloquea print, warn, rconsole' },
    { id: 'executor_detect',  label: '💀 Detección de ejecutores',   desc: 'Synapse, KRNL, ScriptWare…' },
    { id: 'checksum',         label: '💀 Checksum (MD5 simulado)',    desc: 'Autoverificación de integridad' },
    { id: 'auto_restore',     label: '💀 Auto-restauración',         desc: 'Detección de modificaciones' },
    { id: 'integrity_checks', label: '💀 8 checks de integridad',    desc: 'Verificación de funciones nativas' },
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
        await interaction.reply({ content: '❌ Proporciona código o un archivo .lua', ephemeral: true });
        return;
    }

    let srcCode = code || '';
    if (file) {
        try {
            const res = await axios.get(file.url);
            srcCode = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
        } catch (e) {
            await interaction.reply({ content: `❌ No se pudo descargar el archivo: ${e.message}`, ephemeral: true });
            return;
        }
    }

    if (mode === 'custom') {
        return showCustomMenu(interaction, srcCode);
    }

    // Normal / Hard / Max
    await interaction.deferReply({ ephemeral: true });
    try {
        let obfuscated;
        if (mode === 'normal') {
            obfuscated = normalObfuscate(srcCode);
        } else if (mode === 'hard') {
            obfuscated = hardObfuscate(srcCode);
        } else {
            // max — all 💀 techniques
            obfuscated = maxObfuscate(srcCode);
        }

        await deliverResult(interaction, srcCode, obfuscated, mode.toUpperCase());
    } catch (err) {
        console.error(err);
        await interaction.editReply({ content: `❌ Error durante la obfuscación: ${err.message}` });
    }
}

// ─── Custom mode UI ───────────────────────────────────────────

async function showCustomMenu(interaction, srcCode) {
    const sessionId = interaction.user.id + '_' + Date.now();
    userSessions.set(sessionId, { code: srcCode, selected: new Set(), user: interaction.user.id });

    // Split 22 techniques into pages of 5 (select menu max options = 25, but we do 5 per row with buttons)
    // Use two select menus (max 25 options each)
    const half = Math.ceil(CUSTOM_TECHNIQUES.length / 2);
    const group1 = CUSTOM_TECHNIQUES.slice(0, half);
    const group2 = CUSTOM_TECHNIQUES.slice(half);

    const menu1 = new StringSelectMenuBuilder()
        .setCustomId(`sel1_${sessionId}`)
        .setPlaceholder('Técnicas extremas (grupo 1) — selecciona una o varias')
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
        .setPlaceholder('Técnicas extremas (grupo 2) — selecciona una o varias')
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
        .setLabel('💀 Obfuscar ahora')
        .setStyle(ButtonStyle.Danger);

    const statusBtn = new ButtonBuilder()
        .setCustomId(`status_${sessionId}`)
        .setLabel('Ver selección')
        .setStyle(ButtonStyle.Secondary);

    const allBtn = new ButtonBuilder()
        .setCustomId(`all_${sessionId}`)
        .setLabel('Seleccionar todo')
        .setStyle(ButtonStyle.Primary);

    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('💀 Obfuscación Custom — Técnicas Extremas')
        .setDescription(
            'Selecciona las técnicas que quieres aplicar desde los menús de abajo.\n' +
            'Luego pulsa **💀 Obfuscar ahora**.\n\n' +
            '> ⚠️ Combinar todas las técnicas produce código muy pesado.'
        )
        .addFields(
            { name: 'Grupo 1', value: group1.map(t => `\`${t.id}\``).join(', '), inline: false },
            { name: 'Grupo 2', value: group2.map(t => `\`${t.id}\``).join(', '), inline: false },
        )
        .setFooter({ text: 'Solo tú puedes ver este mensaje • Sesión: ' + sessionId.slice(-6) });

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
        await interaction.reply({ content: '❌ Esta sesión no es tuya.', ephemeral: true });
        return;
    }

    // Update selected set: clear previous from this group then add new
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
        await interaction.reply({ content: '❌ Esta sesión no es tuya.', ephemeral: true });
        return;
    }

    if (action === 'status') {
        const list = session.selected.size > 0
            ? [...session.selected].join(', ')
            : 'Ninguna seleccionada';
        const embed = new EmbedBuilder()
            .setColor(0x2f3136)
            .setTitle('Técnicas seleccionadas')
            .setDescription(`\`\`\`${list}\`\`\``);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    if (action === 'all') {
        CUSTOM_TECHNIQUES.forEach(t => session.selected.add(t.id));
        await interaction.reply({
            content: `✅ Todas las técnicas seleccionadas (${session.selected.size})`,
            ephemeral: true,
        });
        return;
    }

    if (action === 'obfuscate') {
        if (session.selected.size === 0) {
            await interaction.reply({
                content: '❌ No has seleccionado ninguna técnica.',
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
        .setTitle('✅ Código Obfuscado')
        .addFields(
            { name: 'Modo',        value: modeLabel,                                          inline: false },
            { name: 'Pastefy',     value: pasteUrl,                                           inline: false },
            { name: 'Tamaño',      value: `Original: ${original.length} bytes\nObfuscado: ${obfuscated.length} bytes`, inline: false },
        );

    try {
        await interaction.user.send({ embeds: [dmEmbed], files: [attachment] });
    } catch (_) {
        // DMs might be closed — fall back to reply attachment
    }

    const channelEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Obfuscación completada')
        .setDescription(`${interaction.user}, revisa tus DMs. Se adjunta el archivo aquí también.`);

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
        await interaction.reply({ content: '❌ Proporciona código o un archivo', ephemeral: true });
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
            .setTitle('📋 Subido a Pastefy')
            .addFields({ name: 'URL', value: data.url || data.id || 'N/A' });
        await interaction.editReply({ embeds: [embed] });
    } catch (err) {
        await interaction.editReply({ content: `❌ Error al subir: ${err.message}` });
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
