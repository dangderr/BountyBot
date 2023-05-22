const { SlashCommandBuilder } = require('discord.js');
const datetime_methods = require('../../utils/datetime_methods.js');

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
        content += `At GS ${gs}, training ${amount} ${unit}s will take ${datetime_methods.get_time_str_from_hours(time)}\n`;
    }
    if (training_minutes > 0) {
        const num_units = Math.floor(training_minutes / base_time / gs_reduction);
        content += `At GS ${gs}, training ${unit}s for ${training_minutes} minutes will get ${num_units} units.`;
    }

    interaction.reply(content);
}

module.exports = {
    data,
    execute
};