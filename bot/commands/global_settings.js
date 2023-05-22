const { SlashCommandBuilder } = require('discord.js');

const settings = [
    'Herb_Tile',
    'Pet_Tile',
]

function create_slash_command() {
    return new SlashCommandBuilder()
        .setName('global_settings')
        .setDescription('Set global settings for everyone')
        .addStringOption(option =>
            option.setName('key')
                .setDescription('Enter the setting you want to change')
                .setRequired(true)
                .addChoices(...settings.map(i => ({ name: i, value: i })))
        )
        /*.addIntegerOption(option => option
            .setName('integer_value')
            .setDescription('Enter the value, percentage, whatever')
        )*/
}

async function execute(interaction) {
    const globals = interaction.client.GlobalSettings;
    const key = interaction.options.getString('key')

    if (!settings.includes(key)) {
        await interaction.reply(`Invalid setting`);
    }

    const int_value = ''; //interaction.options.getInteger('integer_value');
    const str_value = ''; //interaction.options.getString('str_value');

    const content = set_setting(globals, key, int_value, str_value);

    interaction.reply(content);
}

function set_setting(globals, key, int_value, str_value) {
    switch (key) {
        //========================
        //      True / False
        //========================
        case 'Herb_Tile':
        case 'Pet_Tile':
            const new_value = globals.get_global_setting(key) !== 'true';
            globals.update_global_setting(key, new_value);
            return `${key} set to ${new_value}`;
    }
}

const data = create_slash_command();

module.exports = {
    data,
    execute
};