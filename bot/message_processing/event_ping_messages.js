const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const datetime_methods = require('../../utils/datetime_methods.js');
const wait = require('node:timers/promises').setTimeout;

async function check_double_ping(db, category) {
    const last_ping_obj = await db.get_event_timers_timestamp(category);
    const last_ping_timestamp = (last_ping_obj.length > 0) ? last_ping_obj.timestamp : null;
    return datetime_methods.check_for_double_ping(last_ping_timestamp);
}

async function build_blace_buttons() {
    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('10')
                .setLabel('400/White')
                .setStyle(ButtonStyle.Secondary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('20')
                .setLabel('500/Green')
                .setStyle(ButtonStyle.Success)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('30')
                .setLabel('600/Blue')
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('45')
                .setLabel('700/Purple')
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('60')
                .setLabel('800/Red')
                .setStyle(ButtonStyle.Danger)
        );
    return buttons;
}

async function create_blace_button_collector(db, message) {
    //const filter = i => i.user.id === message.author.id;
    //const collector = message.channel.createMessageComponentCollector({ filter, time: 5000 });
    const collector = message.channel.createMessageComponentCollector({ time: 60000, max: 1 });

    collector.on('end', collector => { });
    collector.on('collect', async i => {
        const time = i.component.customId;

        const replies = ['bro', 'dude', 'clock', 'babe', 'man', 'dawg', 'homie', 'honey', 'Allah'];
        const reply_index = Math.floor(Math.random() * replies.length);
        messageReply = 'Thanks, ' + replies[reply_index];

        try {
            await i.update({ content: messageReply, components: [] });
            const frenzy_role_id = (await db.get_role_id('frenzy', 'drip')).role_id;

            const str = '<@&' + frenzy_role_id + '> ' + time + " mins from Blaze/Ace";
            const channel = message.client.channels.cache.get(message.channelId);
            channel.send(str);
        }
        catch (err) {
            console.log('Error in frenzy button update');
            console.log(err);
        }
    });
}

async function check_blace_frenzy(message) {

    try {
        let name;
        if (message.content.includes("Event: Ace appeared in the Arctic Ruins!"))
            name = 'Ace';
        else if (message.content.includes("Event: Blaze appeared in the Ashlands!"))
            name = 'Blaze';
        else
            return;

        const db = message.client.drip_db;

        if (await check_double_ping(db, 'blace')) return;

        const buttons = await build_blace_buttons();

        let messageReply = 'Select ' + name + ' HP/Color';
        await message.reply({ content: messageReply, components: [buttons] });

        create_blace_button_collector(db, message);

        const current_time = new Date();
        db.set_event_timers_timestamp('blace', current_time.toISOString());
    }
    catch (err) {
        console.log('Error in processing Blaze/Ace Frenzy Notification');
        console.log(err);
    }
}

function get_username_from_global_string(str) {
    const str_arr = str.split(' ');
    const index = str_arr.indexOf('Global:') + 1;
    return index === 0 ? null : index;
}

function get_global_line_from_multi_line_ping(message) {
    const message_arr = message.content.split('\n');
    let global_str = message_arr[0];
    for (const line of message_arr) {
        if (line.includes(' Global: ') || line.includes(' Event: ')) {
            global_str = line;
            break;
        }
    }
    return global_str;
}

async function check_drops_message(message) {
    try {
        if (!message.content.includes("Global: "))
            return;

        const db = message.client.drip_db;

        let global_str = get_global_line_from_multi_line_ping(message);
        db.add_item_drop(global_str);

        if ((message.content.includes("killed") && message.content.includes("and obtained")) ||
            (message.content.includes("Treasure and obtained")) ||
            (message.content.includes("completed") && message.content.includes("Bounty") && message.content.includes("and obtained"))
        ) {
            const username = get_username_from_global_string(global_str);
            const user_obj = (await db.get_discord_id_from_drip_name(username));
            const hiro_obj = (await db.get_discord_id_from_drip_name('Hiro'));
            const chronos_obj = (await db.get_discord_id_from_drip_name('Chronos'));

            let str = "";
            if (hiro_obj && message.content.includes("Hiro")) {
                str = "Congrats," + '<@' + hiro_obj.discord_id + '>! ' + "Finally found something on your main account!!?!!";
            } else if (chronos_obj && message.content.includes("Chronos")) {
                str = "Congrats," + '<@' + chronos_obj.discord_id + '>! ' + "You deserve it more than anyone else here!";
            } else if (user_obj) {
                str = "Congrats," + '<@' + user_obj.discord_id + '>! ' + "Awesome, someone here other than a Hiro multi found something!!";
            } else if (hiro_obj) {
                str = "Congrats," + '<@' + hiro_obj.discord_id + '>! ' + "That's one of your multis, right?";
            } else {
                str = "Looks like someone found an item, but Chronos's programming failed and idk how to ping Hiro for it.";
            }

            const channel = message.client.channels.cache.get(message.channelId);
            channel.send(str);
            console.log(str);
        }
    }
    catch (err) {
        console.log('Error in processing drop notification');
        console.log(err);
    }
}

async function check_aura_message(message) {
    try {
        if (!message.content.includes("] Global") || !message.content.includes("Dragon Tokens to Diabolos") || !message.content.includes("of Diabolic Aura."))
            return;

        const channel = message.client.channels.cache.get(message.channelId);
        const db = message.client.drip_db;
        if (await check_double_ping(db, 'dt_aura')) return;

        const role_id = (await db.get_role_id('aura', 'drip')).role_id;

        str = '<@&' + role_id + '>' + message.content;
        channel.send(str);

        const current_time = new Date();
        db.set_event_timers_timestamp('dt_aura', current_time.toISOString());
    }
    catch (err) {
        console.log('Error in processing Aura Notification');
        console.log(err);
    }
}

async function check_dt_frenzy_message(message) {
    try {
        if (!message.content.includes("] Global") || !message.content.includes("Frenzy in the Realm of Dragonrip!"))
            return;

        const channel = message.client.channels.cache.get(message.channelId);
        const db = message.client.drip_db;
        if (await check_double_ping(db, 'dt_frenzy')) return;

        const role_id = await db.get_role_id('frenzy', 'drip').role_id;

        str = '<@&' + role_id + '>' + message.content;
        channel.send(str);

        const current_time = new Date();
        db.set_event_timers_timestamp('dt_frenzy', current_time.toISOString());
    }
    catch (err) {
        console.log('Error in processing DT Frenzy Notification');
        console.log(err);
    }
}

async function check_event_message(message) {
    try {
        if (!message.content.includes("Event: Snowman appeared in the Ice Plains. [Ice Plains]") &&
            !message.content.includes("Event: Treant Elder appeared in the Reaper's Garden. [Reaper's Garden]")
        )
            return;

        const channel = message.client.channels.cache.get(message.channelId);
        const db = message.client.drip_db;
        if (await check_double_ping(db, 'event')) return;

        const role_id = await db.get_role_id('event', 'drip').role_id;

        str = '<@&' + role_id + '>';
        channel.send(str);

        const current_time = new Date();
        db.set_event_timers_timestamp('event', current_time.toISOString());
    }
    catch (err) {
        console.log('Error in processing Event Notification');
        console.log(err);
    }
}

async function hell_open_ping(wait_time, role_id, channel) {
    await wait(wait_time);

    str = '<@&' + role_id + '> is open';
    channel.send(str);
}

async function check_hell_message(message) {
    try {
        if (!message.content.includes("Event: Gates of Hell will open in 10 minutes") || message.content.indexOf('[') != 0)
            return;

        const channel = message.client.channels.cache.get(message.channelId);
        const db = message.client.drip_db;
        if (await check_double_ping(db, 'hell', 15)) return;

        const role_id = await db.get_role_id('hell', 'drip').role_id;

        const global_str = get_global_line_from_multi_line_ping(message);
        const event_notification_time = new Date(datetime_methods.parse_global_timestamp(global_str));

        let wait_time = event_notification_time.getTime() + 10 * 60 * 1000 - Date.now();

        let hell_open_time = new Date();
        hell_open_time.setMilliseconds(hell_open_time.getMilliseconds() + wait_time);
        db.set_event_timers_timestamp('hell', hell_open_time.toISOString());

        let str = '<@&' + role_id + '> opening in ' + Math.round(wait_time / 1000 / 60 * 10) / 10 + ' minutes';
        channel.send(str);

        hell_open_ping(wait_time, role_id, channel);
    }
    catch (err) {
        console.log('Error in processing Hell Notification');
        console.log(err);
    }
}

module.exports = {
    check_blace_frenzy,
    check_drops_message,
    check_aura_message,
    check_dt_frenzy_message,
    check_event_message,
    check_hell_message
}