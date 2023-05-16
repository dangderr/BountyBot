const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('follow_respawn_timers')
    .setDescription('Get notifications when blaze, events, and soulhounds are about to spawn.');

async function execute(interaction) {
    const user = interaction.User;

    if (user.follow_respawn_timers) {
        interaction.reply('No more cat facts for you.');
    } else {
        interaction.reply('You are now subscribed to cat facts!');
    }

    user.follow_respawn_timers = !user.follow_respawn_timers;
}

module.exports = {
    data,
    execute
};