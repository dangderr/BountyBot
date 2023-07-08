const datetime_methods = require('../utils/datetime_methods.js');

class MessageProcessorAmar {
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
        amar_botcheck: [['Active']],
        amar_timer_spells: [['Timer']],
        amar_dd_spells: [['Double Drops', '%']],
        amar_success_spells: [['Success', '%']],
        amar_rd_spells: [['Random Drops', '%']],

        amar_garden_picking: [['You have', 'remaining!']],
        amar_garden_planting: [['You have', 'free slots!']],

        amar_unknown: [['hr'],['mins']]
    };

    //Look for exact match
    #exact_search_terms = {
        temp: 'asdfasdf'
    }
    constructor(ping_controller) {
        this.#ping_controller = ping_controller;
    }

    async check_storm_message(message) {
        let role_id;
        let location;
        let time_str;
        let type;

        if (message.content.includes("Time to grab a kite, a thunderstorm is rolling into")) {
            role_id = message.client.Channels.get_role_id('thunderstorm', 'amar');
            location = message.content.split(" into ")[1];
            time_str = message.content.split(' Time to grab')[0];
            type = 'amar_storm';
        }
        else if (message.content.includes("A rainbow emerges as a light rain begins to fall in")) {
            role_id = message.client.Channels.get_role_id('event', 'amar');
            location = message.content.split(" fall in ")[1];
            time_str = message.content.split(' A rainbow emerges')[0];
            type = 'amar_event';
        }
        else {
            return;
        }

        if (!role_id) {
            console.log('Error in getting role ID');
            return;
        }

        if (location.includes('! Travel')) {
            location = location.replace('! Travel', '');
        } else if (location.includes('!')) {
            location = location.replace('!', '');
        }

        const time_arr = time_str.split(':');
        const current_time = new Date();

        let minutes_ago = current_time.getUTCHours() - time_arr[0];
        minutes_ago *= 60;
        minutes_ago += (current_time.getUTCMinutes() - time_arr[1]);
        if (current_time.getUTCHours() < time_arr[0]) {     //Correction if ping occurs on a new day
            minutes_ago += 24 * 60;
        }

        let content = 'at ' + location;
        if (minutes_ago > 3) {
            content += ' started ' + minutes_ago + ' minutes ago';
        }

        this.#ping_controller.add_ping(null, role_id, message.channel.id, message.id, content, type, null, null);

        let reminder_content = type == 'amar_storm' ? 'Thunderstorm' : 'Event';
        reminder_content += " started 60 minutes ago. It's gotta be over by now, right?";
        current_time.setUTCMinutes(current_time.getUTCMinutes() + (2 - minutes_ago));

        this.#ping_controller.add_ping(null, null, message.channel.id, message.id,
            reminder_content, type + '_end_reminder', current_time.toUTCString(), null);
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
        if (type == 'amar_botcheck') {
            return delay -= 1000 * 60 * 5;          // 5 min advanced notice
        } else if (type == 'amar_garden_picking') {
            try {
                const plants = parseInt(message.content.split('You have ')[1].split('plants remaining!')[0]);
                return plants * 1000 * 15 / 2;      //15s per action and 2 plants per action.
            }
            catch (err) {
                console.log('Error: MessageProcessorAmar - Could not parse plants remaining');
                return -1;
            }
        } else if (type == 'amar_garden_planting') {
            try {
                const slots = message.content.split('You have ')[1].split('free slots!')[0].replace(',', '').split(' / ')[0];
                return slots * 1000 * 15 / 2;      //15s per action and 2 plants per action.
            }
            catch (err) {
                console.log('Error: MessageProcessorAmar - Could not parse slots remaining');
                return -1;
            }
        }


        return delay;
    }

    #get_random_reply() {
        return this.#replies[Math.floor(Math.random() * this.#replies.length)];
    }
}

module.exports = MessageProcessorAmar;
