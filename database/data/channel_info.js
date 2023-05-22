const roles = [
    ["634550019126722590", "thunderstorm", "amar"],
    ["689292919307501603", "event", "amar"],
    ["813286043146780742", "frenzy", "drip"],
    ["813430276801036338", "hell", "drip"],
    ["813430280583905321", "event", "drip"],
    ["827581098812899370", "soulhounds", "drip"],
    ["1067145939720097894", "aura", "drip"]
];
/*
const channels = [
    ["624515808558710787", "llamainchat", "drip"],
    ["1052656050668572754", "bounties", "drip"],
    ["1082617920863080478", "spit-bot", "drip"],
    ["1006798906170032148", "hellllama", "drip"],
    ["945298363547545631", "raids", "drip"],
    ["634542930928861186", "thunderstorms", "amar"],
    ["778342000607887455", "general", "testserver"]
];*/

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
    ["spit-bot", "drip", "queries"]
];

const thread_message_types = [
    ["threads", "drip", "pings"],
    ["threads", "drip", "queries"]
]

const channel_command_types = [
    ["spit-bot", "drip", "active_hours"],
    ["bounties", "drip", "active_hours"],
    ["spit-bot", "drip", "add_herb"],
    ["bounties", "drip", "bounty"],
    ["bounties", "drip", "bounty_done"],
    ["bounties", "drip", "check_bounty_done"],
    ["llamainchat", "drip", "global_settings"],
    ["spit-bot", "drip", "global_settings"],
    ["hellllama", "drip", "hades_training_calc"],
    ["spit-bot", "drip", "settings"],
    ["raids", "drip", "spam_ping_button"]
]

const thread_command_types = [
    ["threads", "drip", "active_hours"],
    ["threads", "drip", "add_herb"],
    ["threads", "drip", "bounty"],
    ["threads", "drip", "bounty_done"],
    ["threads", "drip", "check_bounty_done"],
    ["threads", "drip", "hades_training_calc"],
    ["threads", "drip", "settings"]
]

module.exports = {
    roles,
    channel_message_types,
    channel_command_types,
    thread_message_types,
    thread_command_types
}