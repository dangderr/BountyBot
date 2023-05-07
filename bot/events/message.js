const { Events } = require('discord.js');

const db_access = require('../../database/db_access.js');
const amar_messages = require('../message_processing/amar_messages.js');
const ping_messages = require('../message_processing/ping_messages.js');
const event_pings = require('../message_processing/event_ping_messages.js');
const bounty_pings = require('../message_processing/bounty_ping_messages.js');

async function execute(message) {
    const db = message.client.db;

    if (message.author.bot) return;

    const channel_info = await db_access.get_channel_info(db, message.channelId);
    if (!channel_info) return;

    const channel_message_types = channel_info.channel_server == 'testserver' ? await db_access.get_all_message_types(db) : await db_access.get_channel_message_types(db, channel_info.channel_name, channel_info.channel_server);

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
                /////////////////////////////
                break;
            default:
                console.log(`Error: Message type ${message_type} does not exist`);
        }
    }
}

const name = Events.MessageCreate;

module.exports = {
    name,
    execute
};