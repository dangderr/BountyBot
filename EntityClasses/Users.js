const User = require('./User.js');

class Users {
    #db;
    #users;
    #globals;

    constructor(db, global_settings) {
        this.#db = db;
        this.#users = new Array();
        this.#globals = global_settings;
    }

    async init() {
        const equips = await this.#db.get_drip_user_equips();
        const herbs = await this.#db.get_drip_user_herbs();
        const settings = await this.#db.get_user_settings();

        const user_ids = (await this.#db.get_all_user_ids()).map(i => i.discord_id);

        let promises = new Array();
        for (const discord_id of user_ids) {
            promises.push(
                this.#create_user_obj(
                    discord_id,
                    equips.filter(i => i.user_id == discord_id),
                    herbs.filter(i => i.user_id == discord_id),
                    settings.filter(i => i.user_id == discord_id),
                )
            );
        }
        await Promise.all(promises);
    }

    //Make sure the user exists in the db before you can call this function
    //      Only called from init() and #add_new_user_to_db()
    async #create_user_obj(discord_id, equips, herbs, settings) {
        const user = new User(
            this.#db,
            discord_id,
            equips ?? new Array(),
            herbs ?? new Array(),
            settings ?? new Array(),
            this.#globals
        );
        await user.init();
        this.#users.push(user);
        return user;
    }

    get_user(discord_id) {
        return this.#users.find(i => i.discord_id == discord_id);
    }

    get_user_by_drip_username(drip_username) {
        return this.#users.find(i => i.drip_username == drip_username);
    }

    async add_user(discord_user_object) {
        return this.#users.find(i => i.discord_id == discord_user_object.id)
            ?? await this.#add_new_user_to_db(discord_user_object.id, discord_user_object.username)
    }

    async #add_new_user_to_db(discord_id, discord_username) {
        await this.#db.add_user(discord_id, discord_username);
        return await this.#create_user_obj(discord_id);
    }

    get_bounty_not_done() {
        //return this.#users.filter(i => !i.bounty_done).map(i => i.drip_username ?? i.discord_username);
        return this.#users.filter(i => i.drip_username && !i.bounty_done).map(i => i.drip_username);
    }

    get_bounties_followed() {
        const bounties_followed = new Array();
        for (const user of this.#users) {
            for (const mob of user.get_bounties_followed()) {
                bounties_followed.push([user.discord_id, mob]);
            }
        }
        return bounties_followed;           // [ [id, mob], [id, mob] ]
    }

    get_user_ids_following_respawn_timers() {
        return this.#users.filter(i => i.get_user_setting('Follow_Respawn_Timers') === 'true').map(i => i.discord_id);
    }
}

module.exports = Users;