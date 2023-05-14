const { Client, GatewayIntentBits } = require('discord.js');

const DripDatabase = require('./database/DripDatabase.js');
const Users = require('./entities/Users.js');
const mobs = require('./database/data/mobs.js');

const ping_messages = require('./bot/message_processing/ping_messages.js');

const drip_users_tests = require('./testing/tests_for_Users_class.js');
const drip_db_tests = require('./testing/tests_for_DripDatabase_queries.js');

async function main() {
    
    require('dotenv').config();
    const client = await new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

    //deploy_commands();

    await Promise.all([
        load_bounty_bot(client),
        load_db(client)
    ]);

    client.Users = new Users(client.drip_db);
    await client.Users.init();
    client.mobs = mobs;
    restart_pings(client);

    //testing(client);
}

async function testing(client) {
    //drip_db_tests.run_all();
    //drip_users_tests.run_all(client);
}

async function restart_pings(client) {
    ping_messages.restart_ping_timers(client);
}
async function load_db(client) {
    client.drip_db = new DripDatabase('./database/data/drip.db');
    await client.drip_db.init();
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