const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('bounty_done')
    .setDescription('Stops bounty notifications for the rest of the day, or reactivates them if already paused');

async function execute(interaction) {
    const user = interaction.User;

    if (user.bounty_done) {
        interaction.reply('Your bounty notifications are now unpaused for the day');
    } else {
        interaction.reply('Your bounty notifications will be paused for the rest of the game day');
    }

    user.bounty_done = Date.now();
}

module.exports = {
    data,
    execute
};