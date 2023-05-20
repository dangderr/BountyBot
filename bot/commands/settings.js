const { SlashCommandBuilder } = require('discord.js');

const settings_toggles = [
    'Pause_Notifications',
    'Follow_Respawn_Timers'
]

const settings_spirits = [
    'Muscipula',
    'Dreagle',
    'Bat'
]

const settings_class = [
    'Assassin',
    'Mage',
    'Rogue',
    'Barbarian',
    'Cleric',
    'Dark_Elf'
]

const settings_skills = [
    'Combat',
    'Slayer',
    'Summoning',
    'Jewelcrafting',
    'Magic',
    'Mining',
    'Blacksmithing',
    'Fishing',
    'Cooking',
    'Hunter',
    'Crafting',
    'Woodworking',
    'Herbalism',
    'Alchemy',
    'Exploration',
    'Beastmastery'
]

const settings_pets = [
    'Crow',
    'Cat',
    'Owl',
    'Woodchipper',
    'Oozy',
    'Robert',
    'Lochy',
    'Wolf',
    'Phoenix',
    'Imp',
    'Mimic',
    'Drake',
    'Hollowhead',
    'Icicle',
    'Kaiju',
    'Wyrm'
]

const settings_tools = [
    'Bow',
    'Pickaxe',
    'Sickle',
    'Axe',
    'Hook'
]

function create_slash_command() {
    return new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Set some user settings')
        .addSubcommand(subcommand => subcommand
            .setName('toggles')
            .setDescription('A few random settings to toggle on/off')
            .addStringOption(option => option
                .setName('name')
                .setDescription('Choose a setting')
                .setRequired(true)
                .addChoices(...settings_toggles.map(i => ({ name: i, value: i })))
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('spirits')
            .setDescription('Toggle spirits on/off')
            .addStringOption(option => option
                .setName('name')
                .setDescription('Choose which spirit')
                .setRequired(true)
                .addChoices(...settings_spirits.map(i => ({ name: i, value: i })))
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('class')
            .setDescription('Set your class')
            .addStringOption(option => option
                .setName('name')
                .setDescription('Select a class')
                .setRequired(true)
                .addChoices(...settings_class.map(i => ({ name: i, value: i })))
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('skills')
            .setDescription('Set the level of your skills')
            .addStringOption(option => option
                .setName('name')
                .setDescription('Select a skill')
                .setRequired(true)
                .addChoices(...settings_skills.map(i => ({ name: i, value: i })))
            )
            .addIntegerOption(option => option
                .setName('level')
                .setDescription('Enter your level')
                .setMinValue(0)
                .setMaxValue(200)
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('pets')
            .setDescription('Set the level of your skills')
            .addStringOption(option => option
                .setName('name')
                .setDescription('Select a pet')
                .setRequired(true)
                .addChoices(...settings_pets.map(i => ({ name: i, value: i })))
            )
            .addIntegerOption(option => option
                .setName('level')
                .setDescription('Enter the pet level')
                .setMinValue(0)
                .setMaxValue(200)
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('tools')
            .setDescription('Set the % of your tools')
            .addStringOption(option => option
                .setName('name')
                .setDescription('Select a tool')
                .setRequired(true)
                .addChoices(...settings_tools.map(i => ({ name: i, value: i })))
            )
            .addIntegerOption(option => option
                .setName('percent')
                .setDescription('Enter the percentage as an integer (e.g. 6 for 6%)')
                .setMinValue(0)
                .setMaxValue(99)
                .setRequired(true)
            )
        )
}

async function execute(interaction) {
    const channel = interaction.Channel;
    if ((channel.server != 'drip' || channel.name != 'spit-bot') && channel.server != 'testserver') {
        interaction.reply('Please keep bot spam in #spit-bot channel');
        return;
    }

    const content = set_setting(interaction.User, interaction.options);

    interaction.reply(content);
}

function set_setting(user, options) {
    const name = options.getString('name');
    const subcommand = options.getSubcommand();

    switch (subcommand) {
        case 'spirits':
        case 'toggles':
            const new_value = user.get_user_setting(name) !== 'true';
            user.update_user_setting(name, new_value);
            return `${name} set to ${new_value}`;
        case 'class':
            user.update_user_setting('Class', name);
            return `Class set to ${name}`;
        case 'skills':
        case 'pets':
            const level = options.getInteger('level');
            user.update_user_setting(name, level);
            return `${name} set to ${level}`;
        case 'tools':
            const percent = options.getInteger('percent');
            user.update_user_setting(name, percent);
            return `${name} set to ${percent}%`;
        default: return;
    }
}

const data = create_slash_command();

module.exports = {
    data,
    execute
};