
class Channel {
    #channel        //Discord channel object
    #id;
    #name
    #server

    #message_types = new Array();

    constructor(id, name, server) {
        this.#id = id;
        this.#name = name;
        this.#server = server;
    }

    async init(client) {
        this.#channel = await client.channels.fetch(this.id);
    }

    get channel() { return this.#channel; }
    get id() { return this.#id; }
    get name() { return this.#name; }
    get server() { return this.#server; }
    get message_types() { return this.#message_types; }

    set channel(invalid) { console.log(`Something tried to set channel obj for ${this.id} - ${this.name} - ${this.server}`); }
    set id(invalid) { console.log(`Something tried to set id for ${this.id} - ${this.name} - ${this.server}`); }
    set name(invalid) { console.log(`Something tried to set name for ${this.id} - ${this.name} - ${this.server}`); }
    set server(invalid) { console.log(`Something tried to set server for ${this.id} - ${this.name} - ${this.server}`); }
    set message_types(message_type) { this.#message_types.push(message_type); }
}

module.exports = Channel;