const { Events } = require('discord.js');
const MessageHandler = require('../../BoundaryClasses/MessageHandler.js');

async function execute(message) {
    MessageHandler.message(message);
}

const name = Events.MessageCreate;

module.exports = {
    name,
    execute
};