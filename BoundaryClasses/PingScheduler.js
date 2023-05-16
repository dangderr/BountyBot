const wait = require('node:timers/promises').setTimeout;
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

class PingScheduler {
    #ping_controller;
    #MAX_COMPONENT_TIMER = 1000 * 60 * 5;           //5 minutes
    #logger;

    #components = {
        restart_button: [new ActionRowBuilder()
            .addComponents(new ButtonBuilder().setCustomId('Restart').setLabel('Restart').setStyle(ButtonStyle.Success))],
        blace_buttons: [new ActionRowBuilder()
            .addComponents(new ButtonBuilder().setCustomId('10').setLabel('400/White').setStyle(ButtonStyle.Secondary))
            .addComponents(new ButtonBuilder().setCustomId('20').setLabel('500/Green').setStyle(ButtonStyle.Success))
            .addComponents(new ButtonBuilder().setCustomId('30').setLabel('600/Blue').setStyle(ButtonStyle.Primary))
            .addComponents(new ButtonBuilder().setCustomId('45').setLabel('700/Purple').setStyle(ButtonStyle.Primary))
            .addComponents(new ButtonBuilder().setCustomId('60').setLabel('800/Red').setStyle(ButtonStyle.Danger))]
    }

    constructor(ping_controller, logger = true) {
        this.#ping_controller = ping_controller;
        this.#logger = logger;
    }

    log(ping) {
        if (this.#logger) {
            const time_remaining = (new Date(ping.timestamp).getTime() - Date.now()) / 1000;
            console.log(`PingScheduler: ${ping.id} ${ping.type} ${time_remaining}`);
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

        const bot_message = await message.reply({ content: content, components: this.#components[components] });
        if (components == 'restart_button') {
            this.create_restart_button_collector(ping, message, content, bot_message);
        } else if (components == 'blace_buttons') {
            this.create_blace_button_collector(ping, message, bot_message);
        }
    }

    async create_restart_button_collector(ping, message, content, bot_message) {
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

    async create_blace_button_collector(ping, message, bot_message) {
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

            const role_id = message.client.Channels.get_role_id('frenzy', 'drip');
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