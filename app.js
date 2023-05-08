const { Client, GatewayIntentBits } = require('discord.js');
const ping_messages = require('./bot/message_processing/ping_messages.js');
const db_access = require('./database/db_access.js')
const wait = require('node:timers/promises').setTimeout;
const SqlQueryBuilder = require('./database/SqlQueryBuilder.js');
const DripDatabase = require('./database/DripDatabase.js');

async function main() {
    /*
    require('dotenv').config();
    const client = await new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

    deploy_commands();

    await Promise.all([
        load_bounty_bot(client),
        load_db(client)
    ]);

    restart_pings(client);*/

    const drip_db = new DripDatabase('./database/drip.db');
    await drip_db.init();
    drip_db.test_query();
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