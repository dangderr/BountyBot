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

    /*****************
     *               *
     *  users table  *
     *               *
     *****************/

    async get_all_user_ids() {
        return await this.query_all(
            new SqlQueryBuilder()
                .select(['discord_id'])
                .from('users')
                .get_result()
        );
    }

    async get_users_table_record(discord_id) {
        return await this.query_get(
            new SqlQueryBuilder()
                .select(['*'])
                .from('users')
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
    }

    async add_user(discord_id, discord_username) {
        console.log(`Trying to add ${discord_id} and ${discord_username} to db`);
        this.query_run(
            new SqlQueryBuilder()
                .insert_into_values(
                    'users',
                    ['discord_id', 'discord_username', 'app_token'],
                    [discord_id, discord_username, tokens.generate_token(16)])
                .get_result()
        );

        this.query_run(
            new SqlQueryBuilder()
                .insert_into_values('user_ping_timers', ['discord_id'], [discord_id])
                .get_result()
        );
    }

    //Not used in program, but for here for manual removal. Maybe just make a script that does this.
    /*
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
    */

    async set_bounty_done(discord_id, bounty_done) {
        this.query_run(
            new SqlQueryBuilder()
                .update('users')
                .set(['bounty_done'], [bounty_done])
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
    }

    async set_follow_respawn_timers(discord_id, follow_respawn_timers) {
        this.query_run(
            new SqlQueryBuilder()
                .update('users')
                .set(['follow_respawn_timers'], [follow_respawn_timers])
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
    }

    async set_pause_notifications(discord_id, pause_notifications) {
        this.query_run(
            new SqlQueryBuilder()
                .update('users')
                .set(['pause_notifications'], [pause_notifications])
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
    }

    async set_active_hours(discord_id, active_hours_start, active_hours_end) {
        this.query_run(
            new SqlQueryBuilder()
                .update('users')
                .set(['active_hours_start', 'active_hours_end'], [active_hours_start, active_hours_end])
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
    }

    async set_sickle_percent(discord_id, sickle) {
        this.query_run(
            new SqlQueryBuilder()
                .update('users')
                .set(['sickle_percent'], [sickle])
                .where_column_equals(['discord_id'], [discord_id])
                .get_result()
        );
    }


    /*****************************
     *                           *
     *  bounties_followed table  *
     *                           *
     *****************************/

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

    /********************
     *                  *
     *  ping_logs table *
     *                  *
     ********************/

    async get_all_ping_logs() {
        return await this.query_all(
            new SqlQueryBuilder()
                .select(['*'])
                .from('ping_logs')
                .where_column_equals(['active'],[1])
                .get_result()
        );
    }

    async add_ping(user_id, channel_id, message_id, content, type, timestamp, delay) {
        return await this.query_run(
            new SqlQueryBuilder()
                .insert_into_values(
                    'ping_logs',
                    ['user_id', 'channel_id', 'message_id', 'content', 'type', 'timestamp', 'delay', 'active'],
                    [user_id, channel_id, message_id, content, type, timestamp, delay, 1]
                )
                .get_result()
        );
    }

    async deactivate_ping(id) {
        this.query_run(
            new SqlQueryBuilder()
                .update('ping_logs')
                .set(['active'], [0])
                .where_column_equals(['id'], [id])
                .get_result()
        );
    }

    async remove_ping(id) {
        this.query_run(
            new SqlQueryBuilder()
                .delete_from('ping_logs')
                .where_column_equals(['id'], [id])
                .get_result()
        );
    }


    /***********************
     *                     *
     *  event_timers table *
     *                     *
     ***********************/

    async get_event_timers_table() {
        return await this.query_all(
            new SqlQueryBuilder()
                .select(['*'])
                .from('event_timers')
                .get_result()
        );
    }

    async set_event_timer(category, timestamp) {
        this.query_run(
            new SqlQueryBuilder()
                .update('event_timers')
                .set(['timestamp'], [timestamp])
                .where_column_equals(['event_name'], [category])
                .get_result()
        );
    }


    /*******************************
     *                             *
     *  bounty_ping_history table  *
     *                             *
     *******************************/

    async get_bounty_ping_table() {
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


    /**************************
     *                        *
     *  last_ping_times table *
     *                        *
     **************************/

    async get_last_ping_times_table() {
        return await this.query_all(
            new SqlQueryBuilder()
                .select(['*'])
                .from('last_ping_times')
                .get_result()
        );
    }

    async update_last_ping_time(type, timestamp) {
        this.query_run(
            new SqlQueryBuilder()
                .update('last_ping_times')
                .set(['timestamp'], [timestamp])
                .where_column_equals(['type'], [type])
                .get_result()
        );
    }

    async add_last_ping_time(type, timestamp) {
        this.query_run(
            new SqlQueryBuilder()
                .insert_into_values('last_ping_times', ['type', 'timestamp'], [type, timestamp])
                .get_result()
        );
    }

    /*********************
     *                   *
     *  item_drops table *
     *                   *
     *********************/

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

    async get_item_drops() {
        return await this.query_all(
            new SqlQueryBuilder()
                .select(['*'])
                .from('item_drops')
                .order_by(['date'], ['DESC'])
                .get_result()
        );
    }

    /***************************
     *                         *
     *  drip_user_equips table *
     *                         *
     ***************************/

    async get_drip_user_equips() {
        return await this.query_all(
            new SqlQueryBuilder()
                .select(['*'])
                .from('drip_user_equips')
                .get_result()
        );
    }

    async add_drip_user_equips(user_id, item, type, gem, gem_tier) {
        return await this.query_run(
            new SqlQueryBuilder()
                .insert_into_values('drip_user_equips',
                    ['user_id', 'item', 'type', 'gem', 'gem_tier'],
                    [user_id, item, type, gem, gem_tier])
                .get_result()
        );
    }

    async delete_drip_user_equips(id) {
        this.query_run(
            new SqlQueryBuilder()
                .delete_from('drip_user_equips')
                .where_column_equals(['id'], [id])
                .get_result()
        );
    }

    /**************************
     *                        *
     *  drip_user_herbs table *
     *                        *
     **************************/

    async get_drip_user_herbs() {
        return await this.query_all(
            new SqlQueryBuilder()
                .select(['*'])
                .from('drip_user_herbs')
                .get_result()
        );
    }

    async add_drip_user_herbs(user_id, herb) {
        return await this.query_run(
            new SqlQueryBuilder()
                .insert_into_values('drip_user_herbs',
                    ['user_id', 'herb'],
                    [user_id, herb])
                .get_result()
        );
    }

    async delete_drip_user_herbs(id) {
        this.query_run(
            new SqlQueryBuilder()
                .delete_from('drip_user_herbs')
                .where_column_equals(['id'], [id])
                .get_result()
        );
    }
}

module.exports = DripDatabase;