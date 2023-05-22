const MessageProcessorAmar = require('../ControlClasses/MessageProcessorAmar.js');
const MessageProcessorDripBounties = require('../ControlClasses/MessageProcessorDripBounties.js');
const MessageProcessorDripEvents = require('../ControlClasses/MessageProcessorDripEvents.js');
const MessageProcessorDripReminderPings = require('../ControlClasses/MessageProcessorDripReminderPings.js');
const MessageProcessorDripQueries = require('../ControlClasses/MessageProcessorDripQueries.js');

class MessageHandler {
    #amar;
    #drip_bounties;
    #drip_events;
    #drip_reminders;
    #drip_queries;

    constructor(client) {
        this.#amar = new MessageProcessorAmar(client.PingController);
        this.#drip_bounties = new MessageProcessorDripBounties(client.PingController, client.drip_db);
        this.#drip_events = new MessageProcessorDripEvents(client.PingController, client.drip_db);
        this.#drip_reminders = new MessageProcessorDripReminderPings(client.PingController, client.Data.mobs);
        this.#drip_queries = new MessageProcessorDripQueries(client.PingController, client.Users, this.#drip_reminders);
    }

    async init() {
        await this.#drip_bounties.init();
        await this.#drip_events.init();
    }

    async message(message) {
        if (message.author.bot) return;

        message.Channel = message.client.Channels.get_channel_by_id(message.channelId);
        if (!message.Channel) return;

        message.User = await message.client.Users.add_user(message.author);
        for (const message_type of message.Channel.message_types) {
            this.#route_message(message, message_type);
        }
    }

    async #route_message(message, message_type) {
        switch (message_type) {
            case 'amar_storm': this.#amar.check_storm_message(message); break;
            case 'bounty': this.#drip_bounties.check_bounty_message(message); break;
            case 'hell': this.#drip_events.check_hell_message(message); break;
            case 'event': this.#drip_events.check_event_message(message); break;
            case 'dt_frenzy': this.#drip_events.check_dt_frenzy_message(message); break;
            case 'blace_frenzy': this.#drip_events.check_blace_frenzy(message); break;
            case 'aura': this.#drip_events.check_aura_message(message); break;
            case 'drops': this.#drip_events.check_drops_message(message); break;
            case 'soulhounds': this.#drip_events.check_soulhounds_message(message); break;
            case 'pings': this.#drip_reminders.check_ping_message(message); break;
            case 'queries': this.#drip_queries.check_query_message(message); break;
            default: console.log(`Error: MessageHandler cannot route message. No route for ${message_type}.`)
        }
    }
}

module.exports = MessageHandler;