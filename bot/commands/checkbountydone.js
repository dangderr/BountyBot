const { SlashCommandBuilder } = require('discord.js');
const db_access = require('../../database/db_access.js');
const datetime_methods = require('../../utils/datetime_methods.js');

const data = new SlashCommandBuilder()
    .setName('checkbountydone')
    .setDescription('Ugh, can I stop pasting bounties?');

async function execute(interaction) {
    let db = interaction.client.db;

    if (!(await db_access.check_user_is_in_db(db, interaction.user.id))) {
        await db_access.add_user(db, interaction.user.id, interaction.user.username, null);
    }

    const bountydone_arr = await db_access.get_bountydone(db);

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

    const notdone_names = await db_access.get_usernames(db, notdone);
    interaction.reply(notdone_names.join(', ') + " are still slacking off!");
}

module.exports = {
    data,
    execute
};