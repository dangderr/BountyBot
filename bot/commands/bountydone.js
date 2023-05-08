const { SlashCommandBuilder } = require('discord.js');
const datetime_methods = require('../../utils/datetime_methods.js');

const data = new SlashCommandBuilder()
    .setName('bountydone')
    .setDescription('Stops bounty notifications for the rest of the day, or reactivates them if already paused');

async function execute(interaction) {
    const db = interaction.client.drip_db;
    const user = interaction.user;
    await db.add_user(user.id, user.username, null);

    let current_time = new Date();
    let bountydone_obj = await db.get_bountydone(user.id);
    let bountydone = bountydone_obj ? new Date(bountydone_obj.bountydone) : null;

    if (datetime_methods.check_same_day(current_time, bountydone)) {
        db.set_bountydone(user.id, null);
        interaction.reply('Your bounty notifications are now unpaused for the day');
    } else {
        db.set_bountydone(user.id, current_time.toISOString());
        interaction.reply('Your bounty notifications will be paused for the rest of the game day');
    }
}

module.exports = {
    data,
    execute
};