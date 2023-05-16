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
        content NVARCHAR(500),
        type NVARCHAR(50),
        timestamp NVARCHAR(50),
        delay INTEGER
    );`
    ,
    `CREATE TABLE event_timers (
        event_name NVARCHAR(50) PRIMARY KEY NOT NULL,
        timestamp NVARCHAR(50),
        min_time INTEGER,
        max_time INTEGER
    );`
    ,
    `CREATE TABLE last_ping_times(
        type NVARCHAR(100) PRIMARY KEY NOT NULL,
        timestamp NVARCHAR(50)
    );`
];

const events = [
    ['blace', 14400000, 21600000],
    ['soulhounds', 19800000, 21600000],
    ['treant', 10800000, 14400000],
    ['quartz_titan', 21600000, 28800000],
    ['pumpkin', 10800000, 14400000],
    ['snowman', 10800000, 14400000]
];

const table_data = [
    { table: 'event_timers', columns: ['event_name', 'min_time', 'max_time'], values_2d_array: events }
];

module.exports = {
    schema,
    table_data
}
