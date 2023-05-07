const { SlashCommandBuilder } = require('discord.js');
const db_access = require('../../database/db_access.js');
const datetime_methods = require('../../utils/datetime_methods.js');

const data = new SlashCommandBuilder()
    .setName('bountydone')
    .setDescription('Stops bounty notifications for the rest of the day, or reactivates them if already paused');

async function execute(interaction) {
    let db = interaction.client.db;

    if (!(await db_access.check_user_is_in_db(db, interaction.user.id))) {
        await db_access.add_user(db, interaction.user.id, interaction.user.username, null);
    }

    let current_time = new Date();
    let bountydone_timestamp = await db_access.get_bountydone(db, interaction.user.id);
    let bountydone = bountydone_timestamp ? new Date(bountydone_timestamp) : null;

    if (datetime_methods.check_same_day(current_time, bountydone)) {
        db_access.set_bountydone(db, interaction.user.id, null);
        interaction.reply('Your bounty notifications are now unpaused for the day');
    } else {
        db_access.set_bountydone(db, interaction.user.id, current_time.toISOString());
        interaction.reply('Your bounty notifications will be paused for the rest of the game day');
    }
}

module.exports = {
    data,
    execute
};