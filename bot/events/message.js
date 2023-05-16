const { Events } = require('discord.js');

async function execute(message) {
    message.client.MessageHandler.message(message);
}

const name = Events.MessageCreate;

module.exports = {
    name,
    execute
};