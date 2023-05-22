const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('check_bounty_done')
    .setDescription('Ugh, can I stop pasting bounties?');

async function execute(interaction) {
    const bounty_not_done_arr = await interaction.client.Users.get_bounty_not_done();

    if (bounty_not_done_arr.length == 0) {
        interaction.reply('Everyone is done with bounties today!');
        return;
    }

    interaction.reply(bounty_not_done_arr.join(', ') + ' ' + (bounty_not_done_arr.length > 1 ? 'are' : 'is') + ' still slacking off!');
}

module.exports = {
    data,
    execute
};