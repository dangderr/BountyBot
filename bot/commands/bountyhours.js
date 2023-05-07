const { SlashCommandBuilder } = require('discord.js');
const db_access = require('../../database/db_access.js');
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
    const starttime = interaction.options.getString('start_time');
    const endtime = interaction.options.getString('end_time');

    try {
        const time_arr = datetime_methods.parse_starttime_endtime(starttime, endtime);
        if (!time_arr) {
            interaction.reply({ content: 'Time was invalid', ephemeral: true });
            return;
        }

        await db_access.set_active_hours(interaction.client.db, interaction.user.id, starttime, endtime);

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