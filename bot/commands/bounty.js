const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const data = (new SlashCommandBuilder()
    .setName('bounty')
    .setDescription('Manage bounty notifications')
    .addSubcommand(subcommand => subcommand
        .setName('dungeons')
        .setDescription('Choose dungeon bounties to follow')
    )
    .addSubcommand(subcommand => subcommand
        .setName('summons')
        .setDescription('Choose summon bounties to follow')
        .addStringOption(option => option
            .setName('level')
            .setDescription('Choose level range for summon bounties')
            .setRequired(true)
            .addChoices(
                { name: 'High (70+)', value: 'high' },
                { name: 'Low (1-65)', value: 'low' }
            )
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('ff')
        .setDescription('Choose FF bounties to follow')
        .addStringOption(option => option
            .setName('area')
            .setDescription('Choose FF area')
            .setRequired(true)
            .addChoices(
                { name: 'FF1', value: '1' },
                { name: 'FF2', value: '2' },
                { name: 'FF3', value: '3' },
                { name: 'FF4', value: '4' },
                { name: 'FF5', value: '5' },
                { name: 'FF6', value: '6' },
                { name: 'FF7', value: '7' },
                { name: 'FF8', value: '8' },
                { name: 'FF9', value: '9' },
                { name: 'FF10', value: '10' },
                { name: 'FF11', value: '11' },
                { name: 'FF12', value: '12' }
            )
        )
    )
);

async function execute(interaction) {
    const user = interaction.User;

    const mob_arr = get_mob_array(interaction.client.mobs, interaction.options);
    const bounties_followed = user.get_bounties_followed();
    const component_arr = generate_component_array(mob_arr, bounties_followed);

    await interaction.reply({ content: 'Select bounties to follow', components: component_arr });
    create_collector(interaction, user, mob_arr, component_arr);
}

function get_mob_array(mobs, options) {
    let filter;

    if (options.getSubcommand() === 'dungeons') {
        filter = i => i[1] == 'dungeons';
    }
    else if (options.getSubcommand() === 'summons') {
        filter = i => i[1] == 'summons' && i[2] == options.getString('level');
    }
    else if (options.getSubcommand() === 'ff') {
        filter = i => i[1] == 'ff' && i[2] == options.getString('area');
    }

    return mobs.filter(filter).map(i => i[0]);
}

function generate_component_array(mob_arr, bounties_followed) {
    let component_arr = new Array();
    const num_mobs = mob_arr.length;
    for (let i = 0; i < num_mobs / 4; i++)
        component_arr.push(new ActionRowBuilder());

    let index = 0;
    while (index < num_mobs) {
        const mob_name = mob_arr[index];
        let style;
        if (bounties_followed.includes(mob_name)) {
            style = ButtonStyle.Success;
        } else {
            style = ButtonStyle.Secondary;
        }
        component_arr[Math.floor(index / 4)].addComponents(
            new ButtonBuilder()
                .setCustomId(mob_name)
                .setLabel(mob_name)
                .setStyle(style)
        );
        index++;
    }
    return component_arr;
}

async function create_collector(interaction, user, mob_arr, component_arr) {
    const filter = (i => i.user.id === user.discord_id);
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
    collector.on('collect', async i => {
        let mob = i.component.customId;
        let index = mob_arr.indexOf(mob);
        if (index < 0) {
            //console.error('Error: Button clicked was not found in mob_arr');
            return;
        }
        let row = Math.floor(index / 4);
        let col = index % 4;

        let buttonClicked = component_arr[row].components[col];

        if (i.component.style == ButtonStyle.Success) {
            await user.remove_bounty(mob);
            buttonClicked.setStyle(ButtonStyle.Secondary);
        } else {
            await user.add_bounty(mob);
            buttonClicked.setStyle(ButtonStyle.Success);
        }
        await i.update({
            components: component_arr
        });
    });
    collector.on('end', collector => { });
}

module.exports = {
    data,
    execute
};