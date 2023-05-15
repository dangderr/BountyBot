const wait = require('node:timers/promises').setTimeout;

class PingScheduler {
    #ping_controller;
    #MAX_COMPONENT_TIMER = 1000 * 60 * 5;           //5 minutes

    #components = {
        restart_button: new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Restart')
                    .setLabel('Restart')
                    .setStyle(ButtonStyle.Success))
    }

    constructor(ping_controller) {
        this.#ping_controller = ping_controller;
    }

    async send_to_channel(ping, timestamp, channel, content, components) {
        if (!await this.process_delay(ping.id, timestamp)) {
            return;
        }

        if (!components) {
            channel.send(content);
            return;
        }
         
        channel.send({ content: content, components: components });

        //Start some collector here??
        //What type of channel.send pings will need a collector?
    }

    async reply_to_message(ping, timestamp, message, content, components) {
        if (!await this.process_delay(ping.id, timestamp)) {
            return;
        }

        if (!components) {
            message.reply(content);
            return;
        }

        if (components == 'restart_button') {
            const bot_message = await message.reply({ content: content, components: this.#components[components] });
            this.create_restart_collector(ping, message, content, bot_message);
        }
    }

    async create_restart_collector(ping, message, content, bot_message) {
        const filter = i => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: this.#MAX_COMPONENT_TIMER, max: 1 });

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

    process_delay(ping_id, timestamp) {
        if (!timestamp) return true;

        const delay = new Date(timestamp).getTime() - Date.now();
        if (delay < 0) return false;

        await wait(delay);

        return this.#ping_controller.revalidate_ping(ping_id);
    }
}

module.exports = PingScheduler;