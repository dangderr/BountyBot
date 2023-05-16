class ItemDrops {
    #db;
    #item_drops;

    constructor(db) {
        this.#db = db;
    }

    async init() {
        this.#item_drops = await this.#db.get_item_drops();
    }

    async add_item_drop(message, timestamp) {
        this.#db.add_item_drop(message, timestamp);
    }
}

module.exports = ItemDrops;