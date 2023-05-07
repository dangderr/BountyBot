const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db_access = require('../../database/db_access.js');

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
    let db = interaction.client.db;

    if (!(await db_access.check_user_is_in_db(db, interaction.user.id))) {
        await db_access.add_user(db, interaction.user.id, interaction.user.username, null);
    }

    const mob_arr = await get_mob_array(db, interaction.options);
    const bounties_followed = mob_obj_arr_to_str_arr(await db_access.get_bounties_followed(db, interaction.user.id));
    const component_arr = generate_component_array(mob_arr, bounties_followed);

    await interaction.reply({ content: 'Select bounties to follow', components: component_arr });

    create_collector(db, interaction, mob_arr, component_arr);
}

async function get_mob_array(db, options) {
    let mob_arr;
    if (options.getSubcommand() === 'dungeons') {
        mob_arr = await db_access.get_mobs(db, 'dungeons', null);
    }
    else if (options.getSubcommand() === 'summons') {
        mob_arr = await db_access.get_mobs(db, 'summons', options.getString('level'));
    }
    else if (options.getSubcommand() === 'ff') {
        mob_arr = await db_access.get_mobs(db, 'ff', options.getString('area'));
    }
    return mob_obj_arr_to_str_arr(mob_arr);
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

function mob_obj_arr_to_str_arr(obj_arr) {
    if (obj_arr.length === 0) return obj_arr;

    let key = Object.keys(obj_arr[0])[0];
    let str_arr = [];
    obj_arr.forEach((obj) => {
        str_arr.push(obj[key]);
    })
    return str_arr;
}

async function create_collector(db, interaction, mob_arr, component_arr) {
    const filter = i => i.user.id === interaction.user.id;
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
            await db_access.remove_bounty(db, interaction.user.id, mob);
            buttonClicked.setStyle(ButtonStyle.Secondary);
        } else {
            await db_access.add_bounty(db, interaction.user.id, mob);
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