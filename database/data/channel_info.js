const roles = [
    ["634550019126722590", "thunderstorm", "amar"],
    ["637336189439049777", "stormend", "amar"],
    ["689292919307501603", "event", "amar"],
    ["813286043146780742", "frenzy", "drip"],
    ["813430276801036338", "hell", "drip"],
    ["813430280583905321", "event", "drip"],
    ["827581098812899370", "soulhounds", "drip"],
    ["1067145939720097894", "aura", "drip"]
];

const channel_message_types = [
    ["thunderstorms", "amar", "amar_storm"],
    ["bot-spam", "amar", "amar_pings"],
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
    ["threads", "drip", "queries"],
    ["threads", "amar", "amar_pings"],
    ["threads", "yr", "lyr_pings"]
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
    ["raids", "drip", "spam_ping_button"],
    ["llamainchat", "drip", "game_time_to_chronos_time"],
    ["spit-bot", "drip", "game_time_to_chronos_time"],
    ["raids", "drip", "game_time_to_chronos_time"]
]

const thread_command_types = [
    ["threads", "drip", "active_hours"],
    ["threads", "drip", "add_herb"],
    ["threads", "drip", "bounty"],
    ["threads", "drip", "bounty_done"],
    ["threads", "drip", "check_bounty_done"],
    ["threads", "drip", "hades_training_calc"],
    ["threads", "drip", "settings"],
    ["threads", "drip", "game_time_to_chronos_time"]
]

module.exports = {
    roles,
    channel_message_types,
    channel_command_types,
    thread_message_types,
    thread_command_types
}