const datetime_methods = require('../utils/datetime_methods');
const all_herbs = require('../database/data/herbs.js');

class User {
    #db;

    #discord_id;
    #discord_username;
    #drip_username;

    #bounty_done;               // timestamp in ISOstring format

    #active_hours_start;        // hh:dd
    #active_hours_end;          // hh:dd

    #bounties_followed;         // [ mob, mob ]
    #equips;                    // ???
    #herbs;                     // [ { id: id, user_id: this.discord_id, herb: herb } ]
    #settings;                  // [ { key: key, value: value }, { key: key, value: value }]
    #globals;                   // [ { key: key, value: value }, { key: key, value: value }]

    constructor(db, discord_id, equips, herbs, settings, global_settings) {
        this.#db = db;
        this.#discord_id = discord_id;
        this.#equips = equips;
        this.#herbs = herbs;
        this.#settings = settings;
        this.#globals = global_settings;
    }

    async init() {
        //Get all info from database
        const users_record = await this.#db.get_users_table_record(this.#discord_id);

        this.#discord_username = users_record.discord_username;
        this.#drip_username = users_record.drip_username;
        this.#bounty_done = users_record.bounty_done;
        this.#parse_and_update_active_hours(users_record.active_hours_start, users_record.active_hours_end);

        this.#bounties_followed = (await this.#db.get_bounties_followed(this.#discord_id)).map(i => i.mob);
    }



    /*********************************
     *                               *
     *      Getters and Setters      *
     *                               *
     *********************************/

    get discord_id() { return this.#discord_id; }
    set discord_id(invalid_action) { console.log('Something tried to set discord_id of a User object'); }

    get discord_username() { return this.#discord_username; }
    set discord_username(invalid_action) { console.log('Something tried to set discord_username of a User object'); }

    get drip_username() { return this.#drip_username; }
    set drip_username(invalid_action) { console.log('Something tried to set drip_username of a User object'); }

    get bounty_done() {
        return datetime_methods.check_same_day(new Date(this.#bounty_done), Date.now());
    }
    set bounty_done(timestamp) {
        if (this.bounty_done) {
            this.#bounty_done = null;
        } else {
            this.#bounty_done = new Date(timestamp).toISOString();
        }
        this.#db.set_bounty_done(this.#discord_id, this.#bounty_done);
    }

    get active() {
        if (this.get_user_setting('Pause_Notifications') === 'true') {
            return false;
        }
        const current_time = new Date();
        let current_hours = current_time.getUTCHours() + current_time.getUTCMinutes() / 60;
        if (current_hours <= this.#active_hours_start) {
            //Have to adjust time because end time may have been +24 hours.
            current_hours += 24;
        }

        return (this.#active_hours_start < current_hours && current_hours < this.#active_hours_end);
    }
    set active(invalid_action) { console.log('Something tried to set active property of a User object'); }

    async set_active_hours(starttime, endtime) {
        this.#parse_and_update_active_hours(starttime, endtime);
        await this.#db.set_active_hours(this.#discord_id, starttime, endtime);
    }

    get_bounties_followed() {
        return this.#bounties_followed;
    }
    
    get_equipment() {
        return this.#equips;
    }

    get_equipment_by_type(type) {
        return this.#equips.filter(i => i.type == type);
    }

    get_herbs() {
        return this.#herbs.map(i => i.herb);
    }

    get_herb_time_reduction() {
        let percentage = 0;
        const sickle = parseInt(this.get_user_setting('Sickle') ?? 0);
        const herb_tile = (this.#globals.get_global_setting('Herb_Tile') === 'true' ? 0.1 : 0);
        percentage += sickle / 100;
        percentage += herb_tile;

        let flat = 0;
        const muscipula = (this.get_user_setting('Muscipula') === 'true'? 1 : 0);
        flat += muscipula;

        return { percent: percentage, flat: flat };
    }

    get_user_setting(key) {
        return this.#settings.find(i => i.key == key)?.value;
    }

    /******************************
     *                            *
     *      Helper Functions      *
     *                            *
     ******************************/

    #parse_and_update_active_hours(starttime, endtime) {
        if (!starttime || !endtime) {
            this.#active_hours_start = 0;
            this.#active_hours_end = 24;
            return;
        }

        const start_arr = starttime.split(':');
        const end_arr = endtime.split(':');

        this.#active_hours_start = parseInt(start_arr[0]) + parseInt(start_arr[1]) / 60;
        this.#active_hours_end = parseInt(end_arr[0]) + parseInt(end_arr[1]) / 60;

        if (this.#active_hours_end <= this.#active_hours_start) {
            //These eases active time calculations to always have start before end.
            this.#active_hours_end += 24;
        }
    }



    /***********************
     *                     *
     *      DB Access      *
     *                     *
     ***********************/

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

    async update_herbs(herb_arr, herb_menu_list) {
        let initial_list = this.get_herbs();
        let added = new Array();
        let removed = new Array();

        for (const herb of herb_menu_list) {
            if (initial_list.includes(herb) == herb_arr.includes(herb)) {
                continue;
            }

            if (initial_list.includes(herb)) {
                removed.push(herb);
                await this.#delete_herb(herb);
            } else {
                added.push(herb);
                await this.#add_herb(herb);
            }
        }

        const sort_arr = all_herbs.map(i => i[0]);
        await this.#herbs.sort((a, b) => sort_arr.indexOf(a.herb) - sort_arr.indexOf(b.herb));

        return [added, removed];
    }

    async #add_herb(herb) {
        if (this.#herbs.find(i => i.herb == herb)) {
            console.log('Tried to add an herb already in user list');
        } else {
            const id = await this.#db.add_drip_user_herbs(this.discord_id, herb);
            this.#herbs.push({
                id: id,
                user_id: this.discord_id,
                herb: herb
            });
        }
    }

    async #delete_herb(herb) {
        const index = this.#herbs.findIndex(i => i.herb == herb);
        if (index >= 0) {
            this.#db.delete_drip_user_herbs(this.#herbs[index].id);
            this.#herbs.splice(index, 1);
            return true;
        } else {
            console.log(`Error: Herbs - Tried to delete a non-existent herb ${this.#herbs[index].id}`);
            return false;
        }
    }

    async update_user_setting(key, value) {
        let str_value = value.toString();
        const setting = this.#settings.find(i => i.key == key);
        if (!setting) {
            this.#db.add_user_setting(this.#discord_id, key, str_value );
            this.#settings.push({ key: key, value: str_value })
        } else {
            this.#db.update_user_setting(this.#discord_id, key, str_value );
            setting.value = str_value ;
        }
    }
}

module.exports = User;