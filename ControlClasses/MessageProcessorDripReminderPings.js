const datetime_methods = require('../utils/datetime_methods.js');

class MessageProcessDripReminderPings {
    #ping_controller;
    #mobs;
    #LATENCY_DELAY = 1.05;
    #TIME_PER_ACTION = 1000 * 6;    //Milliseconds

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
        scorch: [['food is cooking...', 'Come back to pick up your food in: ']],
        challenge: [['Kill monsters in Fighting Fields', '/'],
            ['Cut/combine Gems', ' / '],
            ['Mining ores', ' / '],
            ['Successful Fishing attempts', ' / '],
            ['Successful Hunting attempts', ' / '],
            ['Harvest', 'LVL Plants', ' / '],
            ['LVL Smithing and Smelting', ' / '],
            ['Cook Meat or Fish', ' / '],
            ['Crafting and Tanning', ' / '],
            ['Making', 'LVL Potions', ' / '],
            ['Woodworking', ' / '],
            ['Invoke Spirits', ' / ']],
        berserk: [['Berserk State:']],
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

        this.#search_terms['ff_slayer'] = mobs.filter(i => i[1] === 'ff').map(i => [ i[0], ' / ' ]);
    }

    async check_ping_message(message) {
        let message_arr = message.content.split('\n');
        let delay = datetime_methods.parse_drip_time_string(message_arr);

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
                    this.#send_pings(message, key, delay);
                    return;
                }
            }
        }

        for (const key of Object.keys(this.#exact_search_terms)) {
            for (let line of message_arr) {
                line = line.trim();
                if (line === this.#exact_search_terms[key]) {
                    this.#send_pings(message, key, delay);
                    return;
                }
            }
        }
    }

    async #send_pings(message, type, delay) {
        delay = this.#delay_correction(message, type, delay);

        if (delay <= 0) {
            this.#ping_controller.add_ping(null, null, message.channel.id, message.id,
                'Something went wrong, idk what time to ping you', 'error', null, null);
            return;
        }

        let timestamp = new Date();
        timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);

        this.#ping_controller.add_ping(null, null, message.channel.id, message.id,
            this.#get_random_reply() + ` ping <t:${Math.round(timestamp.getTime() / 1000)}:R>`, 'response', null, null);

        this.#ping_controller.add_ping(message.author.id, null, message.channel.id, message.id,
            null, type, timestamp, delay);
    }

    #delay_correction(message, type, delay) {
        let user = message.client.Users.get_user(message.author.id);

        switch (type) {
            case 'botcheck':
                return delay - (29 * 60 * 1000);
            case 'clan_wars_mob':
                try {
                    return parseInt(message.content) * this.#TIME_PER_ACTION * this.#LATENCY_DELAY;
                } catch (err) {
                    console.log('Error: MessageProcessorDripReminderPings - Could not parse Clan Wars message');
                    return -1;
                }
            case 'ff_slayer':
            case 'challenge':
                try {
                    const actions_remaining = message.content.split('\n')[1].split(' / ');
                    const current = parseInt(actions_remaining[0]);
                    const total = parseInt(actions_remaining[1]);
                    let delay = (total - current) * this.#TIME_PER_ACTION * this.#LATENCY_DELAY;

                    if (message.content.includes('Successful Hunting attempts')) {
                        let bow_percent = user.get_user_setting('Bow') ?? 50;
                        bow_percent = parseInt(bow_percent) / 100;
                        delay /= bow_percent;
                    } else if (message.content.includes('Woodworking')) {
                        let axe_percent = user.get_user_setting('Axe') ?? 0;
                        axe_percent = parseInt(axe_percent) / 100 + 0.5;
                        delay /= axe_percent ;
                    }

                    return delay;
                } catch (err) {
                    console.log('Error: MessageProcessorDripReminderPings - Could not parse ff_slayer/challenge message');
                    return -1;
                }
            case 'clan_titan_ready':
                return 1000 * 60 * 60 * 1.5;            //1.5 hours
            case 'berserk':
                return delay - (1000 * 60 * 60 * 24);   //1 day advanced notice
            default:
                if (type.includes('pot_')) {
                    return delay - 1000 * 60 * 2;      //2 minutes advanced notice
                }
                return delay;
        }
        return delay;
    }

    #get_random_reply() {
        return this.#replies[Math.floor(Math.random() * this.#replies.length)];
    }

    get_categories() {
        return Object.keys(this.#search_terms);
    }
}

module.exports = MessageProcessDripReminderPings;