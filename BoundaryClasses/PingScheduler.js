const wait = require('node:timers/promises').setTimeout;
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Component } = require('discord.js');

class PingScheduler {
    #ping_controller;
    #MAX_COMPONENT_TIMER = 1000 * 60 * 15;           //15 minutes
    #users;
    #channels;
    #logger;
    #herbs;

    constructor(ping_controller, users, channels, herbs, logger = true) {
        this.#ping_controller = ping_controller;
        this.#users = users;
        this.#channels = channels;
        this.#herbs = herbs;

        this.#logger = logger;
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

        const bot_message = await message.reply({ content: content, components: component_array });

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
                        .addComponents(new ButtonBuilder().setCustomId('60').setLabel('800/Red').setStyle(ButtonStyle.Danger)));
                    break;
                case 'herb':
                    this.#create_herb_restart_buttons(ping, arr);
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

    #create_herb_restart_buttons(ping, component_array) {
        const user = this.#users.get_user(ping.user_id);
        if (!user.get_herbs() || user.get_herbs().length == 0) {
            return;
        }

        let index = 0;
        let preexisting_rows = component_array.length;
        let row_index = preexisting_rows - 1;
        for (const herb of user.get_herbs()) {
            if (index >= 25 - 5 * preexisting_rows) {
                return;
            }
            if (index % 5 == 0) {
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
                case 'restart_button':
                    this.#create_restart_button_collector(ping, message, bot_message);
                    break;
                default:
            }
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

            let minutes = message.client.herbs.find(i => i[0] == herb)[1];
            const timer_reduction = user.get_herb_time_reduction();
            minutes *= (1 - timer_reduction.percent);
            minutes -= timer_reduction.flat;
            minutes = Math.round(minutes * 10) / 10;

            const delay = minutes * 60 * 1000;
            const timestamp = new Date();
            timestamp.setUTCMilliseconds(timestamp.getUTCMilliseconds() + delay);

            await i.update({
                content: `${user.drip_username}, your timer was restarted for ${minutes} minutes for ${herb}`,
                components: []
            });
            this.#ping_controller.add_ping(ping.user_id, null, message.channel.id, message.id,
                null, 'herbalism', timestamp.toISOString(), delay);
        } catch (err) {
            await bot_message.edit({ components: [] });
        }
    }

    async #create_restart_button_collector(ping, message, bot_message) {
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

            const minutes = Math.round(ping.delay / 1000 / 60 * 10) / 10;
            await i.update({ content: 'Your timer was restarted for ' + minutes + ' minutes', components: [] });
            this.#ping_controller.restart_ping(ping);
 
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