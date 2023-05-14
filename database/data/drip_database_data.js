schema = [
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
    `CREATE TABLE user_ping_timers (
        discord_id NVARCHAR(50) PRIMARY KEY NOT NULL,
        botcheck NVARCHAR(50),
        cauldron NVARCHAR(50),
        planting NVARCHAR(50),
        pet_training NVARCHAR(50),
        pet_exploration NVARCHAR(50),
        hades_training NVARCHAR(50),
        replanted NVARCHAR(50),
        soulhounds NVARCHAR(50),
        hades_attack NVARCHAR(50),
        hades_dragon NVARCHAR(50)
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
];

const events = [
    ['blace'],
    ['hell'],
    ['event'],
    ['soulhounds'],
    ['dt_frenzy'],
    ['dt_aura']
];

const roles = [
    ["634550019126722590", "thunderstorm", "amar"],
    ["689292919307501603", "event", "amar"],
    ["813286043146780742", "frenzy", "drip"],
    ["813430276801036338", "hell", "drip"],
    ["813430280583905321", "event", "drip"],
    ["827581098812899370", "soulhounds", "drip"],
    ["1067145939720097894", "aura", "drip"]
];

const channels = [
    ["624515808558710787", "llamainchat", "drip"],
    ["1052656050668572754", "bounties", "drip"],
    ["1082617920863080478", "spit-bot", "drip"],
    ["1006798906170032148", "hellllama", "drip"],
    ["634542930928861186", "thunderstorms", "amar"],
    ["778342000607887455", "general", "testserver"]
];

const channel_message_types = [
    ["thunderstorms", "amar", "amar_storm"],
    ["bounties", "drip", "bounty"],
    ["hellllama", "drip", "soulhounds"],
    ["llamainchat", "drip", "hell"],
    ["llamainchat", "drip", "event"],
    ["llamainchat", "drip", "dt_frenzy"],
    ["llamainchat", "drip", "blace_frenzy"],
    ["llamainchat", "drip", "aura"],
    ["llamainchat", "drip", "drops"],
    ["spit-bot", "drip", "pings"],
    ["general", "testserver", "lyr"]
];

const table_data = [
    { table: 'event_timers', columns: ['event_name'], values_2d_array: events },
    { table: 'role_ids', columns: ['role_id', 'role', 'server'], values_2d_array: roles },
    { table: 'channel_list', columns: ['channel_id', 'channel_name', 'channel_server'], values_2d_array: channels },
    { table: 'channel_whitelist', columns: ['channel_name', 'channel_server', 'message_type'], values_2d_array: channel_message_types }
];

module.exports = {
    schema,
    table_data
}
