
class EventTimers {
    #db;
    #event_timers;      // [ { event_name: event_name, timestamp: ISOtimestamp } ]

    constructor(db) {
        this.#db = db;
    }

    async init() {
        this.#event_timers = await this.#db.get_event_timers_table();
    }

    async set_event_timer(category, timestamp) {
        const event = this.#event_timers.find(i => i.event_name == category);
        if (!event) {
            console.log(`Error: EventTimers - No event found of type ${category}`);
            return;
        }
        event.timestamp = new Date(timestamp).toISOString();
        this.#db.set_event_timer(category, event.timestamp);
    }

    get_event_timer(category) {
        return this.#event_timers.find(i => i.event_name == category);
    }

    get_event_names() {
        return this.#event_timers.map(i => i.event_name);
    }
}

module.exports = EventTimers;