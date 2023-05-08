async function check_amar_storm_message(message) {
    const db = message.client.drip_db;

    try {
        let role_id;
        let location;
        let time_str;

        if (message.content.includes("Time to grab a kite, a thunderstorm is rolling into")) {
            role_id = (await db.get_role_id('thunderstorm', 'amar')).role_id;
            location = message.content.split(" into ")[1];
            time_str = message.content.split(' Time to grab')[0];
        }
        else if (message.content.includes("A rainbow emerges as a light rain begins to fall in")) {
            role_id = (await db.get_role_id('event', 'amar')).role_id;
            location = message.content.split(" fall in ")[1];
            time_str = message.content.split(' A rainbow emerges')[0];
        }
        else {
            return;
        }

        if (!role_id) {
            console.log('Error in getting role ID');
            return;
        }

        const time_arr = time_str.split(':');
        const current_time = new Date();

        let minutes_ago = current_time.getUTCHours() - time_arr[0];
        minutes_ago *= 60;
        minutes_ago += (current_time.getUTCMinutes() - time_arr[1]);
        if (current_time.getUTCHours() < time_arr[0]) {     //Correction if ping occurs on a new day
            minutes_ago += 24 * 60;
        }

        let str = "<@&" + role_id + "> " + minutes_ago + " minutes ago at " + location;
        if (current_time > 60) {
            str += '\nWait ' + minutes_ago + ' minutes ago?!? That\'s a long time... Maybe someone tell Chronos to double check his math.';
        } else if (current_time < 0) {
            str += '\nWait ' + minutes_ago + ' minutes ago?!? Is that negative time?!? Only Chronos could do that...';
        }
        const channel = message.client.channels.cache.get(message.channelId);
        channel.send(str);
    }
    catch (err) {
        console.log('Error in processing Amar Storm Notification');
        console.log(err);
    }
}

module.exports = {
    check_amar_storm_message
}