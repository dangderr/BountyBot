const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const data = (new SlashCommandBuilder()
    .setName('hades_training_calc')
    .setDescription('Figure out how many units to train')
    .addIntegerOption(option => option
        .setName('gs')
        .setDescription('GS level')
        .setMinValue(0)
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('unit')
        .setDescription('Which unit type')
        .setRequired(true)
        .addChoices(
            { name: 'Warrior', value: 'Warrior' },
            { name: 'Archer', value: 'Archer' },
            { name: 'Mage', value: 'Mage' }
        )
    )
    .addIntegerOption(option => option
        .setName('amount')
        .setDescription('How many units to train? (Enter either this or minutes, not both)')
        .setMinValue(1)
    )
    .addIntegerOption(option => option
        .setName('minutes')
        .setDescription('How many minutes to train for? (Enter either this or minutes, not both)')
        .setMinValue(1)
    )
);

async function execute(interaction) {
    const channel = interaction.Channel;

    if ((channel.server != 'drip' || channel.name != 'hellllama') && channel.server != 'testserver') {
        interaction.reply('Please keep Hades spam in the #helllllllllama channel');
        return;
    }

    let base_time;
    const unit = interaction.options.getString('unit');
    switch (unit) {
        case 'Warrior': base_time = 1; break;
        case 'Archer': base_time = 2; break;
        case 'Mage': base_time = 4; break;
    }

    const gs = interaction.options.getInteger('gs');
    const gs_reduction = 1 / (1 + 0.1 * gs);
    const amount = interaction.options.getInteger('amount');
    const training_minutes = interaction.options.getInteger('minutes');


    let content = '';
    if (amount > 0) {
        const time = base_time * amount * gs_reduction / 60;
        content += `At GS ${gs}, training ${amount} ${unit}s will take ${get_time_str_from_hours(time)}\n`;
    }
    if (training_minutes > 0) {
        const num_units = Math.floor(training_minutes / base_time / gs_reduction);
        content += `At GS ${gs}, training ${unit}s for ${training_minutes} minutes will get ${num_units} units.`;
    }

    interaction.reply(content);
}

function get_time_str_from_hours(hours) {
    let str = '';
    if (hours > 1) {
        str += Math.floor(hours).toString() + ' h. ';
        hours -= Math.floor(hours);
        let minutes = hours * 60;
        str += Math.ceil(minutes).toString() + ' min.';
    } else if (hours * 60 > 1) {
        let minutes = hours * 60;
        str += Math.floor(minutes).toString() + ' min. ';
        minutes -= Math.floor(minutes);
        let seconds = minutes * 60;
        str += Math.ceil(seconds).toString() + ' s.';
    } else if (hours * 60 * 60 > 1) {
        let seconds = hours * 60 * 60;
        str += Math.ceil(seconds).toString() + ' s.';
    } else {
        str = '0';
    }

    return str;
}

module.exports = {
    data,
    execute
};