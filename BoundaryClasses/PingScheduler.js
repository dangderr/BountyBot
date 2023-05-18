const wait = require('node:timers/promises').setTimeout;
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Component } = require('discord.js');

class PingScheduler {
    #ping_controller;
    #MAX_COMPONENT_TIMER = 1000 * 60 * 15;           //5 minutes
    #users;
    #channels;
    #herbs;
    #logger;

    #components = {
        herb: [new ActionRowBuilder()
            .addComponents(new ButtonBuilder().setCustomId('Restart').setLabel('Restart').setStyle(ButtonStyle.Success))],
        restart_button: [new ActionRowBuilder()
            .addComponents(new ButtonBuilder().setCustomId('Restart').setLabel('Restart').setStyle(ButtonStyle.Success))],
        blace_buttons: [new ActionRowBuilder()
            .addComponents(new ButtonBuilder().setCustomId('10').setLabel('400/White').setStyle(ButtonStyle.Secondary))
            .addComponents(new ButtonBuilder().setCustomId('20').setLabel('500/Green').setStyle(ButtonStyle.Success))
            .addComponents(new ButtonBuilder().setCustomId('30').setLabel('600/Blue').setStyle(ButtonStyle.Primary))
            .addComponents(new ButtonBuilder().setCustomId('45').setLabel('700/Purple').setStyle(ButtonStyle.Primary))
            .addComponents(new ButtonBuilder().setCustomId('60').setLabel('800/Red').setStyle(ButtonStyle.Danger))]
    }

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

        let component_array = this.#components[components];
        if (components == 'herb' && ping.user_id) {
            component_array = this.#create_herb_restart_buttons(ping.user_id, component_array);
        }

        const bot_message = await message.reply({ content: content, components: component_array });
        if (components == 'restart_button') {
            this.#create_restart_button_collector(ping, message, content, bot_message);
        } else if (components == 'blace_buttons') {
            this.#create_blace_button_collector(ping, message, bot_message);
        } else if (components == 'herb') {
            this.#create_herb_button_collector(ping, message, content, bot_message);
        }
    }

    #create_herb_restart_buttons(user_id, component_array) {
        const user = this.#users.get_user(user_id);
        if (!user.herbs || user.herbs.length == 0) {
            return component_array;
        }

        let index = 0;
        let row_index = 0;
        for (const herb of user.herbs) {
            if (index >= 20) {
                return;
            }
            if (index % 5 == 0) {
                row_index++;
                component_array[row_index] = new ActionRowBuilder();
            }
            component_array[row_index].addComponents(new ButtonBuilder().setCustomId(herb).setLabel(herb).setStyle(ButtonStyle.Secondary));
            index++;
        }

        return component_array;
    }

    async #create_herb_button_collector(ping, message, content, bot_message) {
        const user = this.#users.get_user(ping.user_id);
        const filter = (i => i.user.id === message.author.id);
        const collector = bot_message.createMessageComponentCollector({
            filter: filter,
            componentType: ComponentType.Button,
            time: this.#MAX_COMPONENT_TIMER,
            max: 1
        });

        let restarted = false;
        collector.on('collect', async i => {
            if (i.component.customId == 'Restart') {
                const minutes = Math.round(ping.delay / 1000 / 60 * 10) / 10;
                await i.update({ content: 'Your timer was restarted for ' + minutes + ' minutes', components: [] });
                restarted = true;
                this.#ping_controller.restart_ping(ping);
            } else {
                const herb = i.component.customId;
                let minutes = message.client.herbs.find(i => i[0] == herb)[1];
                minutes *= (1 - user.sickle);
                minutes = Math.round(minutes * 10) / 10;
                const delay = minutes * 60 * 1000;
                const timestamp = new Date();
                timestamp.setUTCMilliseconds(timestamp.getUTCMilliseconds() + delay);

                await i.update({ content: `${user.drip_username}, your timer was restarted for ${minutes} minutes for ${herb}`, components: [] });
                restarted = true;
                this.#ping_controller.add_ping(ping.user_id, null, message.channel.id, bot_message.id, null, 'herbalism', timestamp.toISOString(), delay);
            }
        });
        collector.on('end', collector => { });

        await wait(this.#MAX_COMPONENT_TIMER);

        if (!restarted) {
            bot_message.edit({ content: content, components: [] });
        }
    }

    async #create_restart_button_collector(ping, message, content, bot_message) {
        const filter = (i => i.user.id === message.author.id);
        const collector = bot_message.createMessageComponentCollector({
            filter: filter,
            componentType: ComponentType.Button,
            time: this.#MAX_COMPONENT_TIMER,
            max: 1
        });

        let restarted = false;
        collector.on('collect', async i => {
            const minutes = Math.round(ping.delay / 1000 / 60 * 10) / 10;
            try {
                await i.update({ content: 'Your timer was restarted for ' + minutes + ' minutes', components: [] });
                restarted = true;
                this.#ping_controller.restart_ping(ping);
            }
            catch (err) {
                console.log('Error in restart button update');
                console.log(err);
            }
        });
        collector.on('end', collector => { });

        await wait(this.#MAX_COMPONENT_TIMER);

        if (!restarted) {
            bot_message.edit({ content: content, components: [] });
        }
    }

    async #create_blace_button_collector(ping, message, bot_message) {
        const collector = bot_message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: this.#MAX_COMPONENT_TIMER,
            max: 1
        });

        collector.on('end', collector => { });
        collector.on('collect', async i => {
            const time = i.component.customId;
            const replies = ['bro', 'dude', 'clock', 'babe', 'man', 'dawg', 'homie', 'honey', 'Allah'];
            const reply_index = Math.floor(Math.random() * replies.length);
            const message_reply = 'Thanks, ' + replies[reply_index];
            await i.update({ content: message_reply, components: [] });

            const role_id = this.#channels.get_role_id('frenzy', 'drip');
            const content = time + ' mins from Blaze/Ace';

            this.#ping_controller.add_ping(
                null,
                role_id,
                ping.channel_id,
                null,
                content,
                'blace_ping',
                null,
                null
            );
        });
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