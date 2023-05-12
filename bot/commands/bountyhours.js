const { SlashCommandBuilder } = require('discord.js');
const datetime_methods = require('../../utils/datetime_methods.js');

const data = (new SlashCommandBuilder()
    .setName('bountyhours')
    .setDescription('Set active hours to receive bounty pings')
    .addStringOption(option => option
        .setName('start_time')
        .setDescription('Time (UTC or game time) in hh:mm format to start receiving pings')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('end_time')
        .setDescription('Time (UTC or game time) in hh:mm format to stop receiving pings')
        .setRequired(true)
    )
)

async function execute(interaction) {
    const user = await interaction.client.Users.add_user(interaction.user);

    const starttime = interaction.options.getString('start_time');
    const endtime = interaction.options.getString('end_time');

    try {
        const time_arr = datetime_methods.parse_starttime_endtime(starttime, endtime);
        if (!time_arr) {
            interaction.reply({ content: 'Time was invalid', ephemeral: true });
            return;
        }

        user.set_active_hours(starttime, endtime);

        let str = 'Bounty active hours set to ' + starttime + " until " + endtime;
        interaction.reply(str);
    }
    catch (err) {
        interaction.reply({ content: 'Time was invalid', ephemeral: true });
    }
}

module.exports = {
    data,
    execute
};