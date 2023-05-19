const wait = require('node:timers/promises').setTimeout;
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Component } = require('discord.js');
const datetime_methods = require('../utils/datetime_methods.js');

class PingScheduler {
    #ping_controller;
    #MAX_COMPONENT_TIMER = 1000 * 60 * 15;           //15 minutes
    #users;
    #channels;
    #data;
    #globals;

    #logger;

    constructor(ping_controller, client) {
        this.#ping_controller = ping_controller;
        this.#users = client.Users;
        this.#channels = client.Channels;
        this.#data = client.Data;
        this.#globals = client.GlobalSettings;

        this.#logger = true;
    }

    log(ping) {
        if (this.#logger) {
            const time_remaining = (new Date(ping.timestamp).getTime() - Date.now()) / 1000;
            console.log(`[${new Date().toISOString()}] PingScheduler: ${ping.id} ${ping.user_id} ${ping.type} ${time_remaining} [${new Date(ping.timestamp).toISOString()}]`);
        }
    }

    async send_to_channel(ping, timestamp, channel, content, components) {
        this.log(ping);
        if (!await this.process_delay(ping.id, timestamp)) {
            return;
        }

        if (!components) {
            channel.send(content);
            return;
        }
         
        //channel.send({ content: content, components: components });

        //Start some collector here??
        //What type of channel.send pings will need a collector?
    }

    async reply_to_message(ping, timestamp, message, content, components) {
        this.log(ping);
        if (!await this.process_delay(ping.id, timestamp)) {
            return;
        }

        if (!components) {
            message.reply(content);
            return;
        }

        let component_array = new Array();
        this.#create_components(ping, components, component_array);

        const bot_message = await message.reply({ content: content, components: component_array.slice(0, 5) });

        this.#create_component_collectors(ping, message, bot_message, components);
    }

    #create_components(ping, types, arr) {
        for (const type of types) {
            switch (type) {
                case 'blace_buttons':
                    arr.push(new ActionRowBuilder()
                        .addComponents(new ButtonBuilder().setCustomId('10').setLabel('400/White').setStyle(ButtonStyle.Secondary))
                        .addComponents(new ButtonBuilder().setCustomId('20').setLabel('500/Green').setStyle(ButtonStyle.Success))
                        .addComponents(new ButtonBuilder().setCustomId('30').setLabel('600/Blue').setStyle(ButtonStyle.Primary))
                        .addComponents(new ButtonBuilder().setCustomId('45').setLabel('700/Purple').setStyle(ButtonStyle.Primary))
                        .addComponents(new ButtonBuilder().setCustomId('60').setLabel('800/Red').setStyle(ButtonStyle.Danger))
                    );
                    break;
                case 'herb':
                    this.#create_herb_restart_buttons(ping, arr);
                    break;
                case 'pet':
                    this.#create_pet_restart_buttons(ping, arr);
                    break;
                case 'restart_button':
                    if (new Date(ping.timestamp).getTime() > 1000) {
                        arr.push(new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('Restart').setLabel('Restart').setStyle(ButtonStyle.Success)));
                    }
                    break;
                default: return;
            }
        }
    }

    #create_pet_restart_buttons(ping, component_array) {
        const user = this.#users.get_user(ping.user_id);

        const BM_Level = user.get_user_setting('BM_Level') ?? 0;
        const pet_tile = this.#globals.get_global_setting('Pet_Tile') === 'true' ? 0.1 : 0;
        const timer_reduction = parseInt(BM_Level) / 300 + pet_tile;

        const BUTTONS_PER_ROW = 5;
        const MAX_ROWS = 5;
        let index = 0;
        let preexisting_rows = component_array.length;
        let row_index = preexisting_rows - 1;
        for (const training of this.#data.pet_trainings) {
            if (index >= BUTTONS_PER_ROW * (MAX_ROWS - preexisting_rows)) {
                return;
            }
            if (index % BUTTONS_PER_ROW == 0) {
                row_index++;
                component_array[row_index] = new ActionRowBuilder();
            }

            let minutes = training[1];
            if (training == 'Bonding' && user.get_user_setting('Dreagle') === 'true') {
                minutes -= 3;
            }
            minutes *= (1 - timer_reduction);

            const label = datetime_methods.get_time_str_from_hours(minutes / 60);
            component_array[row_index].addComponents(new ButtonBuilder().setCustomId(training[0]).setLabel(label).setStyle(ButtonStyle.Secondary));
            index++;
        }
        
        
        index = 0;
        preexisting_rows = component_array.length;
        row_index = preexisting_rows - 1;
        for (const training of this.#data.pet_trainings) {
            if (index >= BUTTONS_PER_ROW * (MAX_ROWS - preexisting_rows)) {
                return;
            }
            if (index % BUTTONS_PER_ROW == 0) {
                row_index++;
                component_array[row_index] = new ActionRowBuilder();
            }
            const label = datetime_methods.get_time_str_from_hours(training[1] * (1 - timer_reduction) / 60 / 2);
            component_array[row_index].addComponents(new ButtonBuilder().setCustomId(training[0] + '_imp').setLabel(label).setStyle(ButtonStyle.Danger));
            index++;
        }
    }

    #create_herb_restart_buttons(ping, component_array) {
        const user = this.#users.get_user(ping.user_id);
        if (!user.get_herbs() || user.get_herbs().length == 0) {
            return;
        }

        const BUTTONS_PER_ROW = 5;
        const MAX_ROWS = 5;
        let index = 0;
        let preexisting_rows = component_array.length;
        let row_index = preexisting_rows - 1;
        for (const herb of user.get_herbs()) {
            if (index >= BUTTONS_PER_ROW * (MAX_ROWS - preexisting_rows)) {
                return;
            }
            if (index % BUTTONS_PER_ROW == 0) {
                row_index++;
                component_array[row_index] = new ActionRowBuilder();
            }
            component_array[row_index].addComponents(new ButtonBuilder().setCustomId(herb).setLabel(herb).setStyle(ButtonStyle.Secondary));
            index++;
        }
    }

    async #create_component_collectors(ping, message, bot_message, types) {
        for (const type of types) {
            switch (type) {
                case 'blace_buttons':
                    this.#create_blace_button_collector(ping, bot_message);
                    break;
                case 'herb':
                    this.#create_herb_button_collector(ping, message, bot_message);
                    break;
                case 'pet':
                    this.#create_pet_button_collector(ping, message, bot_message);
                    break;
                case 'restart_button':
                    this.#create_restart_button_collector(ping, message, bot_message);
                    break;
                default:
            }
        }
    }

    async #create_pet_button_collector(ping, message, bot_message) {
        const user = this.#users.get_user(ping.user_id);
        const filter = (i => i.user.id === message.author.id);

        try {
            const i = await bot_message.awaitMessageComponent({
                filter: filter,
                componentType: ComponentType.Button,
                time: this.#MAX_COMPONENT_TIMER,
                max: 1
            });

            if (i.component.customId == 'Restart') {
                return;
            }

            let training = i.component.customId;
            const imp = training.includes('_imp');
            if(imp) training = training.replace('_imp', '');

            let minutes = this.#data.pet_trainings.find(i => i[0] == training)[1];
            const BM_Level = user.get_user_setting('BM_Level') ?? 0;
            const timer_reduction = parseInt(BM_Level) / 300;
            minutes *= (1 - timer_reduction);
            minutes /= (imp ? 2 : 1);

            const delay = minutes * 60 * 1000;
            const timestamp = new Date();
            timestamp.setUTCMilliseconds(timestamp.getUTCMilliseconds() + delay);

            await i.update({
                content: `${user.drip_username}, your timer was restarted for ${datetime_methods.get_time_str_from_hours(minutes / 60)} for ${training}`,
                components: []
            });
        } catch (err) {
            await bot_message.edit({ components: [] });
        }
    }

    async #create_herb_button_collector(ping, message, bot_message) {
        const user = this.#users.get_user(ping.user_id);
        const filter = (i => i.user.id === message.author.id);

        try {
            const i = await bot_message.awaitMessageComponent({
                filter: filter,
                componentType: ComponentType.Button,
                time: this.#MAX_COMPONENT_TIMER,
                max: 1
            })

            if (i.component.customId == 'Restart') {
                return;
            }

            const herb = i.component.customId;

            let minutes = this.#data.herbs.find(i => i[0] == herb)[1];
            const timer_reduction = user.get_herb_time_reduction();
            minutes *= (1 - timer_reduction.percent);
            minutes -= timer_reduction.flat;
            minutes = Math.round(minutes * 10) / 10;

            const delay = minutes * 60 * 1000;
            const timestamp = new Date();
            timestamp.setUTCMilliseconds(timestamp.getUTCMilliseconds() + delay);

            await i.update({
                content: `${user.drip_username}, your timer was restarted for ${datetime_methods.get_time_str_from_hours(minutes / 60)} for ${herb}`,
                components: []
            });
            this.#ping_controller.add_ping(ping.user_id, null, message.channel.id, message.id,
                null, 'herbalism', timestamp.toISOString(), delay);
        } catch (err) {
            await bot_message.edit({ components: [] });
        }
    }

    async #create_restart_button_collector(ping, message, bot_message) {
        const user = this.#users.get_user(ping.user_id);
        const filter = (i => i.user.id === message.author.id);
        try {
            const i = await bot_message.awaitMessageComponent({
                filter: filter,
                componentType: ComponentType.Button,
                time: this.#MAX_COMPONENT_TIMER,
                max: 1
            })

            if (i.component.customId != 'Restart') {
                return;
            }

            let minutes = 0;

            if (ping.type == 'cauldron') {
                minutes = 60 * 4;           // 4 hour base time
                if (user.get_user_setting('Bat') === 'true')
                    minutes -= 6;
                if (user.get_user_setting('Mage_Class') === 'true')
                    minutes -= 10;
                const HH_Level = parseInt(user.get_user_setting('Hollowhead_Level') ?? 0);
                minutes -= HH_Level * 0.75;
            } else {
                minutes = ping.delay / 1000 / 60;
            }

            const content = `Your timer was restarted for ${datetime_methods.get_time_str_from_hours(minutes / 60)}`;
            await i.update({ content: content, components: [] });

            const delay = minutes * 60 * 1000;
            const timestamp = new Date();
            timestamp.setUTCMilliseconds(timestamp.getUTCMilliseconds() + delay);

            this.#ping_controller.add_ping(ping.user_id, null, message.channel.id, message.id,
                null, ping.type, timestamp.toISOString(), delay);
 
        } catch (err) {
            await bot_message.edit({ components: [] });
        }
    }

    async #create_blace_button_collector(ping, bot_message) {
        try {
            const i = await bot_message.awaitMessageComponent({
                componentType: ComponentType.Button,
                time: this.#MAX_COMPONENT_TIMER,
                max: 1
            })

            const time = i.component.customId;
            const replies = ['bro', 'dude', 'clock', 'babe', 'man', 'dawg', 'homie', 'honey', 'Allah'];
            const reply_index = Math.floor(Math.random() * replies.length);
            const message_reply = 'Thanks, ' + replies[reply_index];
            await i.update({ content: message_reply, components: [] });

            const role_id = this.#channels.get_role_id('frenzy', 'drip');
            const content = time + ' mins from Blaze/Ace';

            this.#ping_controller.add_ping(null, role_id, ping.channel_id, null, content, 'blace_ping', null, null);
        } catch (err) {
            await bot_message.editReply({ content: 'Buttons disabled. You took too long to click them.', components: [] });
        }
    }

    async process_delay(ping_id, timestamp) {
        if (!timestamp) return true;
        if (new Date(timestamp).getTime() < 100) return true;

        const delay = new Date(timestamp).getTime() - Date.now();
        if (delay < 0) return false;

        await wait(delay);

        return this.#ping_controller.revalidate_ping(ping_id);
    }
}

module.exports = PingScheduler;