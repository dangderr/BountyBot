const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('game_time_to_chronos_time')
    .setDescription('Yes, only to chronos time. No, I cannot implement Hiro time or Make time.')
    .addStringOption(option => option
        .setName('time_str')
        .setDescription('HH:MM format')
        .setRequired(true)
    );

async function execute(interaction) {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const time_str = interaction.options.getString('time_str');
    if (!time_str.match(regex)) {
        fail_reply(interaction);
        return;
    }

    try {
        const time_arr = time_str.split(':');
        const hr = parseInt(time_arr[0]);
        const min = parseInt(time_arr[1]);
        
        const utcDate = new Date();
        utcDate.setUTCHours(hr);
        utcDate.setUTCMinutes(min);
        utcDate.setUTCSeconds(0);
        utcDate.setUTCMilliseconds(0);

        let utc_str = utcDate.toUTCString().split(' ');
        utc_str = utc_str[utc_str.length - 2];
        utc_str = utc_str.substring(0, utc_str.length - 3);

        let chronos_str = utcDate.toLocaleTimeString();
        const chronos_str_arr = chronos_str.split(':');
        chronos_str = chronos_str_arr[0] + ':' + chronos_str_arr[1];
        chronos_str += ' ' + chronos_str_arr[2].substring(chronos_str_arr[2].length - 2, chronos_str_arr[2].length);

        const content = utc_str + ' UTC is ' + chronos_str + ' Chronos time';
        interaction.reply(content);
    }
    catch (err) {
        fail_reply(interaction);
    }
}

function fail_reply(interaction) {
    interaction.reply({
        content: 'HH:MM format, you dolt',
        ephemeral: true
    });
}

module.exports = {
    data,
    execute
};