class ReactionProcessorAmar {
    #ping_controller;

    constructor(ping_controller) {
        this.#ping_controller = ping_controller;
    }

    async route_reaction(reaction) {
        switch (reaction.Channel.name) {
            case 'general':
            case 'thunderstorm': this.#process_storm_reaction(reaction); break;
            default: //console.log(`Error: ReactionProcessorAmar cannot route reaction. No route for ${reaction.Channel.name}.`)
        }
    }

    async #process_storm_reaction(reaction) {
        const pings_for_message_id = this.#ping_controller.get_pings_by_message_id(reaction.message.reference.messageId);

        if (!pings_for_message_id || pings_for_message_id.length == 0) return;

        for (const ping of pings_for_message_id) {
            if (ping.type == 'amar_storm_end_reminder'
                || ping.type == 'amar_event_end_reminder'
            ) {
                ping.add_user_to_ping(reaction.User.discord_id);
            }
        }
    }
}

module.exports = ReactionProcessorAmar;