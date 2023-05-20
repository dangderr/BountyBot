const { Client, GatewayIntentBits } = require('discord.js');

const BountyBot = require('./bot/BountyBot.js');

const DripDatabase = require('./database/DripDatabase.js');
const Users = require('./EntityClasses/Users.js');
const Channels = require('./EntityClasses/Channels.js');
const GlobalSettings = require('./EntityClasses/GlobalSettings.js');

const PingController = require('./ControlClasses/PingController.js');
const MessageHandler = require('./BoundaryClasses/MessageHandler.js');


async function main() {
    const client = await new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

    await init_bot(client);
    await init_classes(client);
}

async function init_bot(client) {
    const redeploy_commands = false;
    await BountyBot.init(client, redeploy_commands);

    require('dotenv').config();
    await client.login(process.env.CLIENT_TOKEN);
}

async function init_classes(client) {
    client.drip_db = new DripDatabase('./database/data/drip.db');
    await client.drip_db.init();

    client.GlobalSettings = new GlobalSettings(client.drip_db);
    await client.GlobalSettings.init();

    client.Users = new Users(client.drip_db, client.GlobalSettings);
    await client.Users.init();

    client.Channels = new Channels();
    await client.Channels.init(client);

    client.Data = new Object;
    client.Data.mobs = require('./database/data/mobs.js');
    client.Data.herbs = require('./database/data/herbs.js');
    client.Data.pet_trainings = require('./database/data/pet_trainings.js');

    client.PingController = new PingController(client);
    await client.PingController.init();

    client.MessageHandler = new MessageHandler(client);
    await client.MessageHandler.init();
}

main();