const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

const allowed_users = [
    'Hiro',
    'Athena',
    'Chronos'
]


const data = new SlashCommandBuilder()
    .setName('spam_ping_button')
    .setDescription('Creates a button to make it easy to spam someone')
    .addStringOption(option => option
        .setName('name')
        .setDescription('Who deserves the spam?')
        .addChoices(...allowed_users.map(i => ({ name: i, value: i })))
        .setRequired(true)
    )

async function execute(interaction) {
    const channel = interaction.Channel;

    if ((channel.server != 'drip' || channel.name != 'raids') && channel.server != 'testserver') {
        interaction.reply('Please keep abuse to the #raids channel');
        return;
    }

    const username = interaction.options.getString('name');
    const user = interaction.client.Users.get_user_by_drip_username(username);

    const content = ``;
    const components = create_components(username);
    const bot_message = await interaction.reply({ content: content, components: components, fetchReply: true });

    create_component_collector(bot_message, interaction.client.PingController, user);
}

function create_components(username) {
    return new Array(
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('spam_' + username)
                    .setLabel('Spam ' + username)
                    .setStyle(ButtonStyle.Danger)
            )
        );
}

async function create_component_collector(bot_message, ping_controller, user) {
    const MAX_COMPONENT_TIME = 1000 * 60 * 15;
    const collector = bot_message.createMessageComponentCollector({
        time: MAX_COMPONENT_TIME,
        componentType: ComponentType.Button
    })

    const content = `WAKE UP ` + user.drip_username.toUpperCase();

    collector.on('collect', async i => {
        ping_controller.add_ping(user.discord_id, null, bot_message.channel.id, null, content, 'spam', null, null);
        await i.update({ content: '' });
    });

    collector.on('end', collector => {
        bot_message.edit({ content: 'Timer has expired.', components: [] });
    });
}

module.exports = {
    data,
    execute
};