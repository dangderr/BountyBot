const { Events } = require('discord.js');

const amar_messages = require('../message_processing/amar_messages.js');
const ping_messages = require('../message_processing/ping_messages.js');
const event_pings = require('../message_processing/event_ping_messages.js');
const bounty_pings = require('../message_processing/bounty_ping_messages.js');

async function execute(message) {
    try {
        if (message.author.bot) return;

        const db = message.client.drip_db;
        const user = message.author;
        await db.add_user(user.id, user.username, null);

        const channel_info = await db.get_channel_info(message.channelId);
        if (!channel_info) return;

        const channel_message_types = (channel_info.channel_server == 'testserver')
            ? await db.get_all_message_types()
            : await db.get_channel_message_types(channel_info.channel_name, channel_info.channel_server);

        for (const obj of channel_message_types) {
            const message_type = obj.message_type;
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