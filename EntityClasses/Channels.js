const channel_info = require('../database/data/channel_info.js');
const Channel = require('./Channel.js');
const Role = require('./Role.js');

class Channels {
    #db;
    #channels = new Array();
    #roles = new Array();

    constructor(db) {
        this.#db = db;

        for (const role of channel_info.roles) {
            this.#roles.push(new Role(role[0], role[1], role[2]));
        }
    }

    async init(client) {
        const channel_records = await this.#db.get_channels();
        for (const record of channel_records) {
            this.#channels.push(new Channel(record.id, record.name, record.server));
        }

        const testserver = this.get_channel_by_name_server('general', 'testserver');

        for (const message_type of channel_info.channel_message_types) {
            this.get_channel_by_name_server(message_type[0], message_type[1]).message_types = message_type[2];
            if (!testserver.message_types.includes(message_type)) {
                testserver.message_types = message_type[2];
            }
        }

        for (const command_type of channel_info.channel_command_types) {
            this.get_channel_by_name_server(command_type[0], command_type[1]).command_types = command_type[2];
            if (!testserver.command_types.includes(command_type)) {
                testserver.command_types = command_type[2];
            }
        }

        for (const thread of this.#channels.filter(i => i.server === 'thread')) {
            this.#add_message_types_to_thread(thread);
        }

        let promises = new Array();
        for (const channel of this.#channels) {
            promises.push(channel.init(client));
        }
        await Promise.all(promises);
    }

    get_channel_by_id(id) {
        return this.#channels.find(i => i.id == id);
    }

    get_channel_by_name_server(name, server) {
        return this.#channels.find(i => i.name == name && i.server == server);
    }

    get_role_id(name, server) {
        return this.#roles.find(i => i.name == name && i.server == server).id;
    }

    async add_thread_to_channels_list(id, client) {
        const channel = this.get_channel_by_id(id);
        if (!channel) {
            const thread = new Channel(id, `thread-${id}`, 'thread');
            await this.#db.add_channel(id, `thread-${id}`, 'thread')
            this.#channels.push(thread);
            this.#add_message_types_to_thread(thread);
            thread.init(client);
        }
    }

    #add_message_types_to_thread(thread) {
        for (const message_type of channel_info.thread_message_types) {
            thread.message_types = message_type[2];
        }
        for (const command_type of channel_info.thread_command_types) {
            thread.command_types = command_type[2];
        }
    }
}

module.exports = Channels;