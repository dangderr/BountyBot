const db_access = require('../../database/db_access.js');
const datetime_methods = require('../../utils/datetime_methods.js');

async function get_users_to_ping(db, bounties_followed_table, mobs_to_ping) {
    const users_to_ping = new Array();
    const unique_users = [...new Set(bounties_followed_table.map(i => i.discord_id))];                                  // [ user_id, user_id, user_id ]

    const bountydone_arr = await db_access.get_bountydone(db);                                                          // [ { discord_id: text, bountydone: iso_string } ]
    const bountydone = new Array();                                                                                     // [ discord_id ]
    for (const obj of bountydone_arr) {
        if (datetime_methods.check_same_day(Date.now(), obj.bountydone)) {
            bountydone.push(obj.discord_id);
        }
    }
    
    for (const user of unique_users) {
        if (bountydone.includes(user)) {
            continue;
        }
        const activehours = await db_access.get_active_hours(db, user);
        if (!datetime_methods.check_active_time(activehours.activehoursstart, activehours.activehoursend)) continue;

        const users_bounties_followed = bounties_followed_table.filter(i => i.discord_id == user).map(i => i.mob);      // [ mob, mob, mob ]
        let current_user_mob_ping_list = new Array();
        for (const mob of mobs_to_ping) {
            if (users_bounties_followed.includes(mob)) current_user_mob_ping_list.push(mob);
        }
        if (current_user_mob_ping_list.length > 0) users_to_ping.push({ discord_id: user, mob_list: current_user_mob_ping_list });
    }

    return users_to_ping;
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
        db_access.add_bounty_ping_history(db, mob_to_ping.mob, mob_to_ping.timestamp);
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
    if (!message.content.includes('LVL'))
        return;

    const message_arr = message.content.split('\n');
    if (message_arr.length <= 0) {
        return;
    }
    const db = message.client.db;

    const ping_history = await db_access.get_bounty_ping_history(db);       // [ { mob: mob_name, timestamp: iso_string } ]
    const mobs_to_ping = await get_mobs(db, message_arr, ping_history);           // [ mob, mob, mob ]
    if (mobs_to_ping.length == 0) return;

    const bounties_followed_table = await db_access.get_bounties_followed_table(db);                        // [ { discord_id: text, mob: text } ]
    const users_to_ping = await get_users_to_ping(db, bounties_followed_table, mobs_to_ping);               // [ { discord_id: text, mob_list: [ mob, mob, mob ] } ]
    if (users_to_ping.length == 0) return;

    const channel = message.client.channels.cache.get(message.channelId);

    for (const user of users_to_ping) {                                     // { discord_id: text, mob_list: [ mob, mob, mob ] }
        if (user.discord_id == message.author.id) continue;                 // No self pings

        let str = '<@' + user.discord_id + '> ';
        str += user.mob_list.join(', ');

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