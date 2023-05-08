schema = [
    `CREATE TABLE users (
        discord_id NVARCHAR(50) PRIMARY KEY NOT NULL,
        discord_username NVARCHAR(50) NOT NULL,
        drip_username NVARCHAR(50),
        app_token NVARCHAR(50) NOT NULL
    );`
    ,
    `CREATE TABLE bounties_followed (
        discord_id NVARCHAR(50) NOT NULL,
        mob NVARCHAR(50) NOT NULL
    );`
    ,
    `CREATE TABLE bounty_preferences (
        discord_id NVARCHAR(50) PRIMARY KEY NOT NULL,
        bountydone NVARCHAR(50),
        activehoursstart NVARCHAR(50),
        activehoursend NVARCHAR(50)
    );`
    ,
    `CREATE TABLE user_ping_timers (
        discord_id NVARCHAR(50) PRIMARY KEY NOT NULL,
        botcheck NVARCHAR(50),
        cauldron NVARCHAR(50),
        planting NVARCHAR(50),
        pet_training NVARCHAR(50),
        pet_exploration NVARCHAR(50),
        hell_training NVARCHAR(50),
        replanted NVARCHAR(50)
    );`
    ,
    `CREATE TABLE item_drops (
        message NVARCHAR(50) NOT NULL,
        date NVARCHAR(50) NOT NULL DEFAULT CURRENT_DATE
    );`
    ,
    `CREATE TABLE bounty_ping_history (
        mob NVARCHAR(50) NOT NULL,
        timestamp NVARCHAR(50) NOT NULL
    );`
    ,
    `CREATE TABLE event_timers (
        event_name NVARCHAR(50) PRIMARY KEY NOT NULL,
        timestamp NVARCHAR(50)
    );`
    ,
    `CREATE TABLE role_ids (
        role_id NVARCHAR(50) PRIMARY KEY NOT NULL,
        role NVARCHAR(50) NOT NULL,
        server NVARCHAR(50) NOT NULL
    );`
    ,
    `CREATE TABLE channel_list (
        channel_id NVARCHAR(50) PRIMARY KEY NOT NULL,
        channel_name NVARCHAR(50) NOT NULL,
        channel_server NVARCHAR(50) NOT NULL
    );`
    ,
    `CREATE TABLE channel_whitelist (
        channel_name NVARCHAR(50) NOT NULL,
        channel_server NVARCHAR(50) NOT NULL,
        message_type NVARCHAR(50) NOT NULL
    );`
    ,
    `CREATE TABLE mobs (
        mob NVARCHAR(50) PRIMARY KEY NOT NULL,
        category NVARCHAR(50) NOT NULL,
        subcategory NVARCHAR(50)
    );`
];


const table_data = [
    { table: 'event_timers', columns: ['event_name'], values_2d_array: [['blace'], ['hell'], ['event'], ['soulhounds'], ['dt_frenzy'], ['dt_aura']] },
    { table: 'role_ids', columns: ['role_id', 'role', 'server'], values_2d_array: require('../utils/roles.js') },
    { table: 'channel_list', columns: ['channel_id', 'channel_name', 'channel_server'], values_2d_array: require('../utils/channels.js').channels },
    { table: 'channel_whitelist', columns: ['channel_name', 'channel_server', 'message_type'], values_2d_array: require('../utils/channels.js').channel_message_types },
    { table: 'mobs', columns: ['mob', 'category', 'subcategory'], values_2d_array: require('../utils/mobs.js') },
];

module.exports = {
    schema,
    table_data
}