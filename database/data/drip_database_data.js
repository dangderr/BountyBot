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
        activehoursend NVARCHAR(50),
        follow_upcoming_events NVARCHAR(50)
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
        hades_attack NVARCHAR(50)
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

const mobs = [
    ['Abnormal Spider', 'dungeons', null],
    ['Psychic Snail', 'dungeons', null],
    ['Sunburned Golem', 'dungeons', null],
    ['Ooze', 'dungeons', null],
    ['Giant Cyclop', 'dungeons', null],
    ['Bone Beast', 'dungeons', null],
    ['Tormentor', 'dungeons', null],
    ['Ice Phantom', 'dungeons', null],
    ['Balor', 'dungeons', null],
    ['Leviathan', 'dungeons', null],
    ['Dreadlord', 'dungeons', null],
    ['Belial', 'dungeons', null],
    ['Lord Ribbit', 'summons', 'low'],
    ['Glaucus', 'summons', 'low'],
    ['Constrictor', 'summons', 'low'],
    ['Griffin', 'summons', 'low'],
    ['Infester', 'summons', 'low'],
    ['Scarab', 'summons', 'low'],
    ['Fleshhunter', 'summons', 'low'],
    ['Hannibal', 'summons', 'low'],
    ['Spinebreaker', 'summons', 'low'],
    ['Orcus', 'summons', 'low'],
    ['Strong Bones', 'summons', 'low'],
    ['Gargoyle', 'summons', 'low'],
    ['Devourer', 'summons', 'low'],
    ['Ifrit', 'summons', 'low'],
    ['Zincarus', 'summons', 'high'],
    ['Iceheart', 'summons', 'high'],
    ['Anomaly', 'summons', 'high'],
    ['Shadow Fiend', 'summons', 'high'],
    ['Proteus', 'summons', 'high'],
    ['Jaws', 'summons', 'high'],
    ['King of Bones', 'summons', 'high'],
    ['Horror', 'summons', 'high'],
    ['Mastema', 'summons', 'high'],
    ['Summanus', 'summons', 'high'],
    ['Fighting Dummy', 'ff', '1'],
    ['Giant Rat', 'ff', '1'],
    ['Huge Bug', 'ff', '1'],
    ['Haunted Doll', 'ff', '1'],
    ['Overgrown Spider', 'ff', '1'],
    ['Creepy Beetle', 'ff', '1'],
    ['Scrawny Goblin', 'ff', '1'],
    ['Green Crawler', 'ff', '2'],
    ['Cursed Bat', 'ff', '2'],
    ['Wood Spider', 'ff', '2'],
    ['Bloodsucker', 'ff', '2'],
    ['Goblin Elder', 'ff', '2'],
    ['Serpent', 'ff', '2'],
    ['Witchdoctor', 'ff', '2'],
    ['Sand Reaver', 'ff', '3'],
    ['Gremlin', 'ff', '3'],
    ['Minion', 'ff', '3'],
    ['Goblin', 'ff', '3'],
    ['Lion', 'ff', '3'],
    ['Scorpion', 'ff', '3'],
    ['Mummy', 'ff', '3'],
    ['Slimy Slug', 'ff', '4'],
    ['Guard Goblin', 'ff', '4'],
    ['Crocodile', 'ff', '4'],
    ['Ravager', 'ff', '4'],
    ['Enormous Toad', 'ff', '4'],
    ['Lurker', 'ff', '4'],
    ['Swarm Soldier', 'ff', '4'],
    ['Bogard', 'ff', '5'],
    ['Cyclops Worker', 'ff', '5'],
    ['Hermit', 'ff', '5'],
    ['Troll', 'ff', '5'],
    ['Shadow Goblin', 'ff', '5'],
    ['Orc Warrior', 'ff', '5'],
    ['Orc Savager', 'ff', '5'],
    ['Skeleton', 'ff', '6'],
    ['Banshee', 'ff', '6'],
    ['Zombie', 'ff', '6'],
    ['Armored Skeleton', 'ff', '6'],
    ['Ghoul', 'ff', '6'],
    ['Vampire', 'ff', '6'],
    ['Skeleton Commander', 'ff', '6'],
    ['Lava Eater', 'ff', '7'],
    ['Observer', 'ff', '7'],
    ['Pit Viper', 'ff', '7'],
    ['Raptor', 'ff', '7'],
    ['Deathgazer', 'ff', '7'],
    ['Chaos Seeker', 'ff', '7'],
    ['Grand Butcher', 'ff', '7'],
    ['Arctic Wolfear', 'ff', '8'],
    ['Yeti', 'ff', '8'],
    ['Crystal Golem', 'ff', '8'],
    ['Jin', 'ff', '8'],
    ['Frostsaber', 'ff', '8'],
    ['Nightmare', 'ff', '8'],
    ['Frost Giant', 'ff', '8'],
    ['Cursebearer', 'ff', '9'],
    ['Primal Troll', 'ff', '9'],
    ['Swamp Keeper', 'ff', '9'],
    ['Stone Giant', 'ff', '9'],
    ['Treant', 'ff', '9'],
    ['Amarok', 'ff', '9'],
    ['Black Phoenix', 'ff', '9'],
    ['Abyss Worm', 'ff', '10'],
    ['Devil Whale', 'ff', '10'],
    ['Greenbeard', 'ff', '10'],
    ['Wavehil', 'ff', '10'],
    ['Charybdis', 'ff', '10'],
    ['Oceanus', 'ff', '10'],
    ['Nereus', 'ff', '10'],
    ['Crypt Guardian', 'ff', '11'],
    ['Spectre', 'ff', '11'],
    ['Draugar', 'ff', '11'],
    ['Darkmaster', 'ff', '11'],
    ['Lich', 'ff', '11'],
    ['Wraith', 'ff', '11'],
    ['Reaper', 'ff', '11'],
    ['Carnage', 'ff', '12'],
    ['Grunt', 'ff', '12'],
    ['Titan', 'ff', '12'],
    ['Demogorgon', 'ff', '12'],
    ['Horned Demon', 'ff', '12'],
    ['Dragonkin', 'ff', '12'],
    ['Terror', 'ff', '12'],
];

const table_data = [
    { table: 'event_timers', columns: ['event_name'], values_2d_array: events },
    { table: 'role_ids', columns: ['role_id', 'role', 'server'], values_2d_array: roles },
    { table: 'channel_list', columns: ['channel_id', 'channel_name', 'channel_server'], values_2d_array: channels },
    { table: 'channel_whitelist', columns: ['channel_name', 'channel_server', 'message_type'], values_2d_array: channel_message_types },
    { table: 'mobs', columns: ['mob', 'category', 'subcategory'], values_2d_array: mobs },
];

module.exports = {
    schema,
    table_data
}
