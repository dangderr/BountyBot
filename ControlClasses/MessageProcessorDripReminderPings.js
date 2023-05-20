const datetime_methods = require('../utils/datetime_methods.js');

class MessageProcessDripReminderPings {
    #ping_controller;
    #mobs;

    #replies = [
        'k',
        'aight',
        'i gotchu.',
        'sure if i remember to',
        "maybe i'll",
        'lol gl with that thoughts and prayers...',
        'u gonna ignore the ping anyways... but i guess i should still',
        'sure sure sure',
        'you even gonna be awake for the'
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

    //Look for exact match
    #exact_search_terms = {
        pot_atk: 'Attack',
        pot_def: 'Defense',
        pot_mystery: 'Mystery',
        pot_xp: 'XP',
        pot_lvl: 'LVL'
    }


    constructor (ping_controller, mobs) {
        this.#ping_controller = ping_controller;
        this.#mobs = mobs;
    }

    async check_ping_message(message) {
        if (message.content == '!') {
            this.#ping_controller.add_ping(message.author.id, null, message.channel.id, message.id,
                'Pick a plant', 'herbalism', null, null);
            return;
        }

        let message_arr = message.content.split('\n');
        let delay = datetime_methods.parse_drip_time_string(message_arr);
        let timestamp = new Date();

        this.#check_ff_slayer(message, message_arr);

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

        for (const key of Object.keys(this.#exact_search_terms)) {
            for (let line of message_arr) {
                line = line.trim();
                if (line === this.#exact_search_terms[key]) {
                    this.#send_pings(message, key, timestamp, delay);
                    return;
                }
            }
        }
    }

    async #check_ff_slayer(message, message_arr) {
        const key = 'ff_slayer';

        if (this.#mobs.filter(i => i[1] === 'ff').map(i => i[0]).includes(message_arr[0]) &&
            message_arr[1].includes('/')
        ) {
            const mobs_remaining = message_arr[1].split(' / ');
            try {
                const LATENCY_DELAY = 1.05;
                const TIME_PER_MOB = 1000 * 6;

                const current = parseInt(mobs_remaining[0]);
                const total = parseInt(mobs_remaining[1]);

                let timestamp = new Date();
                let delay = (total - current) * TIME_PER_MOB * LATENCY_DELAY;
                timestamp.setUTCMilliseconds(timestamp.getUTCMilliseconds() + delay);

                this.#ping_controller.add_ping(null, null, message.channel.id, message.id,
                    this.#get_random_reply() + ` ping <t:${Math.round(timestamp.getTime() / 1000)}:R>`, 'response', null, null);

                this.#ping_controller.add_ping(message.author.id, null, message.channel.id, message.id,
                    null, key, timestamp, delay);
            } catch (err) {
                console.log('Could not parse ff_slayer numbers');
            }
            return;
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
            delay = 1000 * 60 * 60 * 1.5;     //1.5 hours
        } else if (type.includes('pot_')) {
            delay -= 1000 * 60 * 2;         // Two minute advanced notice
        }

        if (delay <= 0) {
            this.#ping_controller.add_ping(null, null, message.channel.id, message.id,
                'Something went wrong, idk what time to ping you', 'error', null, null);
            return;
        }

        timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);

        this.#ping_controller.add_ping(null, null, message.channel.id, message.id,
            this.#get_random_reply() + ` ping <t:${Math.round(timestamp.getTime() / 1000)}:R>`, 'response', null, null);

        this.#ping_controller.add_ping(message.author.id, null, message.channel.id, message.id,
            null, type, timestamp, delay);
    }

    #get_random_reply() {
        return this.#replies[Math.floor(Math.random() * this.#replies.length)];
    }
}

module.exports = MessageProcessDripReminderPings;