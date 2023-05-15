class Role {
    #id;
    #name;
    #server;

    constructor(id, name, server) {
        this.#id = id;
        this.#name = name;
        this.#server = server;
    }

    get id() { return this.#id; }
    get name() { return this.#name; }
    get server() { return this.#server; }

    set id(invalid) { console.log(`Something tried to set id for ${this.id} - ${this.name} - ${this.server}`); }
    set name(invalid) { console.log(`Something tried to set name for ${this.id} - ${this.name} - ${this.server}`); }
    set server(invalid) { console.log(`Something tried to set server for ${this.id} - ${this.name} - ${this.server}`); }
}

module.exports = Role;