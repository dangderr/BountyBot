const db_access = require('../../database/db_access.js');
const datetime_methods = require('../../utils/datetime_methods.js');
const wait = require('node:timers/promises').setTimeout;

async function replanting_timer(message, delay) {
    const channel = message.client.channels.cache.get(message.channelId);
    let replanting_reminder_delay = 20 * 60 * 1000 + 5000;

    await wait(delay + replanting_reminder_delay);

    let current_time = new Date().getTime();
    let timestamp = new Date(await db_access.get_user_ping_timer(message.client.db, message.author.id, 'replanted')).getTime();

    console.log(current_time + " " + timestamp);
    console.log(current_time > timestamp);
    if (current_time > timestamp) {
        str = '<@' + message.author.id + '>' + ' You forgot to ask me to ping for herbalism. Did you forget to replant?';
        channel.send(str);
    }
}

async function check_ping_message(message) {
    let replies = ['k', 'aight', 'i gotchu', 'sure if i remember', 'maybe later', 'lol gl with that thoughts and prayers', 'u gonna ignore the ping anyways...', 'sure sure sure', 'you even gonna be awake?'];
    let reply_index = Math.floor(Math.random() * replies.length);

    try {
        const db = message.client.db;
        const user = message.author;

        if (!(await db_access.check_user_is_in_db(db, user.id))) {
            await db_access.add_user(db, user.id, user.username, null);
        }

        let str;
        let message_arr = message.content.split('\n');
        let delay = datetime_methods.parse_drip_time_string(message_arr);
        let timestamp = new Date();
        
        if (message.content.includes("is still growing!")) {
            if (message_arr.length < 2) return;
            str = '<@' + user.id + '>' + ' Pick your plants.';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db_access.set_user_ping_timer(db, user.id, 'planting', timestamp.toISOString());

            timestamp.setMilliseconds(timestamp.getMilliseconds() + 20 * 60 * 1000);
            db_access.set_user_ping_timer(db, user.id, 'replanted', timestamp.toISOString());
            replanting_timer(message, delay);
        }
        else if (message.content.includes("will be able to drink in:")) {
            if (message_arr.length < 2) return;
            delay += 60 * 1000; //Add a minute because of cauldron timer imprecision
            str = '<@' + user.id + '>' + ' Your cauldron is ready now.';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db_access.set_user_ping_timer(db, user.id, 'cauldron', timestamp.toISOString());
        }
        else if (message.content.includes("have successfully started to rise") || message.content.includes("are rising from the Dead!")) {
            if (message_arr.length < 2) return;
            str = '<@' + user.id + '>' + ' Yo, time to check Hades.';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db_access.set_user_ping_timer(db, user.id, 'hell_training', timestamp.toISOString());
        }
        else if (message.content.includes("Wild Captcha Event in:")) {
            if (message_arr.length < 2) return;
            delay -= (29 * 60 * 1000);
            if (delay <= 0) {
                message.reply('Maybe just do your botcheck now...');
                return;
            }
            str = '<@' + user.id + '>' + ' Botcheck within half an hour.';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db_access.set_user_ping_timer(db, user.id, 'botcheck', timestamp.toISOString());
        }
        else if (message.content.includes("Your Pet is Exploring")) {
            str = '<@' + user.id + '>' + ' Your pet is done exploring.';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db_access.set_user_ping_timer(db, user.id, 'pet_exploration', timestamp.toISOString());
        }
        else if (message.content.includes("Your Pet is Training.")) {
            str = '<@' + user.id + '>' + ' Your pet is done training.';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db_access.set_user_ping_timer(db, user.id, 'pet_training', timestamp.toISOString());
        }
        else if (message.content.includes("Time left: ")) {
            if (message_arr.length > 1) {
                str = '<@' + user.id + '>' + "Not sure why I'm pinging you. Maybe it was for: " + message_arr[0] + "\nBut I ain't an AI bot so idk";
            }
            else {
                str = '<@' + user.id + '>' + ' Why am I pinging you again? Prolly aint important.';
            }
        }
        else {
            return;
        }

        if (delay <= 0) {
            message.reply('Something went wrong, idk what time to ping you.');
            return;
        }
        else {
            const channel = message.client.channels.cache.get(message.channelId);
            message.reply(replies[reply_index]);
            await wait(delay);
            channel.send(str);
        }
    }
    catch (err) {
        console.log('Error in processing ping timer');
        console.log(err);
        console.log(message);
    }
}

async function restart_ping_timers(client) {
    const channel_id = (await db_access.get_channel_id(client.db, 'spit-bot', 'drip')).channel_id;
    const channel = await client.channels.fetch(channel_id);

    const ping_timer_table = await db_access.get_all_ping_timers(client.db);
    if (!ping_timer_table) return;

    const current_time = new Date();

    for (const ping_timer_row of ping_timer_table) {
        const discord_id = ping_timer_row.discord_id;
        for (const property in ping_timer_row) {
            if (!ping_timer_row[property]) continue;
            let console_message = `Restarted ${property} timer for ${discord_id}`;
            switch (property) {
                case 'discord_id': break;
                case 'botcheck': timer_restart_handler(channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' Botcheck within half an hour.', console_message); break;
                case 'cauldron': timer_restart_handler(channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' Your cauldron is ready now.', console_message); break;
                case 'planting': timer_restart_handler(channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' Pick your plants.', console_message); break;
                case 'pet_training': timer_restart_handler(channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' Your pet is done training.', console_message); break;
                case 'pet_exploration': timer_restart_handler(channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' Your pet is done exploring.', console_message); break;
                case 'hell_training': timer_restart_handler(channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' Yo, time to check Hades.', console_message); break;
                case 'replanted': replanting_timer_restart_handler(channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' You forgot to ask me to ping for herbalism. Did you forget to replant?', console_message); break;
                default:
            }
        }
    }

    restart_hell_timer(client);
}

async function timer_restart_handler(channel, current_time, ping_time_iso_string, str, console_message) {
    let delay = new Date(ping_time_iso_string).getTime() - current_time.getTime();
    if (delay < 0) return;
    console.log(console_message);
    await wait(delay);
    channel.send(str);
}

async function replanting_timer_restart_handler(channel, current_time, ping_time_iso_string, str, console_message) {
    let delay = new Date(ping_time_iso_string).getTime() - current_time.getTime();
    if (delay < 0) return;
    console.log(console_message);
    await wait(delay + 10000);

    let new_current_time = new Date().getTime();
    let timestamp = new Date(await db_access.get_user_ping_timer(message.client.db, message.author.id, 'replanted')).getTime();

    console.log(new_current_time + " " + timestamp);
    console.log(new_current_time > timestamp);
    if (new_current_time > timestamp) {
        channel.send(str);
    }
}

async function restart_hell_timer(client) {
    const db = client.db;
    const timestamp_iso = await db_access.get_event_timers_timestamp(db, 'hell');
    if (!timestamp_iso) return;

    const hell_open_time = new Date(timestamp_iso).getTime();
    const current_time = new Date().getTime();
    if (current_time > hell_open_time) return;

    const wait_time = hell_open_time - current_time;

    const channel_id = (await db_access.get_channel_id(client.db, 'llamainchat', 'drip')).channel_id;
    const channel = await client.channels.cache.get(channel_id);

    const role_id = await db_access.get_role_id(db, 'hell', 'drip');

    console.log('Restarted hell ping timer');

    await wait(wait_time);

    str = '<@&' + role_id + '> is open';
    channel.send(str);
}

module.exports = {
    check_ping_message,
    restart_ping_timers
}