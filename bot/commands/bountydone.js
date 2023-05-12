const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('bountydone')
    .setDescription('Stops bounty notifications for the rest of the day, or reactivates them if already paused');

async function execute(interaction) {
    const user = await interaction.client.Users.add_user(interaction.user);

    if (user.bountydone) {
        interaction.reply('Your bounty notifications are now unpaused for the day');
    } else {
        interaction.reply('Your bounty notifications will be paused for the rest of the game day');
    }

    user.bountydone = Date.now();
}

module.exports = {
    data,
    execute
};