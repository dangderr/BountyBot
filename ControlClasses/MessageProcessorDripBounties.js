const BountyLogs = require('../EntityClasses/BountyLogs.js');

class MessageProcessorDripBounty {
    #ping_controller;
    #bounty_logs;

    constructor(ping_controller, db) {
        this.#ping_controller = ping_controller;
        this.#bounty_logs = new BountyLogs(db);
    }

    async init() {
        await this.#bounty_logs.init();
    }

    async #get_user_mob_ping_list(bounties_followed, mobs_to_ping) {
        const ping_list = new Array();
        for (const mob of mobs_to_ping) {
            for (const entry of bounties_followed.filter(i => i[1] == mob)) {
                ping_list.push(entry);
            }
        }
        return ping_list;
    }

    async #get_mobs(message_arr) {
        let mobs = new Array();

        for (let i = 0; i < message_arr.length; i++) {
            const line = message_arr[i].trim();
            if (line.length == 0)
                continue;

            const arr = line.split(' ').filter(i => i); //Get each word, remove blanks
            if (arr.length < 3 || arr[1] != 'LVL')
                continue;

            let mob = arr.slice(2).join(' ');

            let milliseconds = 0;
            if (i != message_arr.length - 1) {
                i++;
                milliseconds = this.#calculate_bounty_time_remaining(message_arr[i]);
            }

            let timestamp = new Date();
            timestamp.setMilliseconds(timestamp.getMilliseconds() + milliseconds);

            if (await this.#bounty_logs.check_bounty_double_ping(mob, timestamp)) {
                continue;
            }

            this.#bounty_logs.add_bounty_log(mob, timestamp);
            mobs.push(mob);
        }
        return mobs;
    }

    async check_bounty_message(message) {
        if (!message.content.includes('LVL'))
            return;

        const message_arr = message.content.split('\n');
        if (message_arr.length <= 0) {
            return;
        }

        let mobs_to_ping = await this.#get_mobs(message_arr);                                                 // [ mob, mob, mob ]
        if (mobs_to_ping.length == 0) return;

        const bounties_followed = message.client.Users.get_bounties_followed();                                 // [ [id, mob], [id, mob] ]
        const user_mob_ping_list = await this.#get_user_mob_ping_list(bounties_followed, mobs_to_ping);         // [ [id, mob], [id, mob] ]
        if (user_mob_ping_list.length == 0) return;


        const users_to_ping = new Set(user_mob_ping_list.map(i => i[0]));

        for (const user of users_to_ping) {
            if (user == message.author.id) continue;                            // No self pings
            if (!message.client.Users.get_user(user).active) continue;          // Don't ping inactives
            if (message.client.Users.get_user(user).bounty_done) continue;      // Don't ping people done with bounties
     
            const content = user_mob_ping_list
                .filter(i => i[0] == user)
                .map(i => i[1])
                .join(', ');

            this.#ping_controller.add_ping(user, null, message.channel.id, null, content, 'bounty_ping', null, null);
        }
    }
    
    #calculate_bounty_time_remaining(line) {
        let milliseconds = 0;
        const time_arr = line.trim().split(' ').filter(i => i);
        let index = time_arr.indexOf('s.');
        if (index > 0) {
            try {
                milliseconds += parseInt(time_arr[index - 1]) * 1000;
            } catch (err) {
                console.log('Error in calculate_time_remaining');
                console.log(time_arr.join('-'));
            }
        }
        index = time_arr.indexOf('min.');
        if (index > 0) {
            try {
                milliseconds += parseInt(time_arr[index - 1]) * 60 * 1000;
            } catch (err) {
                console.log('Error in calculate_time_remaining');
                console.log(time_arr.join('-'));
            }
        }
        index = time_arr.indexOf('h.');
        if (index > 0) {
            try {
                milliseconds += parseInt(time_arr[index - 1]) * 60 * 60 * 1000;
            } catch (err) {
                console.log('Error in calculate_time_remaining');
                console.log(time_arr.join('-'));
            }
        }
        return milliseconds;
    }
}

module.exports = MessageProcessorDripBounty;