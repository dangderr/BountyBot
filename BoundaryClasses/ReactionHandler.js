const ReactionProcessorAmar = require('../ControlClasses/ReactionProcessorAmar.js');

class ReactionHandler {
    #amar;

    constructor(client) {
        this.#amar = new ReactionProcessorAmar(client.PingController);
    }

    async init() {

    }

    async reaction(reaction, user) {
        if (user.bot) return;
        if (reaction.message.author.username != 'Bounty Bot') return;

        reaction.Channel = reaction.client.Channels.get_channel_by_id(reaction.message.channelId);
        if (!reaction.Channel) return;

        reaction.User = await reaction.client.Users.add_user(user);

        this.#route_reaction(reaction);
    }

    async #route_reaction(reaction) {
        switch (reaction.Channel.server) {
            case 'testserver':
            case 'amar': this.#amar.route_reaction(reaction); break;
            default: //console.log(`Error: ReactionHandler cannot route reaction. No route for ${reaction.Channel.server}.`)
        }
    }
}

module.exports = ReactionHandler;