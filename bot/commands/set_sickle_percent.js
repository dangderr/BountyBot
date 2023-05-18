const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('set_sickle_percent')
    .setDescription('Set your sickle %')
    .addIntegerOption(option => option
        .setName('percentage')
        .setDescription('Enter the percent as an integer (e.g. 6 for 6%)')
        .setRequired(true)
    );

async function execute(interaction) {
    const user = interaction.User;
    const percent = interaction.options.getInteger('percentage');
    user.sickle = percent;

    interaction.reply(`Sickle percent set to ${percent}%`);
}

module.exports = {
    data,
    execute
};