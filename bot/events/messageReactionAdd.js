const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(reaction, user) {
		reaction.client.ReactionHandler.reaction(reaction, user);
	},
};