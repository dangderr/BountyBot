const PingScheduler = require('../BoundaryClasses/PingScheduler.js');
const Pings = require('../EntityClasses/Pings.js');
const EventTimers = require('../EntityClasses/EventTimers.js');

class PingController {
    #Users;
    #Channels;

    #pings;
    #ping_scheduler;
    #event_timers;

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
        hades_dragon: 'AHHHH DRAAGGGONNNN',

        blace_reminder: 'Blaze/Ace last spawned 4 hours ago.',
        soulhounds_reminder: 'Soulhounds last spawned 5.5 hours ago.',
        treant_reminder: 'Treant last spawned 3 hours ago.',
        quartz_titan_reminder: 'Quartz Titan last spawned 6 hours ago.',
        pumpkin_reminder: 'Pumpkin last spawned 3 hours ago.',
        snowman_reminder: 'Snowman last spawned 3 hours ago.'
    };

    #FALLBACK_MESSAGE = 'idk why im pinging you... figure it out';
    #REMINDER_FALLBACK_MESSAGE = 'This is a reminder message. Something spawned some hours ago but idr what and idk when.';

    #message_components = {
        herbalism: 'restart_button'
    };

    #events_to_track;

    constructor(db, Users, Channels) {
        this.#Users = Users;
        this.#Channels = Channels;

        this.#pings = new Pings(db);
        this.#ping_scheduler = new PingScheduler(this);
        this.#event_timers = new EventTimers();
    }

    async init() {
        await this.#event_timers.init();
        this.#events_to_track = this.#event_timers.get_event_names();

        await this.#pings.init();
        for (const ping of this.#pings.get_all_pings()) {
            this.#schedule_ping(ping);
        }
    }

    async #schedule_ping(ping) {
        const channel = this.#Channels.get_channel_by_id(ping.channel_id).channel;

        const content = this.get_ping_string(ping)
            + (ping.content
                ?? this.#message_content[ping.type]
                ?? (ping.type.includes('_reminder') ? this.#REMINDER_FALLBACK_MESSAGE : this.#FALLBACK_MESSAGE));

        if (ping.message_id) {
            const message = await channel.messages.fetch(ping.message_id);
            await this.#ping_scheduler.reply_to_message(
                ping,
                ping.timestamp,
                message,
                content,
                this.#message_components[ping.type]
            );
        } else {
            await this.#ping_scheduler.send_to_channel(
                ping,
                ping.timestamp,
                channel,
                content,
                this.#message_components[ping.type]
            );
        }

        this.#pings.remove_ping(ping.id);
    }

    async add_ping(user_id, role_id, channel_id, message_id, content, type, timestamp, delay) {
        const ping = await this.#pings
            .add_ping(
                user_id,
                role_id,
                channel_id,
                message_id,
                content,
                type,
                timestamp,
                delay
            );
        this.#schedule_ping(ping);

        if (type == 'herbalism') {
            //If herbalism, remove all replanting timers and then start a new one
            const options = {
                user_id: user_id,
                type: 'replanting'
            };
            const matching_pings = this.#pings.find_pings(options);

            for (const p of matching_pings) {
                await this.#pings.remove_ping(p.id);
            }

            const new_timestamp = new Date(timestamp);
            new_timestamp.setUTCMinutes(new_timestamp.getUTCMinutes() + 20);
            this.add_ping(user_id, role_id, channel_id, message_id, content, type, new_timestamp, delay);
        }

        if (this.#events_to_track.includes(type)) {
            await this.#event_timers.set_event_timer(type, timestamp);

            const user_list = this.#Users.get_user_ids_following_respawn_timers().join(',');

            const event_info = await this.#event_timers.get_event_timer(type);
            const ping_time = new Date();
            ping_time.setUTCMilliseconds(ping_time.getUTCMilliseconds() + event_info.min_time);

            const event_reminder_ping = await this.#pings
                .add_ping(
                    user_list,
                    null,
                    channel_id,
                    null,
                    null,
                    type + '_reminder',
                    ping_time,
                    null
                );
            this.#schedule_ping(event_reminder_ping);
        }
    }

    //From the restart button
    async restart_ping(ping) {
        const new_timestamp = new Date(Date.now() + ping.delay).toISOString();
        const new_ping = await this.#pings.add_ping(
            ping.user_id,
            ping.role_id,
            ping.channel_id,
            ping.message_id,
            ping.content,
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