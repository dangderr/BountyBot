const { Client, GatewayIntentBits } = require('discord.js');
const ping_messages = require('./bot/message_processing/ping_messages.js');
const db_access = require('./database/db_access.js')
const wait = require('node:timers/promises').setTimeout;

async function main() {
    require('dotenv').config();
    const client = await new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

    //deploy_commands();

    await load_bounty_bot(client);
    await load_db(client);

    restart_pings(client);
}

async function restart_pings(client) {
    ping_messages.restart_ping_timers(client);
}
async function load_db(client) {
    client.db = await require('./database/main_database.js').load_database();
}

async function load_bounty_bot(client) {
    await require('./bot/BountyBot.js').BountyBot(client);
    await client.login(process.env.CLIENT_TOKEN);
}

//Required when new commands are created
function deploy_commands() {
    require('./bot/deploy_commands.js').deployCommands();
}

main();