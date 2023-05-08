const Database = require('./Database.js');
const SqlQueryBuilder = require('./SqlQueryBuilder.js');
const ddd = require('./data/drip_database_data.js');
const tokens = require('../utils/app_tokens');

class DripDatabase extends Database {
    cache = {};

    constructor(path) {
        super(path);
        this.cache.check_user_is_in_db = new Object();
        this.cache.get_role_id = new Object();
    }

    async init() {
        await this.init_base(ddd.schema, ddd.table_data);
        return this;
    }

    async test_query() {
        let sql = new SqlQueryBuilder().select(['mob'])
            .from('mobs')
            .where_column_equals(['category', 'subcategory'], ['ff', '12'])
            .get_result();
        console.log(sql);
        console.log(await this.query_all(sql));
    }

    async add_user(discord_id, discord_username, drip_username) {
        if (await this.check_user_is_in_db(discord_id)) {
            return;
        }
        this.query_run(
            new SqlQueryBuilder()
                .insert_into_values(
                    'users',
                    ['discord_id', 'discord_username', 'drip_username', 'app_token'],
                    [discord_id, discord_username, drip_username, tokens.generate_token(16)])
                .get_result()
        );
        this.query_run(
            new SqlQueryBuilder()
                .insert_into_values('bounty_preferences', ['discord_id'], [discord_id])
                .get_result()
        );
        this.query_run(
            new SqlQueryBuilder()
                .insert_into_values('user_ping_timers', ['discord_id'], [discord_id])
                .get_result()
        );
    }

    async remove_user(discord_id) {
        if (this.cache.check_user_is_in_db[discord_id]) {
            delete this.cache.check_user_is_in_db[discord_id];
        }
        this.query_run(
            new SqlQueryBuilder()
                .delete_from('users')
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
        this.query_run(
            new SqlQueryBuilder()
                .delete_from('bounty_preferences')
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
        this.query_run(
            new SqlQueryBuilder()
                .delete_from('user_ping_timers')
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
        this.query_run(
            new SqlQueryBuilder()
                .delete_from('bounties_followed')
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
    }

    async add_bounty(discord_id, mob) {
        this.query_run(
            new SqlQueryBuilder()
                .insert_into_values('bounties_followed', ['discord_id', 'mob'], [discord_id, mob])
                .get_result()
        );
    }

    async remove_bounty(discord_id, mob) {
        this.query_run(
            new SqlQueryBuilder()
                .delete_from('bounties_followed')
                .where_column_equals(['discord_id', 'mob'], [discord_id, mob])
                .get_result()
        );
    }

    ///Change code. used to return true/false, now will return obj or undefined
    async check_user_is_in_db(discord_id) {
        if (this.cache.check_user_is_in_db[discord_id]) {
            return this.cache.check_user_is_in_db[discord_id];
        }

        const result_obj = await this.query_get(
            new SqlQueryBuilder()
                .select(['discord_id'])
                .from('users')
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );

        if (result_obj) {
            this.cache.check_user_is_in_db[discord_id] = result_obj;
        }

        return result_obj;
    }

    async get_mobs(category, subcategory) {
        if (subcategory) {
            return await this.query_all(
                new SqlQueryBuilder()
                    .select(['mob'])
                    .from('mobs')
                    .where_column_equals(['category', 'subcategory'], [category, subcategory])
                    .get_result()
            );
        } else {
            return await this.query_all(
                new SqlQueryBuilder()
                    .select(['mob'])
                    .from('mobs')
                    .where_column_equals(['category'], [category])
                    .get_result()
            );
        }
    }

    //merged with get_bounties_followed_table
    async get_bounties_followed(discord_id) {
        if (discord_id) {
            return await this.query_all(
                new SqlQueryBuilder()
                    .select(['mob'])
                    .from('bounties_followed')
                    .where_column_equals(['discord_id'], [discord_id])
                    .get_result()
            );
        } else {
            return await this.query_all(
                new SqlQueryBuilder()
                    .select(['*'])
                    .from('bounties_followed')
                    .get_result()
            );
        }
    }

    async get_distinct_users_in_bounties_followed() {
        return await this.query_all(
            new SqlQueryBuilder()
                .select(['discord_id'])
                .distinct()
                .from('bounties_followed')
                .get_result()
        );
    }

    //Fix the singular case. return value changed
    async get_bountydone(discord_id = null) {
        if (discord_id) {
            return await this.query_get(
                new SqlQueryBuilder()
                    .select(['bountydone'])
                    .from('bounty_preferences')
                    .where_column_equals(['discord_id'], [discord_id])
                    .get_result()
            );
        } else {
            return await this.query_all(
                new SqlQueryBuilder()
                    .select(['discord_id','bountydone'])
                    .from('bounty_preferences')
                    .get_result()
            );
        }
    }

    async set_bountydone(discord_id, bountydone) {
        this.query_run(
            new SqlQueryBuilder()
                .update('bounty_preferences')
                .set(['bountydone'], [bountydone])
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
    }

    async get_active_hours(discord_id) {
        return await this.query_get(
            new SqlQueryBuilder()
                .select(['activehoursstart','activehoursend'])
                .from('bounty_preferences')
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
    }

    async set_active_hours(discord_id, activehoursstart, activehoursend) {
        this.query_run(
            new SqlQueryBuilder()
                .update('bounty_preferences')
                .set(['activehoursstart', 'activehoursend'], [activehoursstart, activehoursend])
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
    }

    async get_usernames(discord_id_arr) {
        return await this.query_all(
            new SqlQueryBuilder()
                .select(['discord_username', 'drip_username'])
                .from('users')
                .where_column_in('discord_id', discord_id_arr)
                .get_result()
        );
    }

    async get_channel_info(channel_id) {
        return await this.query_get(
            new SqlQueryBuilder()
                .select(['*'])
                .from('channel_list')
                .where_column_equals(['channel_id'], [channel_id])
                .get_result()
        );
    }

    async get_channel_id(channel_name, channel_server) {
        return await this.query_get(
            new SqlQueryBuilder()
                .select(['channel_id'])
                .from('channel_list')
                .where_column_equals(['channel_name', 'channel_server'], [channel_name, channel_server])
                .get_result()
        );
    }

    async get_channel_message_types(channel_name, channel_server) {
        return await this.query_all(
            new SqlQueryBuilder()
                .select(['message_type'])
                .from('channel_whitelist')
                .where_column_equals(['channel_name', 'channel_server'], [channel_name, channel_server])
                .get_result()
        );
    }

    async get_all_message_types() {
        return await this.query_all(
            new SqlQueryBuilder()
                .select(['message_type'])
                .distinct()
                .from('channel_whitelist')
                .get_result()
        );
    }

    async get_role_id(role, server) {
        if (this.cache.get_role_id[role + server]) {
            return this.cache.get_role_id[role + server];
        }

        const result_obj = await this.query_get(
            new SqlQueryBuilder()
                .select(['role_id'])
                .from('role_ids')
                .where_column_equals(['role', 'server'], [role, server])
                .get_result()
        );

        if (result_obj) {
            this.cache.get_role_id[role + server] = result_obj;
        }

        return result_obj;
    }

    //Will remove this in refactor of PingScheduler
    async get_user_ping_timer(discord_id, category) {
        return await this.query_get(
            new SqlQueryBuilder()
                .select([category])
                .from('user_ping_timers')
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
    }

    //Will remove this in refactor of PingScheduler
    async set_user_ping_timer(discord_id, category, timestamp) {
        this.query_run(
            new SqlQueryBuilder()
                .update('user_ping_timers')
                .set([category], [timestamp])
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
    }

    //Will remove this in refactor of PingScheduler
    async get_all_ping_timers() {
        return await this.query_all(
            new SqlQueryBuilder()
                .select(['*'])
                .from('user_ping_timers')
                .get_result()
        );
    }

    //Will remove this in refactor of PingScheduler
    async get_event_timers_timestamp(category = null) {
        if (category) {
            return await this.query_get(
                new SqlQueryBuilder()
                    .select(['*'])
                    .from('event_timers')
                    .where_column_equals(['event_name'], [category])
                    .get_result()
            );

        } else {
            return await this.query_all(
                new SqlQueryBuilder()
                    .select(['*'])
                    .from('event_timers')
                    .get_result()
            );
        }
    }

    //Will remove this in refactor of PingScheduler
    async set_event_timers_timestamp(category, timestamp) {
        this.query_run(
            new SqlQueryBuilder()
                .update('event_timers')
                .set(['timestamp'], [timestamp])
                .where_column_equals(['event_name'], [category])
                .get_result()
        );
    }

    async add_item_drop(message, timestamp) {
        if (timestamp) {
            this.query_run(
                new SqlQueryBuilder()
                    .insert_into_values('item_drops', ['message', 'date'], [message, timestamp])
                    .get_result()
            );
        } else {
            this.query_run(
                new SqlQueryBuilder()
                    .insert_into_values('item_drops', ['message'], [message])
                    .get_result()
            );
        }
    }

    async get_discord_id_from_drip_name(drip_username) {
        return await this.query_get(
            new SqlQueryBuilder()
                .select(['discord_id'])
                .from('users')
                .where_column_equals(['drip_username'], [drip_username])
                .get_result()
        );
    }
    
    //Gets array, deletes expired records, and returns filtered array
    async  get_bounty_ping_history() {
        const bounty_ping_arr = await this.get_bounty_ping_arr();
        const current_time = new Date().getTime();
        const three_hours = 1000 * 60 * 60 * 3; //Milliseconds

        let index = 0;
        while (index < bounty_ping_arr.length) {
            const timestamp = bounty_ping_arr[index].timestamp;
            const timestamp_time = new Date(timestamp).getTime();

            if ((current_time - timestamp_time) > three_hours) {
                this.delete_bounty_ping_record(bounty_ping_arr[index].mob, timestamp);
                bounty_ping_arr.splice(index, 1);
            }
            else {
                index++;
            }
        }

        return bounty_ping_arr;
    }

    async get_bounty_ping_arr() {
        return await this.query_all(
            new SqlQueryBuilder()
                .select(['*'])
                .from('bounty_ping_history')
                .get_result()
        );
    }

    async delete_bounty_ping_record(mob, timestamp) {
        this.query_run(
            new SqlQueryBuilder()
                .delete_from('bounty_ping_history')
                .where_column_equals(['mob', 'timestamp'], [mob, timestamp])
                .get_result()
        );
    }

    async add_bounty_ping_history(mob, timestamp) {
        this.query_run(
            new SqlQueryBuilder()
                .insert_into_values('bounty_ping_history', ['mob', 'timestamp'], [mob, timestamp])
                .get_result()
        );
    }
}

module.exports = DripDatabase;