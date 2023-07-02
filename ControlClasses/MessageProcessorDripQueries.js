const datetime_methods = require('../utils/datetime_methods.js');

class MessageProcessDripQueries {
    #ping_controller;
    #users;
    #drip_reminders

    #ONE_HOUR = 1000 * 60 * 60;
    #FIVE_MINUTES = 1000 * 60 * 5;

    // Format [[a,b],[c,d]]
    // Searches for (a AND b) OR (c AND d)
    #search_terms = {
        help: [['help']],
        missing_timers: [['missing','timers']],
        timers: [['timers']],
    };

    //Look for exact match
    #exact_search_terms = {
        temp:'asdfasdfasdfasdfasdf'
    }

    constructor(ping_controller, users, drip_reminders) {
        this.#ping_controller = ping_controller;
        this.#users = users;
        this.#drip_reminders = drip_reminders;
    }

    async check_query_message(message) {
        if (message.content.substring(0, 7) !== 'yo dawg'
            && message.content.substring(0, 7) !== 'ay dawg'
            && message.content.substring(0, 1) !== '!'
        ) {
            return;
        }

        if (message.content === '!h') {
            this.#ping_controller.add_ping(message.author.id, null, message.channel.id, message.id,
                'Pick a plant', 'herbalism', null, null);
            return;
        } else if (message.content === '!p') {
            this.#ping_controller.add_ping(message.author.id, null, message.channel.id, message.id,
                'Pick a time', 'pet_training', null, null);
            return;
        } else if (message.content === '!a') {
            const delay = this.#ONE_HOUR - this.#FIVE_MINUTES;
            const timestamp = Date.now() + delay;
            this.#ping_controller.add_ping(message.author.id, null, message.channel.id, message.id,
                `Amar botcheck reminder set <t:${Math.round(timestamp / 1000)}:R>`, 'response', null, null);
            this.#ping_controller.add_ping(message.author.id, null, message.channel.id, message.id,
                null, 'amar_botcheck', timestamp, delay);
            return;
        }

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
                    this.#send_pings(message, key);
                    return;
                }
            }
        }
    }

    async #send_pings(message, key) {
        //const user = this.#users.get_user(message.author.id);
        let content;
        switch (key) {
            case 'help':
                content = this.#get_content_help();
                break;
            case 'timers':
                content = this.#get_content_timers(message);
                break;
            case 'missing_timers':
                content = this.#get_content_missing_timers(message);
                break;
            default: return;
        }

        this.#ping_controller.add_ping(null, null, message.channel.id, message.id,
            content, key, null, null);
    }

    #get_content_help() {
        let content = 'Available commands are:```\n'
        content += '!h               Start herbalism timer\n';
        content += '!a               Restart amar botcheck timer\n';
        content += '!timers          View list of running timers\n';
        content += '!missing timers  View list of timers not running\n';
        content += '```';
        return content;
    }

    #get_content_timers(message) {
        const user_pings = this.#ping_controller.get_pings_by_user(message.author.id);
        if (user_pings.length == 0) {
            return 'You have no pings scheduled right now.'
        }

        let content = 'You have the following pings scheduled:\n';
        content += user_pings.sort((a, b) => a.unix_time - b.unix_time).map(i => `${i.type} - <t:${i.unix_time}:R> at <t:${i.unix_time}:T>`).join('\n');

        return content;
    }

    #get_content_missing_timers(message) {
        const user_pings = this.#ping_controller.get_pings_by_user(message.author.id);
        let missing_timers = this.#drip_reminders.get_categories();

        const remove = ['unknown', 'clan_titan_ready', 'clan_wars_mob'];

        for (const type of remove) {
            const index = missing_timers.findIndex(i => i == type);
            if (index >= 0) {
                missing_timers.splice(index, 1);
            }
        }

        for (const ping of user_pings) {
            const index = missing_timers.findIndex(i => i == ping.type);
            if (index >= 0) {
                missing_timers.splice(index, 1);
            }
        }

        if (missing_timers.length == 0) {
            return 'Wow, you have all the possible timers running right now. What are you, some kind of bot??';
        }

        let content = 'You are missing the following pings:\n';
        content += missing_timers.join('\n');
        content += '\nslacker.......';

        return content;
    }
}

module.exports = MessageProcessDripQueries;