const fs = require('node:fs');
const dotenv = require("dotenv");
const path = require('node:path');
const { Collection, REST, Routes } = require('discord.js');

class BountyBot {
    constructor() {

    }

    async init(client, redeploy = false) {
        if (redeploy) {
            await this.#deploy_commands();
        }

        const promises = new Array();
        promises.push(this.#init_commands(client));
        promises.push(this.#init_events(client));
        await Promises.all(promises);
    }

    async #init_commands(client) {
        client.commands = new Collection();
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    async #init_events() {
        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }
    }

    async #deploy_commands() {
        dotenv.config();
        const token = process.env.CLIENT_TOKEN;
        const clientId = process.env.CLIENT_ID;
        const guildIds = process.env.GUILD_ID.split(',');

        const commands = [];
        const commandFiles = fs.readdirSync('./bot/commands').filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            commands.push(command.data.toJSON());
        }

        const rest = new REST({ version: '10' }).setToken(token);

        (async () => {
            try {
                console.log(`Started refreshing ${commands.length} application (/) commands.`);

                let data;
                for (const guildId of guildIds) {
                    data = await rest.put(
                        Routes.applicationGuildCommands(clientId, guildId),
                        { body: commands },
                    );
                }

                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            }
            catch (error) {
                console.error(error);
            }
        })();
    }
}

module.exports = BountyBot;
