const datetime_methods = require('../utils/datetime_methods');
const wait = require('node:timers/promises').setTimeout;

class Users {
    #users;
    #db;

    constructor(db) {
        this.#users = new Array();
        this.#db = db;
    }

    async get_user(discord_id) {
        //Check if user in array
        const user_filter = this.#users.filter(i => i.discord_id == discord_id);

        //If 1 result, then working as expected
        if (user_filter.length == 1) {
            return user_filter[0];
        }

        //If 2 or more results, something went wrong
        if (user_filter.length > 1) {
            console.log('Found ' + user_filter.length + ' users with discord_id ' + discord_id + ' in #users array');
            return user_filter[0];
        }

        //If not, create new user and return;
        if (user_filter.length == 0) {
            const user = new User(this.#db, discord_id);
            await user.init();
            this.#users.push(user);
            return user;
        } else {
            return user_filter[0];
        }
    }

    async get_user_by_drip_username(drip_username) {
        //Check if user in array
        const user_filter = this.#users.filter(i => i.drip_username == drip_username);

        //If 1 result, then working as expected
        if (user_filter.length == 1) {
            return user_filter[0];
        }

        //If 2 or more results, something went wrong
        if (user_filter.length > 1) {
            console.log('Found ' + user_filter.length + ' users with drip_username ' + drip_username + ' in #users array');
            return user_filter[0];
        }

        //If 0 results, must check db to find discord_id, then get user by discord_id
        const query_result = await this.#db.get_discord_id_from_drip_name(drip_username);
        if (query_result) {
            return this.get_user(query_result.discord_id);
        } else {
            return null;
        }
    }

    async add_user(discord_user_object) {
        if(!this.#check_user_in_arr(discord_user_object.discord_id))
            await this.#db.add_user(discord_user_object.id, discord_user_object.username , null);
        return this.get_user(discord_user_object.id);
    }

    #check_user_in_arr(discord_id) {
        const user_filter = this.#users.filter(i => i.discord_id == discord_id);
        if (user_filter.length > 1) {
            console.log('Something went wrong. User' + user_filter[0].discord_username + 'is in the Users array multiple times');
        }
        return user_filter.length > 0;
    }

    async get_bounty_not_done() {
        const discord_id_arr = (await this.#db.get_distinct_users_in_bounties_followed()).map(i => i.discord_id);
        const users_id_arr = this.#users.map(i => i.discord_id);

        let promises = new Array();
        for (const discord_id of discord_id_arr) {
            if (!users_id_arr.includes(discord_id)) {
                promises.push(this.get_user(discord_id));
            }
        }
        await Promise.all(promises);

        return this.#users.filter(i => !i.bountydone).map(i => i.drip_username ?? i.discord_username);
    }
}

class User {
    #db;
    #discord_id;
    #discord_username;
    #drip_username;

    #bountydone;                //timestamp in ISOstring format
    #follow_upcoming_events;
    #pause_notifications;       

    #active_hours_start;
    #active_hours_end;

    #bounties_followed;

    constructor(db, discord_id) {
        this.#db = db;
        this.#discord_id = discord_id;
    }

    async init() {
        //Get all info from database
        const users_record = await this.#db.get_users_table_record(this.#discord_id);
        const bounty_preferences_record = await this.#db.get_bounty_preferences_table_record(this.#discord_id);

        this.#bounties_followed = (await this.#db.get_bounties_followed(this.#discord_id)).map(i => i.mob);

        this.#discord_username = users_record.discord_username;
        this.#drip_username = users_record.drip_username;

        this.#bountydone = bounty_preferences_record.bountydone;
        this.#follow_upcoming_events = bounty_preferences_record.follow_upcoming_events;
        this.#pause_notifications = bounty_preferences_record.pause_notifications;

        this.#parse_and_update_active_hours(bounty_preferences_record.activehoursstart, bounty_preferences_record.activehoursend);
    }

    get discord_id() { return this.#discord_id; }
    get discord_username() { return this.#discord_username; }
    get drip_username() { return this.#drip_username; }

    get bountydone() {
        return datetime_methods.check_same_day(new Date(this.#bountydone), Date.now());
    }

    get follow_upcoming_events() { return this.#follow_upcoming_events == 1; }
    get pause_notifications() { return this.#pause_notifications == 1; }


    set discord_id(invalid_action) { console.log('Something tried to set discord_id of a User object'); }
    set discord_username(invalid_action) { console.log('Something tried to set discord_username of a User object'); }
    set drip_username(invalid_action) { console.log('Something tried to set drip_username of a User object'); }

    set bountydone(timestamp) {
        if (this.bountydone) {
            this.#bountydone = null;
        } else {
            this.#bountydone = new Date(timestamp).toISOString();
        }
        this.#db.set_bountydone(this.#discord_id, this.#bountydone);
    }

    set follow_upcoming_events(bool_value) {
        if (bool_value !== true && bool_value !== false) {
            console.log('Failed to set follow_upcoming_events for user ' + this.#discord_id + ' because bool_value was invalid');
            return;
        }

        const input_value = bool_value ? 1 : 0;
        if (input_value !== this.#follow_upcoming_events) {
            this.#follow_upcoming_events = input_value;
            this.#db.set_follow_upcoming_events(this.#discord_id, input_value);
        }
    }

    set pause_notifications(bool_value) {
        if (bool_value !== true && bool_value !== false) {
            console.log('Failed to set pause_notifications for user ' + this.#discord_id + ' because bool_value was invalid');
            return;
        }

        const input_value = bool_value ? 1 : 0;
        if (input_value !== this.#pause_notifications) {
            this.#pause_notifications = input_value;
            this.#db.set_pause_notifications(this.#discord_id, input_value);
        }
    }

    get active() {
        if (this.pause_notifications) {
            return false;
        }
        const current_time = new Date();
        let current_hours = current_time.getUTCHours() + current_time.getUTCMinutes() / 60;
        if (current_hours <= this.#active_hours_start) {
            current_hours += 24;

            //End time may have been shifted up 24 hours
            //If it was, then shifting this up will make the check valid
            //      For both cases if user is active and if user is inactive
            //If it was not shifted, then the user is inactive, and the shift keeps it outside of active range
        }

        return (this.#active_hours_start < current_hours && current_hours < this.#active_hours_end);
    }

    async set_active_hours(starttime, endtime) {
        this.#parse_and_update_active_hours(starttime, endtime);
        await this.#db.set_active_hours(this.#discord_id, starttime, endtime);
    }

    #parse_and_update_active_hours(starttime, endtime) {
        if (!starttime || !endtime) {
            this.#active_hours_start = 0;
            this.#active_hours_end = 0;
            return;
        }

        const start_arr = starttime.split(':');
        const end_arr = endtime.split(':');

        this.#active_hours_start = parseInt(start_arr[0]) + parseInt(start_arr[1]) / 60;
        this.#active_hours_end = parseInt(end_arr[0]) + parseInt(end_arr[1]) / 60;
        if (this.#active_hours_end < this.#active_hours_start) {
            //These eases active time calculations to always have start before end.
            this.#active_hours_end += 24;
        }
    }

    get_bounties_followed() {
        return this.#bounties_followed;
    }

    async add_bounty(mob) {
        this.#bounties_followed.push(mob);
        this.#db.add_bounty(this.discord_id, mob);
    }

    async remove_bounty(mob) {
        const index = this.#bounties_followed.indexOf(mob);
        if (index < 0) {
            console.log('Tried to remove a bounty that did not exist');
            return;
        }
        this.#bounties_followed.splice(index, 1);
        this.#db.remove_bounty(this.discord_id, mob);
    }
}

module.exports = Users;
