const Ping = require('./Ping.js');

class Pings {
    #db;
    #pings = new Array();

    constructor(db) {
        this.#db = db;
    }

    async init() {
        const ping_logs = await this.#db.get_all_ping_logs();

        for (const ping_log of ping_logs) {
            this.#pings.push(new Ping(ping_log));
        }
    }

    get_all_pings() {
        return this.#pings;
    }

    get_ping(id) {
        return this.#pings.find(i => i.id == id);
    }

    async add_ping(user_id, role_id, channel_id, message_id, type, timestamp, delay) {
        const ping_id = await this.#db.add_ping(user_id, channel_id, message_id, type, timestamp, delay);
        const new_ping = new Ping({
            id: ping_id,
            user_id: user_id,
            role_id: role_id,
            channel_id: channel_id,
            message_id: message_id,
            type: type,
            timestamp: timestamp,
            delay: delay
        });
        this.#pings.push(new_ping);
        return new_ping;
    }

    async remove_ping(id) {
        this.#db.remove_ping(id);
        const index = this.#pings.findIndex(i => i.id == id);
        this.#pings.splice(index, 1);
    }
}

module.exports = Pings;