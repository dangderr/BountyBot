const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db_path = './database/drip.db';

async function load_database() {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(db_path)) {
            let db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
                if (err) reject(err);
                else resolve(db);
                //run_testing_query(db);
            });
        }
        else {
            let db = new sqlite3.Database(db_path, (err) => {
                if (err) reject(err);
                else {
                    create_tables(db);
                    resolve(db);
                }
            });
        }
    });
}

async function create_tables(db) {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE users (
                discord_id NVARCHAR(50) PRIMARY KEY NOT NULL,
                discord_username NVARCHAR(50) NOT NULL,
                drip_username NVARCHAR(50),
                app_token NVARCHAR(50) NOT NULL
            );
        `);
        db.run(`
            CREATE TABLE bounties_followed (
                discord_id NVARCHAR(50) NOT NULL,
                mob NVARCHAR(50) NOT NULL
            );
        `);
        db.run(`
            CREATE TABLE bounty_preferences (
                discord_id NVARCHAR(50) PRIMARY KEY NOT NULL,
                bountydone NVARCHAR(50),
                activehoursstart NVARCHAR(50),
                activehoursend NVARCHAR(50)
            );
        `);
        db.run(`
            CREATE TABLE user_ping_timers (
                discord_id NVARCHAR(50) PRIMARY KEY NOT NULL,
                botcheck NVARCHAR(50),
                cauldron NVARCHAR(50),
                planting NVARCHAR(50),
                pet_training NVARCHAR(50),
                pet_exploration NVARCHAR(50),
                hell_training NVARCHAR(50),
                replanted NVARCHAR(50)
            );
        `);
        db.run(`
            CREATE TABLE item_drops (
                message NVARCHAR(50) NOT NULL,
                date NVARCHAR(50) NOT NULL DEFAULT CURRENT_DATE
            );
        `);
        db.run(`
            CREATE TABLE bounty_ping_history (
                mob NVARCHAR(50) NOT NULL,
                timestamp NVARCHAR(50) NOT NULL
            );
        `);

        create_events_timer_table(db);
        create_mobs_table(db);
        create_channels_tables(db);
        create_roles_table(db);
        resolve();
    });
}

async function create_events_timer_table(db) {
    return new Promise((resolve, reject) => {
        if (!db) {
            db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
                if (err) reject(err);
            });
        }

        db.serialize(() => {
            db.run(`
                CREATE TABLE event_timers (
                    event_name NVARCHAR(50) PRIMARY KEY NOT NULL,
                    timestamp NVARCHAR(50)
                );
            `);

            let event_names = [ 'blace', 'hell', 'event', 'soulhounds' , 'dt_frenzy', 'dt_aura' ]

            let sql_statement_insert_role = db.prepare(`
                INSERT INTO event_timers (event_name)
                VALUES (?)
            `);

            for (let event_name of event_names) {
                sql_statement_insert_role.run(event_name, (err) => {
                    if (err) {
                        if (err) reject(err);
                    }
                });
            }
            resolve();
        });
    });
}

async function create_roles_table(db) {
    return new Promise((resolve, reject) => {
        if (!db) {
            db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
                if (err) reject(err);
            });
        }

        db.serialize(() => {
            db.run(`
                CREATE TABLE role_ids (
                    role_id NVARCHAR(50) PRIMARY KEY NOT NULL,
                    role NVARCHAR(50) NOT NULL,
                    server NVARCHAR(50) NOT NULL
                );
            `);

            let sql_statement_insert_role = db.prepare(`
                INSERT INTO role_ids (role_id, role, server)
                VALUES (?, ?, ?)
            `);

            const roles = require('../utils/roles.js').roles;
            for (let role of roles) {
                sql_statement_insert_role.run(role, (err) => {
                    if (err) {
                        if (err) reject(err);
                    }
                });
            }
            resolve();
        });
    });
}

async function create_channels_tables(db) {
    return new Promise((resolve, reject) => {
        if (!db) {
            db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
                if (err) reject(err);
            });
        }

        db.serialize(() => {
            db.run(`
                CREATE TABLE channel_list (
                    channel_id NVARCHAR(50) PRIMARY KEY NOT NULL,
                    channel_name NVARCHAR(50) NOT NULL,
                    channel_server NVARCHAR(50) NOT NULL
                );
            `);

            let sql_statement_insert_channels = db.prepare(`
                INSERT INTO channel_list (channel_id, channel_name, channel_server)
                VALUES (?, ?, ?)
            `);

            const channels = require('../utils/channels.js').channels;
            for (let channel of channels) {
                sql_statement_insert_channels.run(channel, (err) => {
                    if (err) {
                        if (err) reject(err);
                    }
                });
            }

            db.run(`
                CREATE TABLE channel_whitelist (
                    channel_name NVARCHAR(50) NOT NULL,
                    channel_server NVARCHAR(50) NOT NULL,
                    message_type NVARCHAR(50) NOT NULL
                );
            `);

            let sql_statement_insert_channel_message_type = db.prepare(`
                INSERT INTO channel_whitelist (channel_name, channel_server, message_type)
                VALUES (?, ?, ?)
            `);

            const channel_message_types = require('../utils/channels.js').channel_message_types;
            for (let channel_message_type of channel_message_types) {
                sql_statement_insert_channel_message_type.run(channel_message_type, (err) => {
                    if (err) {
                        if (err) reject(err);
                    }
                });
            }
            resolve();
        });
    });
}

async function create_mobs_table(db) {
    return new Promise((resolve, reject) => {
        if (!db) {
            db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
                if (err) reject(err);
            });
        }

        db.serialize(() => {
            db.run(`
                CREATE TABLE mobs (
                    mob NVARCHAR(50) PRIMARY KEY NOT NULL,
                    category NVARCHAR(50) NOT NULL,
                    subcategory NVARCHAR(50)
                );
            `);

            let sql_statement_insert_mob = db.prepare(`
                INSERT INTO mobs (mob, category, subcategory)
                VALUES (?, ?, ?)
            `);

            const mobs = require('../utils/mobs.js').mobs;
            for (let mob of mobs) {
                sql_statement_insert_mob.run(mob, (err) => {
                    if (err) {
                        if (err) reject(err);
                    }
                });
            }
            resolve();
        });
    });
}


function run_testing_query(db) {
    db.all(`SELECT * FROM users`, (err, rows) => {
        rows.forEach(row => {
            console.log(row.discord_id, row.drip_username, row.discord_username, row.app_token);
        });
        }
    );
}

module.exports.load_database = load_database;
module.exports.create_mobs_table = create_mobs_table;