const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ComponentType, ActionRowBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('add_herb')
    .setDescription('Add an herb to your restart button list')
    .addStringOption(option => option
        .setName('tier')
        .setDescription('Choose herb tier')
        .setRequired(true)
        .addChoices(
            { name: 'Mana', value: 'Mana' },
            { name: 'Weak', value: 'Weak' },
            { name: 'Normal', value: 'Normal' },
            { name: 'Strong', value: 'Strong' },
            { name: 'Powerful', value: 'Powerful' },
            { name: 'Divine', value: 'Divine' },
            { name: 'Demonic', value: 'Demonic' }
        )
    );

async function execute(interaction) {
    const user = interaction.User;

    const tier = interaction.options.getString('tier');
    const herb_menu_list = interaction.client.Data.herbs.filter(i => i[2] == tier).map(i => i[0]);

    const herb_option_arr = get_herb_options(herb_menu_list, user);
    const component = create_component(herb_option_arr);

    const content = 'Select your herbs';

    const bot_message = await interaction.reply({ content: content, components: component })

    create_collector(user, bot_message, herb_menu_list);
}

async function create_collector(user, bot_message, herb_menu_list) {
    const filter = i => i.user.id === user.discord_id;
    try {
        const i = await bot_message.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.SelectMenu,
            time: 60000
        });

        const result = await user.update_herbs(i.values, herb_menu_list);

        let content = '';
        if (result[0].length > 0) {
            content += result[0].join(', ');
            content += ' added to list. '
        }
        if (result[1].length > 0) {
            content += result[1].join(', ');
            content += ' removed from list. '
        }
        if (content == '') {
            content = 'No changes were made.'
        }

        await i.update({ content: content, components: [] });
    } catch (err) {
        await bot_message.edit({ content: 'Nothing changed.', components: [] });
    }
}

function create_component(herb_option_arr) {
    return new Array(
        new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('herbs')
                    .setMinValues(0)
                    .setMaxValues(herb_option_arr.length)
                    .addOptions(...herb_option_arr)
            )
    );
}

function get_herb_options(herb_menu_list, user) {
    const user_herbs = user.get_herbs();

    let options = new Array();
    for (const herb of herb_menu_list) {
        options.push(
            new StringSelectMenuOptionBuilder()
                .setLabel(herb)
                .setValue(herb)
                .setDefault(user_herbs.includes(herb))
        )
    };

    return options;
}

module.exports = {
    data,
    execute
};