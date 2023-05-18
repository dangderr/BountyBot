const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('add_herb')
    .setDescription('Add an herb to your restart button list')
    .addStringOption(option => option
        .setName('herb')
        .setDescription('Enter the herb name EXACTLY as it is in-game')
        .setRequired(true)
    );

async function execute(interaction) {
    const channel = interaction.Channel;

    if ((channel.server != 'drip' || channel.name != 'spit-bot') && channel.server != 'testserver') {
        interaction.reply('Please keep bot spam in #spit-bot channel');
        return;
    }

    const user = interaction.User;
    const herb = interaction.options.getString('herb');

    if (!interaction.client.herbs.map(i => i[0]).includes(herb)) {
        interaction.reply('The herb you entered did not match anything in my database.')
        return;
    }

    if (user.herbs.includes(herb)) {
        user.delete_herb(herb);
        interaction.reply(`${herb} was removed from your list of herbs.`);
    } else {
        user.herbs = herb;
        interaction.reply(`${herb} was added to your list of herbs.`);
    }

}

module.exports = {
    data,
    execute
};