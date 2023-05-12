const DripDatabase = require('../database/DripDatabase.js');
const wait = require('node:timers/promises').setTimeout;

async function run_all(client) {
    const discord_id_arr = [
        '573415328466599936',
        '468512328757805059',
        '628386552006836226'
    ];

    const users = client.users;
    const chronos = await users.get_user_by_drip_username('Chronos');

    console.log('============================');

    console.log(chronos.discord_id);
    console.log(chronos.discord_username);
    console.log(chronos.drip_username);

    console.log('============================');

    console.log(chronos.active);
    chronos.pause_notifications = true;
    await wait(500);
    console.log(chronos.active);
    chronos.pause_notifications = false;
    await wait(500);
    console.log(chronos.active);

    console.log('============================');

    console.log(chronos.follow_upcoming_events);
    chronos.follow_upcoming_events = true;
    await wait(500);
    console.log(chronos.follow_upcoming_events);
    chronos.follow_upcoming_events = false;
    await wait(500);
    console.log(chronos.follow_upcoming_events);

    console.log('============================');

    console.log(chronos.bountydone);
    chronos.bountydone = Date.now();
    await wait(500);
    console.log(chronos.bountydone);

    console.log('============================');

    for (const discord_id of discord_id_arr) {
        const user = await users.get_user(discord_id);
        console.log(user.discord_id);
        console.log(user.discord_username);
        console.log(user.drip_username);
    }
}

module.exports = {
    run_all
}