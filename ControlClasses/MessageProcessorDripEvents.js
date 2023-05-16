const ItemDrops = require('../EntityClasses/ItemDrops.js');
const datetime_methods = require('../utils/datetime_methods.js');

class MessageProcessorDripEvents {
    #ping_controller;
    #item_drops;

    constructor(ping_controller, db) {
        this.#ping_controller = ping_controller;
        this.#item_drops = new ItemDrops(db);
    }

    async init() {
        await this.#item_drops.init();
    }

    async check_blace_frenzy(message) {
        let name;
        if (message.content.includes("Event: Ace appeared in the Arctic Ruins!"))
            name = 'Ace';
        else if (message.content.includes("Event: Blaze appeared in the Ashlands!"))
            name = 'Blaze';
        else
            return;

        const content = 'Select ' + name + ' HP/Color';
        const role_id = message.client.Channels.get_role_id('frenzy', 'drip');

        this.#ping_controller.add_ping(null, role_id, message.channel.id, message.id,
            content, 'blace', Date.now(), null);
    }

    async check_aura_message(message) {
        if (!message.content.includes("] Global")
            || !message.content.includes("Dragon Tokens to Diabolos")
            || !message.content.includes("of Diabolic Aura."))
            return;

        const content = 'woo diabolic aura';
        const role_id = message.client.Channels.get_role_id('aura', 'drip');

        this.#ping_controller.add_ping(null, role_id, message.channel.id, message.id,
            content, 'dt_aura', null, null);
    }

    async check_dt_frenzy_message(message) {
        if (!message.content.includes("] Global")
            || !message.content.includes("Frenzy in the Realm of Dragonrip!"))
            return;

        const content = ' Thanks Bizsterious Stranger!';
        const role_id = message.client.Channels.get_role_id('frenzy', 'drip');

        this.#ping_controller.add_ping(null, role_id, message.channel.id, message.id,
            content, 'dt_frenzy', null, null);
    }

    async check_event_message(message) {
        if (!message.content.includes("Event: Treant Elder appeared in the Reaper's Garden. [Reaper's Garden]")
            && !message.content.includes("Event: Quartz Titan appeared in the Azure Coastline. [Azure Coastline]")
            && !message.content.includes("Event: Pumpkin King appeared in the Pumpkin Field. [Pumpkin Field]")
            && !message.content.includes("Event: Snowman appeared in the Ice Plains. [Ice Plains]")
        )
            return;

        const name = message.content.split('Event: ')[1].split(' appeared in the')[0];

        let type;
        switch (name) {
            case 'Treant Elder': type = 'treant'; break;
            case 'Quartz Titan': type = 'quartz_titan'; break;
            case 'Pumpkin King': type = 'pumpkin'; break;
            case 'Snowman': default: type = 'snowman'; break;
        }

        const content = name;
        const role_id = message.client.Channels.get_role_id('event', 'drip');

        this.#ping_controller.add_ping(null, role_id, message.channel.id, message.id,
            content, type, Date.now(), null);
    }

    async check_hell_message(message) {
        if (!message.content.includes("Event: Gates of Hell will open in 10 minutes")
            || message.content.indexOf('[') != 0)
            return;

        const global_str = this.#get_global_line_from_multi_line_ping(message);
        const event_notification_time = new Date(datetime_methods.parse_global_timestamp(global_str));
        const wait_time = event_notification_time.getTime() + 10 * 60 * 1000 - Date.now();
        let hell_open_time = new Date();
        hell_open_time.setMilliseconds(hell_open_time.getMilliseconds() + wait_time);

        const content = ' opening in ' + Math.round(wait_time / 1000 / 60 * 10) / 10 + ' minutes';
        const role_id = message.client.Channels.get_role_id('hell', 'drip');

        this.#ping_controller.add_ping(null, role_id, message.channel.id, message.id,
            content, 'hell', hell_open_time.toISOString(), null);
    }

    async check_soulhounds_message(message) {
        const role_id = message.client.Channels.get_role_id('soulhounds', 'drip');

        if (message.content.includes('] Global: Soulhounds appeared in the Hades!')) {
            const global_str = this.#get_global_line_from_multi_line_ping(message);
            const soulhound_spawn_time = new Date(datetime_methods.parse_global_timestamp(global_str));
            const minutes_ago = Math.round((Date.now() - soulhound_spawn_time.getTime()) / 1000 / 60);

            const content = 'spawned ' + minutes_ago + ' minutes ago';

            this.#ping_controller.add_ping(null, role_id, message.channel.id, message.id,
                content, 'soulhounds', soulhound_spawn_time.toISOString(), null);

        } else if (message.content.includes('Soulhounds ravaging the Hades...')) {
            let content;
            let str_arr = message.content.split('\n');
            for (const s of str_arr) {
                if (s.includes('Soulhounds ravaging the Hades...')) {
                    content = s;
                    break;
                }
            }

            this.#ping_controller.add_ping(null, role_id, message.channel.id, message.id,
                content, 'soulhounds', null, null);

        } else if (message.content.includes('No Soulhounds to be seen...') && message.content.includes('Last time appeared: ')) {
            const milliseconds = datetime_methods.parse_drip_time_string(message.content.split('\n'));
            const soulhound_spawn_time = new Date();
            soulhound_spawn_time.setMilliseconds(soulhound_spawn_time.getUTCMilliseconds() - milliseconds);

            const content = 'Soulhound respawn time updated';

            this.#ping_controller.add_ping(null, null, message.channel.id, message.id,
                content, 'soulhounds', soulhound_spawn_time.toISOString(), null);
        }
    }

    async check_drops_message(message) {
        if (!message.content.includes("Global: "))
            return;

        let global_str = this.#get_global_line_from_multi_line_ping(message);

        if (!(message.content.includes("killed") && message.content.includes("and obtained")) &&
            !(message.content.includes("Treasure and obtained")) &&
            !(message.content.includes("completed") && message.content.includes("Bounty") && message.content.includes("and obtained"))
        ) {
            return;
        }

        this.#item_drops.add_item_drop(global_str);

        const username = this.#get_username_from_global_string(global_str);

        const luck_sack = await message.client.Users.get_user_by_drip_username(username);
        const hiro = await message.client.Users.get_user_by_drip_username('Hiro');
        const chronos = await message.client.Users.get_user_by_drip_username('Chronos');

        let content;
        if (hiro && username == 'Hiro') {
            content = "Congrats," + '<@' + hiro.discord_id + '>! ' + "Finally found something on your main account!!?!!";
        } else if (chronos && username == "Chronos") {
            content = "Congrats," + '<@' + chronos.discord_id + '>! ' + "You deserve it more than anyone else here!";
        } else if (luck_sack) {
            content = "Congrats," + '<@' + luck_sack.discord_id + '>! ' + "Awesome, someone here other than a Hiro multi found something!!";
        } else if (hiro) {
            content = "Congrats," + '<@' + hiro.discord_id + '>! ' + "That's one of your multis, right?";
        } else {
            content = "Looks like someone found an item, but Chronos's programming failed and idk how to ping Hiro for it.";
        }

        this.#ping_controller.add_ping(null, null, message.channel.id, message.id,
            content, 'item_drop', null, null);
    }

    #get_global_line_from_multi_line_ping(message) {
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

    #get_username_from_global_string(str) {
        const str_arr = str.split(' ');
        const index = str_arr.indexOf('Global:') + 1;
        return index === 0 ? null : index;
    }
}

module.exports = MessageProcessorDripEvents;