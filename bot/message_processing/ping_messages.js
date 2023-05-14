const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const datetime_methods = require('../../utils/datetime_methods.js');
const wait = require('node:timers/promises').setTimeout;

async function check_ping_message(message) {
    let replies = ['k', 'aight', 'i gotchu', 'sure if i remember', 'maybe later', 'lol gl with that thoughts and prayers', 'u gonna ignore the ping anyways...', 'sure sure sure', 'you even gonna be awake?'];
    let reply_index = Math.floor(Math.random() * replies.length);

    try {
        const db = message.client.drip_db;
        const user = message.User;

        let str;
        let message_arr = message.content.split('\n');
        let delay = datetime_methods.parse_drip_time_string(message_arr);
        let timestamp = new Date();
        
        if (message.content.includes("is still growing!")) {

            if (delay <= 0) {
                message.reply('Something went wrong, idk what time to ping you.');
                return;
            } else {
                message.reply(replies[reply_index]);
            }

            planting_timer(message, message_arr, delay);
            return;
        } else if (message.content.includes("will be able to drink in:")) {
            if (message_arr.length < 2) return;
            delay += 60 * 1000; //Add a minute because of cauldron timer imprecision
            str = '<@' + user.discord_id  + '>' + ' Your cauldron is ready now.';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db.set_user_ping_timer(user.discord_id , 'cauldron', timestamp.toISOString());
        } else if (message.content.includes("have successfully started to rise") || message.content.includes("are rising from the Dead!")) {
            if (message_arr.length < 2) return;
            str = '<@' + user.discord_id  + '>' + ' Yo, time to check Hades.';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db.set_user_ping_timer(user.discord_id , 'hades_training', timestamp.toISOString());
        } else if (message.content.includes("Wild Captcha Event in:")) {
            if (message_arr.length < 2) return;
            delay -= (29 * 60 * 1000);
            if (delay <= 0) {
                message.reply('Maybe just do your botcheck now...');
                return;
            }
            str = '<@' + user.discord_id  + '>' + ' Botcheck within half an hour.';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db.set_user_ping_timer(user.discord_id , 'botcheck', timestamp.toISOString());
        } else if (message.content.includes("Your Pet is Exploring")) {
            str = '<@' + user.discord_id  + '>' + ' Your pet is done exploring.';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db.set_user_ping_timer(user.discord_id , 'pet_exploration', timestamp.toISOString());
        } else if (message.content.includes("Your Pet is Training.")) {
            str = '<@' + user.discord_id  + '>' + ' Your pet is done training.';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db.set_user_ping_timer(user.discord_id , 'pet_training', timestamp.toISOString());
        } else if (message.content.includes('Soulhounds ravaging the Hades...') && message.content.includes("You can't attack for:")) {
            str = '<@' + user.discord_id  + '>' + ' You can attack Soulhounds again.';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db.set_user_ping_timer(user.discord_id , 'soulhounds', timestamp.toISOString());
        } else if (message.content.includes('Attack the others and take their Dark Crystals!') && message.content.includes("You can't attack for:")) {
            str = '<@' + user.discord_id  + '>' + ' Your Hades attack timer is up.';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db.set_user_ping_timer(user.discord_id , 'hades_attack', timestamp.toISOString());
        } else if (message.content.includes('Undead Dragon will appear in:')) {
            str = '<@' + user.discord_id  + '>' + ' AHHHH DRAAGGGONNNN';
            timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
            db.set_user_ping_timer(user.discord_id , 'hades_dragon', timestamp.toISOString());
        } else if (message.content.includes("Time left: ")) {
            str = '<@' + user.discord_id  + '>' + ' Why am I pinging you again? Prolly aint important.';
        } else {
            return;
        }

        if (delay <= 0) {
            message.reply('Something went wrong, idk what time to ping you.');
            return;
        } else {
            message.reply(replies[reply_index]);

            await wait(delay);
            if (!user.active) return;

            message.reply(str);
        }
    }
    catch (err) {
        console.log('Error in processing ping timer');
        console.log(err);
        console.log(message);
    }
}

async function planting_timer(message, message_arr, delay) {
    const db = message.client.drip_db;
    const user = message.User;
    const timestamp = new Date();

    if (message_arr.length < 2) return;
    timestamp.setMilliseconds(timestamp.getMilliseconds() + delay);
    db.set_user_ping_timer(user.discord_id, 'planting', timestamp.toISOString());

    timestamp.setMilliseconds(timestamp.getMilliseconds() + 20 * 60 * 1000);
    db.set_user_ping_timer(user.discord_id, 'replanted', timestamp.toISOString());
    replanting_timer(message, delay);

    await wait(delay);
    if (!user.active) return;

    let str = '<@' + user.discord_id + '>' + ' Pick your plants.';

    const replant_button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('Replanted')
                .setLabel('Replanted')
                .setStyle(ButtonStyle.Success)
        );

    const bot_message = await message.reply({ content: str, components: [replant_button] });

    const filter = i => i.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({ filter, time: 1000 * 60 * 5, max: 1 });

    let replanted = false;
    collector.on('end', collector => { });
    collector.on('collect', async i => {
        const minutes = Math.round(delay / 1000 / 60 * 10) / 10;
        try {
            await i.update({ content: 'Your planting timer was restarted for ' + minutes + ' minutes', components: [] });
            replanted = true;
            planting_timer(message, message_arr, delay, timestamp);
        }
        catch (err) {
            console.log('Error in replanting button update');
            console.log(err);
        }
    });

    await wait(1000 * 60 * 5);
    if (!replanted) {
        bot_message.edit({ content: str, components: [] });
    }
}

async function replanting_timer(message, delay) {
    const channel = message.client.channels.cache.get(message.channelId);
    const db = message.client.drip_db;
    const user = message.User;

    let replanting_reminder_delay = 20 * 60 * 1000 + 5000;

    await wait(delay + replanting_reminder_delay);
    if (!user.active) return;

    let current_time = new Date().getTime();
    let timestamp = new Date((await db.get_user_ping_timer(user.discord_id, 'replanted')).replanted).getTime();

    if (current_time > timestamp) {
        str = '<@' + message.author.id + '>' + ' You forgot to ask me to ping for herbalism. Did you forget to replant?';
        channel.send(str);
    }
}


async function restart_ping_timers(client) {
    const db = client.drip_db;
    const channel = client.Channels.get_channel_by_name_server('spit-bot', 'drip');

    const ping_timer_table = await db.get_all_ping_timers();
    if (!ping_timer_table) return;

    const current_time = new Date();

    for (const ping_timer_row of ping_timer_table) {
        const discord_id = ping_timer_row.discord_id;
        const user = client.Users.get_user(discord_id);
        for (const property in ping_timer_row) {
            if (!ping_timer_row[property]) continue;
            let console_message = `Restarted ${property} timer for ${discord_id}`;
            switch (property) {
                case 'discord_id': break;
                case 'botcheck': timer_restart_handler(user, channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' Botcheck within half an hour.', console_message); break;
                case 'cauldron': timer_restart_handler(user, channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' Your cauldron is ready now.', console_message); break;
                case 'planting': timer_restart_handler(user, channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' Pick your plants.', console_message); break;
                case 'pet_training': timer_restart_handler(user, channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' Your pet is done training.', console_message); break;
                case 'pet_exploration': timer_restart_handler(user, channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' Your pet is done exploring.', console_message); break;
                case 'hades_training': timer_restart_handler(user, channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' Yo, time to check Hades.', console_message); break;
                case 'soulhounds': timer_restart_handler(user, channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' You can attack Soulhounds again.', console_message); break;
                case 'hades_attack': timer_restart_handler(user, channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' Your Hades attack timer is up.', console_message); break;
                case 'hades_dragon': timer_restart_handler(user, channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' AHHHH DRAAGGGONNNN', console_message); break;
                case 'replanted': replanting_timer_restart_handler(user, client, channel, current_time, ping_timer_row[property], '<@' + discord_id + '>' + ' You forgot to ask me to ping for herbalism. Did you forget to replant?', console_message); break;
                default:
            }
        }
    }

    restart_hell_timer(client);
}

async function timer_restart_handler(user, channel, current_time, ping_time_iso_string, str, console_message) {
    let delay = new Date(ping_time_iso_string).getTime() - current_time.getTime();
    if (delay < 0) return;
    console.log(console_message);

    await wait(delay);
    if (!user.active) return;

    channel.channel.send(str);
}

async function replanting_timer_restart_handler(user, client, channel, current_time, ping_time_iso_string, str, console_message) {
    const db = client.drip_db;
    let delay = new Date(ping_time_iso_string).getTime() - current_time.getTime();
    if (delay < 0) return;
    console.log(console_message);

    await wait(delay + 10000);
    if (!user.active) return;

    let new_current_time = new Date().getTime();
    let timestamp = new Date((await db.get_user_ping_timer(user.discord_id, 'replanted')).replanted).getTime();

    if (new_current_time > timestamp) {
        channel.channel.send(str);
    }
}

async function restart_hell_timer(client) {
    const db = client.drip_db;
    const timestamp_obj = await db.get_event_timers_timestamp('hell');
    if (!timestamp_obj) return;
    const timestamp_iso = timestamp_obj.timestamp;

    const hell_open_time = new Date(timestamp_iso).getTime();
    const current_time = new Date().getTime();
    if (current_time > hell_open_time) return;

    const wait_time = hell_open_time - current_time;

    const channel_id = (await db.get_channel_id('llamainchat', 'drip')).channel_id;
    const channel = await client.channels.cache.get(channel_id);

    const role_id = client.Channels.get_role_id('hell', 'drip');
    

    console.log('Restarted hell ping timer');

    await wait(wait_time);

    str = '<@&' + role_id + '> is open';
    channel.send(str);
}

module.exports = {
    check_ping_message,
    restart_ping_timers
}