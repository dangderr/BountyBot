const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) {
				await interaction.reply(`No command matching ${interaction.commandName} was found.`);
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}
			try {
				console.log(`Received ${interaction.commandName} command from user ${interaction.user.username}`);

				interaction.User = await interaction.client.Users.add_user(interaction.user);
				interaction.Channel = await interaction.client.Channels.get_channel_by_id(interaction.channelId);
				if (!interaction.Channel) {
					interaction.reply("You're not allowed to do that in this channel");
					return;
				}

				await command.execute(interaction);
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	},
};