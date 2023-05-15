const amar_messages = require('../bot/message_processing/amar_messages.js');
const ping_messages = require('../bot/message_processing/ping_messages.js');
const event_pings = require('../bot/message_processing/event_ping_messages.js');
const bounty_pings = require('../bot/message_processing/bounty_ping_messages.js');

class MessageHandler {
    static #message_routes = {
        amar_storm: amar_messages.check_amar_storm_message,
        bounty: bounty_pings.check_bounty_message,
        hell: event_pings.check_hell_message,
        event: event_pings.check_event_message,
        dt_frenzy: event_pings.check_dt_frenzy_message,
        blace_frenzy: event_pings.check_blace_frenzy,
        aura: event_pings.check_aura_message,
        drops: event_pings.check_drops_message,
        pings: ping_messages.check_ping_message,
        soulhounds: event_pings.check_soulhounds_message
    }

    static async message(message) {
        if (message.author.bot) return;

        message.User = await message.client.Users.add_user(message.author);
        message.Channel = message.client.Channels.get_channel_by_id(message.channelId);

        if (!message.Channel) return;

        for (const message_type of message.Channel.message_types) {
            this.#route_message(message, message_type);
        }
    }

    static async #route_message(message, message_type) {
        if (this.#message_routes.hasOwnProperty(message_type)) {
            this.#message_routes[message_type](message);
        } else {
            console.log(`Error: MessageHandler cannot route message. No route for ${message_type}.`)
        }
    }
}

module.exports = MessageHandler;