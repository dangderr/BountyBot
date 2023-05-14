const { SlashCommandBuilder } = require('discord.js');

const data = (new SlashCommandBuilder()
    .setName('bounty_hours')
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
    const user = interaction.User;

    const starttime = interaction.options.getString('start_time');
    const endtime = interaction.options.getString('end_time');

    try {
        if (!validate_times(starttime, endtime)) {
            throw new Error('');
        }

        user.set_active_hours(starttime, endtime);

        let str = 'Bounty active hours set to ' + starttime + " until " + endtime;
        interaction.reply(str);
    }
    catch (err) {
        interaction.reply({ content: 'Time was invalid', ephemeral: true });
    }
}

function validate_times(starttime, endtime) {
    if (starttime.length > 5 || endtime.length > 5) {
        return false;
    }

    startarr = starttime.split(":");
    endarr = endtime.split(":");

    if (startarr.length != 2 || endarr.length != 2) {
        return false;
    }

    starthour = parseInt(startarr[0]);
    startminutes = parseInt(startarr[1]);
    endhour = parseInt(endarr[0]);
    endminutes = parseInt(endarr[1]);

    if (starthour < 0 || starthour > 23 ||
        endhour < 0 || endhour > 23 ||
        startminutes < 0 || startminutes > 59 ||
        endminutes < 0 || endminutes > 59
    ) {
        return false;
    }

    return true;
}

module.exports = {
    data,
    execute
};