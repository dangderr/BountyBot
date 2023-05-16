class DoublePingTracker {
    #db;
    #last_ping_times;

    #MAX_DISCREPANCY = 1000 * 60 * 5;       // 5 minutes

    constructor(db) {
        this.#db = db;
    }

    async init() {
        this.#last_ping_times = await this.#db.get_last_ping_times_table();
    }

    async set_last_ping_time(type, timestamp) {
        const iso_timestamp = new Date(timestamp).toISOString();
        const last_ping = this.#last_ping_times.find(i => i.type == type);
        if (!last_ping) {
            this.#db.add_last_ping_time(type, iso_timestamp);
            this.#last_ping_times.push({
                type: type,
                timestamp: iso_timestamp
            });
        } else {
            this.#db.update_last_ping_time(type, iso_timestamp);
            last_ping.timestamp = iso_timestamp;
        }
    }

    check_double_ping(type, timestamp, max_discrepancy = this.#MAX_DISCREPANCY) {
        const last_ping = this.#last_ping_times.find(i => i.type == type);
        if (!last_ping) {
            return false;
        }

        const time_difference = new Date(timestamp).getTime() - new Date(last_ping.timestamp).getTime();
        return (-max_discrepancy < time_difference && time_difference < max_discrepancy);
    }
}

module.exports = DoublePingTracker;