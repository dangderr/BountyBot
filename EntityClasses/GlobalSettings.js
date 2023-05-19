class GlobalSettings {
    #db;
    #settings;

    constructor(db) {
        this.#db = db;
    }

    async init() {
        const all_settings = await this.#db.get_user_settings();
        this.#settings = all_settings.filter(i => i.user_id == 'global');
    }

    async update_global_setting(key, value) {
        let str_value = value.toString();
        const setting = this.#settings.find(i => i.key == key);
        if (!setting) {
            this.#db.add_user_setting('global', key, str_value);
            this.#settings.push({ key: key, value: str_value })
        } else {
            this.#db.update_user_setting('global', key, str_value);
            setting.value = str_value;
        }
    }

    get_global_setting(key) {
        return this.#settings.find(i => i.key == key)?.value;
    }
}

module.exports = GlobalSettings;