const PingScheduler = require('../BoundaryClasses/PingScheduler.js');
const Pings = require('../EntityClasses/Pings.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class PingController {
    #pings;
    #ping_scheduler;
    #Users;
    #Channels;

    #message_content = {
        botcheck: 'Botcheck within half an hour.',
        cauldron: 'Your cauldron is ready now.',
        herbalism: 'Pick your plants.',
        replanting: 'You forgot to ask me to ping for herbalism. Did you forget to replant?',
        pet_training: 'Your pet is done training.',
        pet_exploration: 'Your pet is done exploring.',
        hades_training: 'Your Hades units are done training.',
        soulhounds_attack: 'Your Soulhounds attack timer is up.',
        hades_attack: 'Your Hades attack timer is up.',
        hades_dragon: 'AHHHH DRAAGGGONNNN'
    };

    #message_components = {
        herbalism: 'restart_button'
    }

    constructor(db, Users, Channels) {
        this.#Users = Users;
        this.#Channels = Channels;

        this.#pings = new Pings(db);
        this.#ping_scheduler = new PingScheduler(this);
    }

    async init() {
        await this.#pings.init();

        for (const ping of this.#pings.get_all_pings()) {
            this.#schedule_ping(ping);
        }
    }

    async #schedule_ping(ping) {
        const channel = this.#Channels.get_channel_by_id(ping.channel_id);
        if (ping.message_id) {
            const message = await channel.messages.fetch(ping.message_id);
            this.#ping_scheduler.reply_to_message(
                ping,
                ping.timestamp,
                message,
                this.get_ping_string(ping) + this.#message_content[ping.type],
                this.#message_components[ping.type]
            );
        } else {
            this.#ping_scheduler.send_to_channel(
                ping,
                ping.timestamp,
                channel,
                this.get_ping_string(ping) + this.#message_content[ping.type],
                this.#message_components[ping.type]
            );
        }
    }

    async add_ping(user_id, role_id, channel_id, message_id, type, timestamp, delay) {
        const ping = await this.#pings.add_ping(user_id, role_id, channel_id, message_id, type, timestamp, delay);
        this.#schedule_ping(ping);
    }

    //From the restart button
    async restart_ping(ping) {
        const new_timestamp = new Date(Date.now() + ping.delay).toISOString();
        const new_ping = await this.#pings.add_ping(
            ping.user_id,
            ping.role_id,
            ping.channel_id,
            ping.message_id,
            ping.type,
            new_timestamp,
            ping.delay
        );
        this.#schedule_ping(new_ping);
    }

    get_ping_string(ping) {
        let ping_string = '';
        if (ping.user_id) {
            for (const user_id of ping.user_id.split(',')) {
                ping_string += '<@' + user_id + '> ';
            }
        }
        if (ping.role_id) {
            for (const role_id of ping.role_id.split(',')) {
                ping_string += '<@&' + role_id + '> ';
            }
        }
        return ping_string;
    }

    revalidate_ping(ping_id) {
        const ping = this.#pings.get_ping(ping_id);
        if (!ping) {
            return false;
        }

        if (ping.user_id && !this.#Users.get_user(ping.user_id).active) {
            return false;
        }

        return true;
    }
}

module.exports = PingController;


/*
    ["thunderstorms", "amar", "amar_storm"],
    ["bounties", "drip", "bounty"],
    ["hellllama", "drip", "soulhounds"],
    ["llamainchat", "drip", "hell"],
    ["llamainchat", "drip", "event"],
    ["llamainchat", "drip", "dt_frenzy"],
    ["llamainchat", "drip", "blace_frenzy"],
    ["llamainchat", "drip", "aura"],
    ["llamainchat", "drip", "drops"],
    ["spit-bot", "drip", "pings"],
    ["general", "testserver", "lyr"]
*/