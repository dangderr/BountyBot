const datetime_methods = require('../utils/datetime_methods.js');

class MessageProcessDripReminderPings {
    #ping_controller;
    #replies = [
        'k',
        'aight',
        'i gotchu',
        'sure if i remember',
        'maybe later',
        'lol gl with that thoughts and prayers',
        'u gonna ignore the ping anyways...',
        'sure sure sure',
        'you even gonna be awake?'
    ];

    // Format [[a,b],[c,d]]
    // Searches for (a AND b) OR (c AND d)
    #search_terms = {
        botcheck: [['Wild Captcha Event in:']],
        cauldron: [['will be able to drink in:']],
        herbalism: [['is still growing!']],
        pet_training: [['Your Pet is Training']],
        pet_exploration: [['Your Pet is Exploring']],
        hades_training: [['have successfully started to rise'], ['are rising from the Dead!']],
        soulhounds_attack: [['Soulhounds ravaging the Hades...', "You can't attack for:"]],
        hades_attack: [['Attack the others and take their Dark Crystals!', "You can't attack for:"]],
        hades_dragon: [['Undead Dragon will appear in:']],
        clan_wars_mob: [['Land is Protected by']],
        clan_titan_ready: [['The Titan of Rock and Metal begins to rise'],
                           ['The Titan of Beasts and Prey begins to rise'],
                           ['The Titan of Magic and Nature begins to rise']],
        unknown: [['Time left:']]
    };

    #pots = {
        pot_atk: 'Attack',
        pot_def: 'Defense',
        pot_mystery: 'Mystery',
        pot_xp: 'XP',
        pot_lvl: 'LVL'
    }

    constructor (ping_controller) {
        this.#ping_controller = ping_controller;
    }

    async check_ping_message(message) {
        let message_arr = message.content.split('\n');
        let delay = datetime_methods.parse_drip_time_string(message_arr);
        let timestamp = new Date();

        for (const key of Object.keys(this.#search_terms)) {
            for (const row of this.#search_terms[key]) {
                let match = true;
                for (const search_term of row) {
                    if (!message.content.includes(search_term)) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    this.#send_pings(message, key, timestamp, delay);
                    return;
                }
            }
        }

        for (const key of Object.keys(this.#pots)) {
            for (let line of message_arr) {
                line = line.trim();
                if (line === this.#pots[key]) {
                    delay -= 1000 * 60 * 2;         // Two minute advanced notice
                    this.#send_pings(message, key, timestamp, delay);
                    return;
                }
            }
        }
    }

    async #send_pings(message, type, timestamp, delay) {
        if (type == 'botcheck') {
            delay -= (29 * 60 * 1000);
        } else if (type == 'clan_wars_mob') {
            try {
                delay = parseInt(message.content);
                delay *= 6000;      //6 seconds per mob
                delay *= 1.05;      //~5% latency delay 
            } catch (err) {
                console.log('Error: MessageProcessorDripReminderPings - Could not parse Clan Wars message');
                return;
            }
        } else if (type == 'clan_titan_ready') {
            delay = 1000 * 60 * 60 * 2;     //2 hours
        }

        if (delay <= 0) {
            this.#ping_controller.add_ping(null, null, message.channel.id, message.id,
                'Something went wrong, idk what time to ping you', 'error', null, null);
            return;
        }

        timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);

        this.#ping_controller.add_ping(null, null, message.channel.id, message.id,
            this.#get_random_reply(), 'response', null, null);

        this.#ping_controller.add_ping(message.author.id, null, message.channel.id, message.id,
            null, type, timestamp, delay);

        if (type == 'herbalism') {
            const new_timestamp = new Date(timestamp);
            new_timestamp.setUTCMinutes(new_timestamp.getUTCMinutes() + 20);
            this.#ping_controller.add_ping(message.author.id, null, message.channel.id, message.id,
                null, 'replanting', new_timestamp, null);
        }
    }

    #get_random_reply() {
        return this.#replies[Math.floor(Math.random() * this.#replies.length)];
    }
}

module.exports = MessageProcessDripReminderPings;