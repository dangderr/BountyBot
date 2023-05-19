const PingScheduler = require('../BoundaryClasses/PingScheduler.js');
const Pings = require('../EntityClasses/Pings.js');
const EventTimers = require('../EntityClasses/EventTimers.js');
const DoublePingTracker = require('../EntityClasses/DoublePingTracker.js');

class PingController {
    #Users;
    #Channels;

    #pings;
    #ping_scheduler;
    #event_timers;
    #double_ping_tracker;

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
        clan_wars_mob: '~~Lyr dungeon~~ Clan wars room is finished.',
        clan_titan_ready: 'Release the Titan!',

        pot_atk: 'Your attack pot is about to expire',
        pot_def: 'Your defense pot is about to expire',
        pot_mystery: 'Your mystery pot is about to expire',
        pot_xp: 'Your XP pot is about to expire',
        pot_lvl: 'Your LVL pot is about to expire',

        blace_reminder: 'Blaze/Ace last spawned 4 hours ago.',
        soulhounds_reminder: 'Soulhounds last spawned 5.5 hours ago.',
        treant_reminder: 'Treant last spawned 3 hours ago.',
        quartz_titan_reminder: 'Quartz Titan last spawned 6 hours ago.',
        pumpkin_reminder: 'Pumpkin last spawned 3 hours ago.',
        snowman_reminder: 'Snowman last spawned 3 hours ago.'
    };

    #unique_pings = [
        'hell_open', 'blace_reminder', 'soulhounds_reminder', 
        'treant_reminder', 'quartz_titan_reminder', 'pumpkin_reminder', 'snowman_reminder'
    ]

    #unique_per_user = [
        'botcheck', 'cauldron', 'herbalism', 'replanting',
        'pet_training', 'pet_exploration', 'hades_training', 'soulhounds_attack',
        'hades_attack', 'hades_dragon', 'clan_wars_mob',
        'pot_atk', 'pot_def', 'pot_mystery', 'pot_xp', 'pot_lvl'
    ];

    #FALLBACK_MESSAGE = 'idk why im pinging you... figure it out';
    #REMINDER_FALLBACK_MESSAGE = 'This is a reminder message. Something spawned some hours ago but idr what and idk when.';

    #message_components = {
        herbalism: ['restart_button', 'herb'],
        pet_training: ['restart_button', 'pet'],
        cauldron: ['restart_button'],
        blace: ['blace_buttons']
    };

    #events_to_track;

    constructor(db, Users, Channels, Data) {
        this.#Users = Users;
        this.#Channels = Channels;

        this.#pings = new Pings(db);
        this.#ping_scheduler = new PingScheduler(this, Users, Channels, Data);
        this.#event_timers = new EventTimers(db);
        this.#double_ping_tracker = new DoublePingTracker(db);
    }

    async init() {
        await this.#event_timers.init();
        this.#events_to_track = this.#event_timers.get_event_names();

        await this.#pings.init();
        for (const ping of this.#pings.get_all_pings()) {
            this.#schedule_ping(ping);
        }

        await this.#double_ping_tracker.init();
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
        //  Check pings that are NOT a response or error
        //      AND are either an instant ping or are soulhounds
        if ((type != 'response' && type != 'error')
            && ( (!user_id && !timestamp) || (type == 'soulhounds')) )
        {
            if (this.#double_ping_tracker.check_double_ping(type, Date.now())) {
                return;
            } else {
                this.#double_ping_tracker.set_last_ping_time(type, Date.now());
            }
        }

        if (type == 'herbalism') {
            this.#schedule_replanting_ping(user_id, channel_id, message_id, timestamp);
        }

        if (this.#unique_pings.includes(type)) {
            this.#remove_stale_pings({ type: type });
        } else if (this.#unique_per_user.includes(type)) {
            this.#remove_stale_pings({ user_id: user_id, type: type });
        }

        if (this.#events_to_track.includes(type)) {
            if (timestamp) {
                this.#schedule_event_respawn_reminders(channel_id, type, timestamp);
            }
            timestamp = null;
        }

        const ping = await this.#pings
            .add_ping(user_id, role_id, channel_id, message_id, content, type, timestamp, delay);
        this.#schedule_ping(ping);
    }

    #schedule_replanting_ping(user_id, channel_id, message_id, timestamp) {
        const new_timestamp = new Date(timestamp);
        new_timestamp.setUTCMinutes(new_timestamp.getUTCMinutes() + 20);
        this.add_ping(user_id, null, channel_id, message_id,
            null, 'replanting', new_timestamp, null);
    }

    async #schedule_event_respawn_reminders(channel_id, type, timestamp) {
        await this.#event_timers.set_event_timer(type, timestamp);

        const user_list = this.#Users.get_user_ids_following_respawn_timers().join(',');
        const event_info = await this.#event_timers.get_event_timer(type);
        const ping_time = new Date(timestamp);
        ping_time.setUTCMilliseconds(ping_time.getUTCMilliseconds() + event_info.min_time);

        this.add_ping(user_list, null, channel_id, null, null, type + '_reminder', ping_time, null);
    }

    async #remove_stale_pings(options) {
        const matching_pings = this.#pings.find_pings(options);
        for (const p of matching_pings) {
            await this.#pings.remove_ping(p.id);
        }
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