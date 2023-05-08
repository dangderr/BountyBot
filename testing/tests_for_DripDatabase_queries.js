const DripDatabase = require('../database/DripDatabase.js');

async function run_all() {
    const discord_id_arr = [
        '573415328466599936',
        '468512328757805059',
        '628386552006836226'
    ]
    const drip_db = new DripDatabase('./database/data/drip.db');
    await drip_db.init();

    console.log('=================================================')


    await drip_db.add_user('asdfasdf', 'asdfasdf', 'asdfasdf');
    console.log(await drip_db.check_user_is_in_db('asdfasdf'));
    await drip_db.remove_user('asdfasdf');
    console.log(await drip_db.check_user_is_in_db('asdfasdf'));

    console.log(await drip_db.get_usernames(discord_id_arr));

    console.log(await drip_db.get_discord_id_from_drip_name('Chronos'));


    console.log('=================================================')


    console.log(await drip_db.get_bounties_followed(discord_id_arr[0]));
    await drip_db.add_bounty(discord_id_arr[0], 'Fighting Dummy');
    console.log(await drip_db.get_bounties_followed(discord_id_arr[0]));
    await drip_db.remove_bounty(discord_id_arr[0], 'Fighting Dummy');
    console.log(await drip_db.get_bounties_followed(discord_id_arr[0]));

    console.log(await drip_db.get_bounties_followed());
    console.log(await drip_db.get_distinct_users_in_bounties_followed());


    console.log('=================================================')


    console.log(await drip_db.get_bountydone(discord_id_arr[0]));
    await drip_db.set_bountydone(discord_id_arr[0], new Date().toISOString());
    console.log(await drip_db.get_bountydone(discord_id_arr[0]));


    console.log('=================================================')


    console.log(await drip_db.get_mobs('dungeons'));
    console.log(await drip_db.get_mobs('ff', '11'));


    console.log('=================================================')


    console.log(await drip_db.get_active_hours(discord_id_arr[0]));
    await drip_db.set_active_hours(discord_id_arr[0], '08:00', '00:30');
    console.log(await drip_db.get_active_hours(discord_id_arr[0]));


    console.log('=================================================')

    const channels = [
        ["624515808558710787", "llamainchat", "drip"],
        ["1052656050668572754", "bounties", "drip"],
        ["1082617920863080478", "spit-bot", "drip"]
    ];

    console.log(await drip_db.get_channel_info(channels[0][0]));
    console.log(await drip_db.get_channel_id(channels[0][1], channels[0][2]));
    console.log(await drip_db.get_channel_message_types(channels[0][1], channels[0][2]));
    console.log(await drip_db.get_all_message_types());


    console.log('=================================================')


    const roles = [
        ["634550019126722590", "thunderstorm", "amar"],
        ["689292919307501603", "event", "amar"],
        ["813286043146780742", "frenzy", "drip"],
    ];

    console.log(await drip_db.get_role_id(roles[0][1], roles[0][2]));


    console.log('=================================================')


    console.log(await drip_db.get_user_ping_timer(discord_id_arr[0], 'planting'));
    await drip_db.set_user_ping_timer(discord_id_arr[0], 'planting', new Date().toISOString());
    console.log(await drip_db.get_user_ping_timer(discord_id_arr[0], 'planting'));
    console.log(await drip_db.get_all_ping_timers());


    console.log('=================================================')


    console.log(await drip_db.get_event_timers_timestamp());
    console.log(await drip_db.get_event_timers_timestamp('blace'));
    await drip_db.set_event_timers_timestamp('blace', new Date().toISOString());
    console.log(await drip_db.get_event_timers_timestamp('blace'));


    console.log('=================================================')


    await drip_db.add_item_drop('[17:19:16] Global: Kailnahle killed Nereus and obtained Tectonic Belt!');


    console.log('=================================================')


    console.log(await drip_db.get_bounty_ping_history());
    await drip_db.add_bounty_ping_history('Levithan', new Date().toISOString());
    console.log(await drip_db.get_bounty_ping_history());
}

module.exports = {
    run_all
}