const { Events } = require('discord.js');

const fs = require('fs');
const amar_messages = require('../message_processing/amar_messages.js');
const ping_messages = require('../message_processing/ping_messages.js');
const event_pings = require('../message_processing/event_ping_messages.js');
const bounty_pings = require('../message_processing/bounty_ping_messages.js');

async function execute(message) {
    if (message.author.bot) return;

    try {
        message.User = await message.client.Users.add_user(message.author);

        message.Channel = message.client.Channels.get_channel_by_id(message.channelId);
        if (!message.Channel) return;

        if (fs.existsSync('./bot/message_processing/secret_chronos_commands.js')) {
            let chronos = await message.client.Users.get_user_by_drip_username('Chronos');
            if (chronos && chronos.discord_id == message.User.discord_id) {
                secret_commands = require('../message_processing/secret_chronos_commands.js');
                secret_commands.process_message(message);
            }
        }

        for (const message_type of message.Channel.message_types) {
            switch (message_type) {
                case 'amar_storm':
                    amar_messages.check_amar_storm_message(message);
                    break;
                case 'bounty':
                    bounty_pings.check_bounty_message(message);
                    break;
                case 'hell':
                    event_pings.check_hell_message(message);
                    break;
                case 'event':
                    event_pings.check_event_message(message);
                    break;
                case 'dt_frenzy':
                    event_pings.check_dt_frenzy_message(message);
                    break;
                case 'blace_frenzy':
                    event_pings.check_blace_frenzy(message);
                    break;
                case 'aura':
                    event_pings.check_aura_message(message);
                    break;
                case 'drops':
                    event_pings.check_drops_message(message);
                    break;
                case 'pings':
                    ping_messages.check_ping_message(message);
                    break;
                case 'soulhounds':
                    event_pings.check_soulhounds_message(message);
                    break;
                case 'lyr':
                    break;
                default:
                    console.log(`Error: Message type ${message_type} does not exist`);
            }
        }
    } catch (err) {
        console.log('Uh oh, something went wrong, but I was too lazy to do proper error handling so idk what happened');
        console.log(err);
    }
}

const name = Events.MessageCreate;

module.exports = {
    name,
    execute
};