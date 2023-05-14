const datetime_methods = require('../../utils/datetime_methods.js');

async function get_user_mob_ping_list(bounties_followed, mobs_to_ping) {
    const ping_list = new Array();
    for (const mob of mobs_to_ping) {
        for (const entry of bounties_followed.filter(i => i[1] == mob)) {
            ping_list.push(entry);
        }
    }
    return ping_list;
}

async function filtered_mobs_to_ping(db, mobs_to_ping, ping_history) {
    let max_time_discrepancy = 1000 * 60 * 3; //three minutes

    let filtered_mobs_to_ping = new Array();

    for (const mob_to_ping of mobs_to_ping) {

        const filtered_ping_history = ping_history.filter((mob) => mob.mob == mob_to_ping.mob);

        let match = false;
        for (const ping_history_mob of filtered_ping_history) {
            const time_discrepancy = new Date(ping_history_mob.timestamp).getTime() - new Date(mob_to_ping.timestamp).getTime();
            if (time_discrepancy < max_time_discrepancy && time_discrepancy > -max_time_discrepancy) {
                match = true;
                break;
            }
        }
        if (match) continue;
        filtered_mobs_to_ping.push(mob_to_ping.mob);

        //////MessageProcessor
        if (Date.now() < new Date(mob_to_ping.timestamp).getTime()) {
            db.add_bounty_ping_history(mob_to_ping.mob, mob_to_ping.timestamp);
        }
    }
    return filtered_mobs_to_ping;
}

async function get_mobs(db, message_arr, ping_history) {
    let mobs = new Array();

    for (let i = 0; i < message_arr.length; i++) {
        const line = message_arr[i].trim();
        if (line.length == 0)
            continue;

        const arr = line.split(' ').filter(i => i); //Get each word, remove blanks
        if (arr.length < 3 || arr[1] != 'LVL')
            continue;

        let mob_name = arr.slice(2).join(' ');

        let milliseconds = 0;
        if (i != message_arr.length - 1) {
            i++;
            milliseconds = datetime_methods.calculate_bounty_time_remaining(message_arr[i]);
        }
        let end_time = new Date();
        end_time.setMilliseconds(end_time.getMilliseconds() + milliseconds);

        mobs.push({ mob: mob_name, timestamp: end_time.toISOString() });
    }
    return filtered_mobs_to_ping(db, mobs, ping_history);
}

async function check_bounty_message(message) {
    const db = message.client.drip_db;

    if (!message.content.includes('LVL'))
        return;

    const message_arr = message.content.split('\n');
    if (message_arr.length <= 0) {
        return;
    }

    //////MessageProcessor
    const ping_history = await db.get_bounty_ping_history();                                                // [ { mob: mob_name, timestamp: iso_string } ]
    const mobs_to_ping = await get_mobs(db, message_arr, ping_history);                                     // [ mob, mob, mob ]
    if (mobs_to_ping.length == 0) return;

    const bounties_followed = message.client.Users.get_bounties_followed();                                 // [ [id, mob], [id, mob] ]
    const user_mob_ping_list = await get_user_mob_ping_list(bounties_followed, mobs_to_ping);               // [ [id, mob], [id, mob] ]
    if (user_mob_ping_list.length == 0) return;

    const channel = message.client.channels.cache.get(message.channelId);

    const users_to_ping = new Set(user_mob_ping_list.map(i => i[0]));

    for (const user of users_to_ping) {
        if (user == message.author.id) continue;                     // No self pings
        if (!message.client.Users.get_user(user).active) continue;   // Don't ping inactives
        const mob_list = user_mob_ping_list.filter(i => i[0] == user).map(i => i[1]);

        let str = '<@' + user + '> ';
        str += mob_list.join(', ');

        try {
            channel.send(str);
        } catch (err) {
            console.log(`Failed to ping ${id} in channel ${message.channelId}`);
            console.log(err);
        }
    }
}

module.exports = {
    check_bounty_message
}