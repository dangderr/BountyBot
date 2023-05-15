const channel_info = require('../database/data/channel_info.js');
const Channel = require('./Channel.js');
const Role = require('./Role.js');

class Channels {
    #channels = new Array();
    #roles = new Array();

    constructor(db) {
        for (const channel_row of channel_info.channels) {
            this.#channels.push(new Channel(channel_row[0], channel_row[1], channel_row[2]));
        }

        const testserver = this.get_channel_by_name_server('general', 'testserver');

        for (const message_type of channel_info.channel_message_types) {
            this.get_channel_by_name_server(message_type[0], message_type[1]).message_types = message_type[2];

            if (!testserver.message_types.includes(message_type)) {
                testserver.message_types = message_type[2];
            }
        }

        for (const role of channel_info.roles) {
            this.#roles.push(new Role(role[0], role[1], role[2]));
        }
    }

    async init(client) {
        let promises = new Array();
        for (const channel of this.#channels) {
            promises.push(channel.init(client));
        }
        Promise.all(promises);
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
}

module.exports = Channels;