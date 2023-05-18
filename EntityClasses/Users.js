const User = require('./User.js');

class Users {
    #users;
    #db;
    #user_equips;
    #user_herbs;

    constructor(db) {
        this.#users = new Array();
        this.#db = db;
    }

    async init() {
        this.#user_equips = await this.#db.get_drip_user_equips();
        this.#user_herbs = await this.#db.get_drip_user_herbs();

        const user_ids = (await this.#db.get_all_user_ids()).map(i => i.discord_id);

        let promises = new Array();
        for (const discord_id of user_ids) {
            promises.push(this.#create_user_obj(discord_id));
        }
        await Promise.all(promises);
    }

    //Make sure the user exists in the db before you can call this function
    //      Only called from init() and #add_new_user_to_db()
    async #create_user_obj(discord_id) {
        const user = new User(this.#db, this, discord_id);
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
        return this.#users.filter(i => i.follow_respawn_timers).map(i => i.discord_id);
    }


    /**********
     *        *
     * Equips *
     *        *
     **********/
    async add_item(user_id, item, type, gem = null, gem_tier = null) {
        const id = await this.#db.add_drip_user_equips(user_id, item, type, gem, gem_tier);
        this.#user_equips.push({
            id: id,
            user_id: user_id,
            item: item,
            type: type,
            gem: gem,
            gem_tier: gem_tier
        });
    }

    async delete_item(id) {
        const index = this.#user_equips.findIndex(i => i.id == id);
        if (index < 0) {
            console.log(`Error: Equipment - Tried to delete a non-existent item ${id}`);
            return;
        }

        this.#user_equips.splice(index, 1);
        this.#db.delete_drip_user_equips(id);
    }

    get_items_by_user(user_id) {
        return this.#user_equips.filter(i => i.user_id == user_id);
    }

    /*********
     *       *
     * Herbs *
     *       *
     *********/

    async add_herb(user_id, herb) {
        const id = await this.#db.add_drip_user_herbs(user_id, herb);
        this.#user_herbs.push({
            id: id,
            user_id: user_id,
            herb: herb
        });
    }

    async delete_herb(id) {
        const index = this.#user_herbs.findIndex(i => i.id == id);
        if (index < 0) {
            console.log(`Error: Herbs - Tried to delete a non-existent herb ${id}`);
            return;
        }

        this.#user_herbs.splice(index, 1);
        this.#db.delete_drip_user_herbs(id);
    }

    get_herbs_by_user(user_id) {
        return this.#user_herbs.filter(i => i.user_id == user_id);
    }
}

module.exports = Users;