const { SlashCommandBuilder } = require('discord.js');

const settings = [
    'Sickle',
    'Muscipula'
]

function create_slash_command() {
    return new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Set some user settings')
        .addStringOption(option =>
            option.setName('key')
                .setDescription('Enter the setting you want to change')
                .setRequired(true)
                .addChoices(...settings.map(i => ({ name: i, value: i })))
        )
        .addIntegerOption(option => option
            .setName('integer_value')
            .setDescription('Enter the value, percentage, whatever')
        )
}

async function execute(interaction) {
    const channel = interaction.Channel;
    if ((channel.server != 'drip' || channel.name != 'spit-bot') && channel.server != 'testserver') {
        interaction.reply('Please keep bot spam in #spit-bot channel');
        return;
    }

    const key = interaction.options.getString('key')

    if (!settings.includes(key)) {
        await interaction.reply(`Invalid setting`);
    }

    const user = interaction.User;
    const int_value = interaction.options.getInteger('integer_value');
    const str_value = ''; //interaction.options.getString('str_value');

    const content = set_setting(user, key, int_value, str_value);

    interaction.reply(content);
}

function set_setting(user, key, int_value, str_value) {
    switch (key) {
        case 'Sickle':
            if (!int_value) {
                return `You have to set a number... idjit`;
            } else if (int_value < 0 || int_value > 99) {
                return `You have to set a REASONABLE number... idjit`;
            }
            user.update_user_setting(key, int_value);
            return `${key} set to ${int_value}%`;
        case 'Muscipula':
            const new_value = user.get_user_setting('Muscipula') !== 'true';
            user.update_user_setting(key, new_value);
            return `${key} set to ${new_value}`;
    }
}


const data = create_slash_command();

module.exports = {
    data,
    execute
};