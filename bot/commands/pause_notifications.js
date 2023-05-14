const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('pause_notifications')
    .setDescription('Pause all your notifications until you unpause them.');

async function execute(interaction) {
    const user = interaction.User;

    if (user.pause_notifications) {
        interaction.reply('Your pings are unpaused.');
    } else {
        interaction.reply('Your pings are paused.');
    }

    user.pause_notifications = !user.pause_notifications;
}

module.exports = {
    data,
    execute
};