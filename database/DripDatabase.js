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
                .get_result()
        );
    }

    async add_ping(user_id, channel_id, message_id, type, timestamp, delay) {
        return await this.query_run(
            new SqlQueryBuilder()
                .insert_into_values(
                    'ping_logs',
                    ['user_id', 'channel_id', 'message_id', 'type', 'timestamp', 'delay'],
                    [user_id, channel_id, message_id, type, timestamp, delay]
                )
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







    /*******************************
     *                             *
     *  bounty_ping_history table  *
     *                             *
     *******************************/

    //Gets array, deletes expired records, and returns filtered array
    //This logic will probably be removed and add to PingScheduler class
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