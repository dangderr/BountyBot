const datetime_methods = require('../utils/datetime_methods.js');

class MessageProcessDripQueries {
    #ping_controller;
    #users;

    // Format [[a,b],[c,d]]
    // Searches for (a AND b) OR (c AND d)
    #search_terms = {
        timers: [['timers']]
    };

    //Look for exact match
    #exact_search_terms = {
        temp:'asdfasdfasdfasdfasdf'
    }

    constructor (ping_controller, users) {
        this.#ping_controller = ping_controller;
        this.#users = users;
    }

    async check_query_message(message) {
        if (message.content.substring(0, 7) !== 'yo dawg'
            && message.content.substring(0, 7) !== 'ay dawg'
            && message.content.substring(0, 1) !== '!'
        ) {
            return;
        }

        if (message.content === '!') {
            this.#ping_controller.add_ping(message.author.id, null, message.channel.id, message.id,
                'Pick a plant', 'herbalism', null, null);
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
            case 'timers':
                content = this.#get_content_timers(message);
                break;
            default: return;
        }

        this.#ping_controller.add_ping(null, null, message.channel.id, message.id,
            content, key, null, null);
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
}

module.exports = MessageProcessDripQueries;