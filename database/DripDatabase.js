const Database = require('./Database.js');
const SqlQueryBuilder = require('./SqlQueryBuilder.js');
const dds = require('./drip_database_schema.js');

class DripDatabase extends Database {
    cache = {};

    constructor(path) {
        super(path);
    }

    async init() {
        await this.init_base(dds.schema, dds.table_data);
        return this;
    }

    async test_query() {
        let sql = new SqlQueryBuilder().select(['mob']).from('mobs').where_column_equals(['category', 'subcategory'], ['ff', '12']).get_result();
        console.log(sql);
        console.log(await this.query_all(sql));
    }
}

module.exports = DripDatabase;

/*
    add_user,
    add_bounty,
    remove_bounty,
    check_user_is_in_db,
    get_mobs,
    get_bounties_followed_table,
    get_bounties_followed,
    get_distinct_users_in_bounties_followed,
    get_bountydone,
    set_bountydone,
    get_active_hours,
    set_active_hours,
    get_usernames,
    get_channel_info,
    get_channel_id,
    get_channel_message_types,
    get_all_message_types,
    get_role_id,
    get_user_ping_timer,
    set_user_ping_timer,
    get_all_ping_timers,
    get_event_timers_timestamp,
    set_event_timers_timestamp,
    add_item_drop,
    get_discord_id_from_drip_name,
    get_bounty_ping_history,
    add_bounty_ping_history
*/