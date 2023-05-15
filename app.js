const { Client, GatewayIntentBits } = require('discord.js');

const DripDatabase = require('./database/DripDatabase.js');
const Users = require('./EntityClasses/Users.js');
const Channels = require('./EntityClasses/Channels.js');
const PingController = require('./ControlClasses/PingController.js');
const mobs = require('./database/data/mobs.js');

const ping_messages = require('./bot/message_processing/ping_messages.js');

async function main() {

    require('dotenv').config();
    const client = await new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

    //require('./bot/deploy_commands.js').deployCommands();

    await require('./bot/BountyBot.js').BountyBot(client);
    await client.login(process.env.CLIENT_TOKEN);

    client.drip_db = new DripDatabase('./database/data/drip.db');
    await client.drip_db.init();

    client.Users = new Users(client.drip_db);
    await client.Users.init();

    client.Channels = new Channels();
    await client.Channels.init(client);

    client.PingController = new PingController(client.drip_db, client.Users, client.Channels);
    await client.PingController.init();

    client.mobs = mobs;



    //ping_messages.restart_ping_timers(client);
}
main();