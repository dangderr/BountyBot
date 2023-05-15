const schema = [
    `CREATE TABLE users (
        discord_id NVARCHAR(50) PRIMARY KEY NOT NULL,
        discord_username NVARCHAR(50) NOT NULL,
        drip_username NVARCHAR(50),
        app_token NVARCHAR(50) NOT NULL,
        bounty_done NVARCHAR(50),
        active_hours_start NVARCHAR(50),
        active_hours_end NVARCHAR(50),
        follow_respawn_timers NVARCHAR(50),
        pause_notifications NVARCHAR(50)
    );`
    ,
    `CREATE TABLE bounties_followed (
        discord_id NVARCHAR(50) NOT NULL,
        mob NVARCHAR(50) NOT NULL
    );`
    ,
    `CREATE TABLE bounty_ping_history (
        mob NVARCHAR(50) NOT NULL,
        timestamp NVARCHAR(50) NOT NULL
    );`
    ,
    `CREATE TABLE item_drops (
        message NVARCHAR(50) NOT NULL,
        date NVARCHAR(50) NOT NULL DEFAULT CURRENT_DATE
    );`
    ,
    `CREATE TABLE ping_logs(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        role_id TEXT,
        channel_id NVARCHAR(50),
        message_id NVARCHAR(50),
        type NVARCHAR(50),
        timestamp NVARCHAR(50),
        delay INTEGER
    );`
    ,
    `CREATE TABLE event_timers (
        event_name NVARCHAR(50) PRIMARY KEY NOT NULL,
        timestamp NVARCHAR(50)
    );`
];

const events = [
    ['blace'],
    ['hell'],
    ['event'],
    ['soulhounds'],
    ['dt_frenzy'],
    ['dt_aura']
];

const table_data = [
    { table: 'event_timers', columns: ['event_name'], values_2d_array: events }
];

module.exports = {
    schema,
    table_data
}
