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
            if (new Date(ping_log.timestamp).getTime() < Date.now()) {
                this.#db.deactivate_ping(ping_log.id);
                continue;
            }
            this.#pings.push(new Ping(ping_log));
        }
    }

    get_all_pings() {
        return this.#pings;
    }

    get_ping(id) {
        return this.#pings.find(i => i.id == id);
    }

    async add_ping(user_id, role_id, channel_id, message_id, content, type, timestamp, delay) {
        const ping_id = await this.#db.add_ping(user_id, channel_id, message_id, content, type, new Date(timestamp).toISOString(), delay);
        const new_ping = new Ping({
            id: ping_id,
            user_id: user_id,
            role_id: role_id,
            channel_id: channel_id,
            message_id: message_id,
            content: content,
            type: type,
            timestamp: new Date(timestamp).toISOString(),
            delay: delay
        });
        this.#pings.push(new_ping);
        return new_ping;
    }

    async remove_ping(id) {
        const index = this.#pings.findIndex(i => i.id == id);
        if (index < 0) {
            console.log(`Error: Pings - Tried to delete a ping that does not exist, id: ${id}`);
            return;
        }

        console.log(`[${new Date().toISOString()}] Deleting Ping: ${id} ${this.#pings[index].user_id} ${this.#pings[index].type}`);

        this.#pings.splice(index, 1);
        await this.#db.deactivate_ping(id);
    }

    find_pings(options) {
        let matches = new Array();
        for (const ping of this.#pings) {
            let match = true;
            for (const option of Object.keys(options)) {
                if (options[option] != ping[option]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                matches.push(ping);
            }
        }
        return matches;
    }
}

module.exports = Pings;