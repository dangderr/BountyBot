const datetime_methods = require('../utils/datetime_methods.js');

class MessageProcessorLyr {
    #ping_controller;

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
        lyr_dungeon: [['fights left and ',' mobs left to kill.']],
    };

    //Look for exact match
    #exact_search_terms = {
        temp: 'asdfasdf'
    }
    constructor(ping_controller) {
        this.#ping_controller = ping_controller;
    }

    async check_ping_message(message) {
        let message_arr = message.content.split('\n');
        let delay = datetime_methods.parse_amar_time_string(message_arr);

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
                'Something went wrong, idk what time to ping you', `error ${type}`, null, null);
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
        if (type == 'lyr_dungeon') {
            try {
                const mobs = message.content.split('fights left and ')[1].split(' mobs left to kill.')[0];
                return mobs * 1000 * 6 * 1.05;      //6s per action and 5% latency delay.
            }
            catch (err) {
                console.log('Error: MessageProcessorLyr - Could not lyr mobs remaining in dungeon');
                return -1;
            }
        }

        return delay;
    }

    #get_random_reply() {
        return this.#replies[Math.floor(Math.random() * this.#replies.length)];
    }
}

module.exports = MessageProcessorLyr;
