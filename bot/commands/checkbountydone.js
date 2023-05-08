const { SlashCommandBuilder } = require('discord.js');
const datetime_methods = require('../../utils/datetime_methods.js');

const data = new SlashCommandBuilder()
    .setName('checkbountydone')
    .setDescription('Ugh, can I stop pasting bounties?');

async function execute(interaction) {
    const db = interaction.client.drip_db;
    const user = interaction.user;
    await db.add_user(user.id, user.username, null);

    const bountydone_arr = await db.get_bountydone();

    let current_time = new Date();
    let notdone = new Array();

    for (let row of bountydone_arr) {
        if (!datetime_methods.check_same_day(current_time, row.bountydone)) {
            notdone.push(row.discord_id);
        }
    }

    if (notdone.length == 0) {
        interaction.reply('Everyone is done with bounties today!');
        return;
    }

    const notdone_names = (await db.get_usernames(notdone)).map(i => i.drip_username ?? i.discord_username );
    interaction.reply(notdone_names.join(', ') + " are still slacking off!");
}

module.exports = {
    data,
    execute
};