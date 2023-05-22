const { Events } = require('discord.js');

async function execute(message) {
    if (message.channel.isThread()) {
        //return;
        await message.client.Channels.add_thread_to_channels_list(message.channel.id, message.client);
    }

    message.client.MessageHandler.message(message);
}

const name = Events.MessageCreate;

module.exports = {
    name,
    execute
};