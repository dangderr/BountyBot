
class BountyLogs {
    #db;
    #bounty_logs;

    constructor(db) {
        this.#db = db;
    }

    async init() {
        this.#bounty_logs = await this.#db.get_bounty_ping_table();

        this.#remove_stale_bounties();
    }

    async add_bounty_log(mob, timestamp) {
        this.#bounty_logs.push({ mob: mob, timestamp: timestamp });
        await this.#db.add_bounty_ping_history(mob, timestamp);
    }

    //Timestamps are all of the time that the bounty expires
    async check_bounty_double_ping(mob, timestamp) {
        const MAX_DISCREPANCY = 1000 * 60 * 3;          //3 Minutes
        await this.#remove_stale_bounties();

        const current_ping_time = new Date(timestamp).getTime();

        const filtered_bounty_logs = this.#bounty_logs.filter(i => i.mob == mob);
        for (const log of filtered_bounty_logs) {
            const discrepancy  = new Date(log.timestamp).getTime() - current_ping_time;
            if (-MAX_DISCREPANCY < discrepancy && discrepancy < MAX_DISCREPANCY) {
                return true;
            }
        }
        return false;
    }

    async #remove_stale_bounties() {
        let index = 0;
        while (index < this.#bounty_logs.length) {
            if (Date.now() > new Date(log.timestamp).getTime()) {
                this.#delete_bounty_log(log.mob, log.timestamp);
            } else {
                index++;
            }
        }
    }

    async #delete_bounty_log(mob, timestamp) {
        const index = this.#bounty_logs.findIndex(i => i.mob == mob && i.timestamp == timestamp);
        if (index < 0) {
            console.log(`Error: BountyLogs - tried to delete a record that did not exist`);
            return;
        }

        this.#bounty_logs.splice(index, 1);
        await this.#db.delete_bounty_ping_record(mob, timestamp);
    }
}

module.exports = BountyLogs;