const MessageProcessorAmar = require('../ControlClasses/MessageProcessorAmar.js');
const MessageProcessorDripBounties = require('../ControlClasses/MessageProcessorDripBounties.js');
const MessageProcessorDripEvents = require('../ControlClasses/MessageProcessorDripEvents.js');
const MessageProcessorDripReminderPings = require('../ControlClasses/MessageProcessorDripReminderPings.js');

class MessageHandler {
    #amar;
    #drip_bounties;
    #drip_events;
    #drip_reminders;

    constructor(ping_controller, db) {
        this.#amar = new MessageProcessorAmar(ping_controller);
        this.#drip_bounties = new MessageProcessorDripBounties(ping_controller, db);
        this.#drip_events = new MessageProcessorDripEvents(ping_controller, db);
        this.#drip_reminders = new MessageProcessorDripReminderPings(ping_controller);
    }

    async init() {
        await this.#drip_bounties.init();
        await this.#drip_events.init();
    }

    async message(message) {
        if (message.author.bot) return;

        message.User = await message.client.Users.add_user(message.author);
        message.Channel = message.client.Channels.get_channel_by_id(message.channelId);

        if (!message.Channel) return;


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
            default: console.log(`Error: MessageHandler cannot route message. No route for ${message_type}.`)
        }

        /*
        if (this.#message_routes.hasOwnProperty(message_type)) {
            this.#message_routes[message_type](message);
        } else {
            console.log(`Error: MessageHandler cannot route message. No route for ${message_type}.`)
        }*/
    }
}

module.exports = MessageHandler;