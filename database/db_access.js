const tokens = require('../utils/app_tokens');

async function generate_console_message(msg) {
    if (msg.includes("Success")) return;

    //TODO: Add to db?
    let timestamp = "[" + (new Date()).toUTCString() + "] ";
    console.log(timestamp + msg);
}

async function add_user(db, discord_id, discord_username, drip_username) {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO users(discord_id, discord_username, drip_username, app_token)
            VALUES (?, ?, ?, ?)
        `, discord_id, discord_username, drip_username, tokens.generate_token(16), (err) => {
            if (err) {
                generate_console_message(`Error: INSERT INTO users VALUES ( ${discord_id}, ${discord_username}, ${drip_username}, token )`);
                reject(err);
            }
            else {
                generate_console_message(`Success: INSERT INTO users VALUES ( ${discord_id}, ${discord_username}, ${drip_username}, token )`);
            }
        });
        db.run(`
            INSERT INTO bounty_preferences(discord_id)
            VALUES (?)
        `, discord_id, (err) => {
            if (err) {
                generate_console_message(`Error: INSERT INTO bounty_preferences VALUES ( ${discord_id})`);
                reject(err);
            }
            else {
                generate_console_message(`Success: INSERT INTO bounty_preferences VALUES ( ${discord_id})`);
            }
        });
        db.run(`
            INSERT INTO user_ping_timers(discord_id)
            VALUES (?)
        `, discord_id, (err) => {
            if (err) {
                generate_console_message(`Error: INSERT INTO user_ping_timers VALUES ( ${discord_id})`);
                reject(err);
            }
            else {
                generate_console_message(`Success: INSERT INTO user_ping_timers VALUES ( ${discord_id})`);
            }
        });
        resolve();
    });
}

async function add_bounty(db, discord_id, mob) {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO bounties_followed(discord_id, mob)
            VALUES (? , ?)
        `, discord_id, mob, (err) => {
            if (err) {
                generate_console_message(`Error: INSERT INTO bounties_followed VALUES ( ${discord_id}, ${mob} )`);
                reject(err);
            }
            else {
                generate_console_message(`Success: INSERT INTO bounties_followed VALUES ( ${discord_id}, ${mob} )`);
                resolve();
            }
        });
    });
}

async function remove_bounty(db, discord_id, mob) {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM bounties_followed
            WHERE discord_id = ? AND mob = ?
        `, discord_id, mob, (err) => {
            if (err) {
                generate_console_message(`Error: DELETE FROM bounties_followed WHERE discord_id = ${discord_id} AND mob = ${mob} )`);
                reject(err);
            }
            else {
                generate_console_message(`Success: DELETE FROM bounties_followed WHERE discord_id = ${discord_id} AND mob = ${mob} )`);
                resolve();
            }
        });
    });
}

async function check_user_is_in_db(db, discord_id) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT discord_id
            FROM users u
            WHERE u.discord_id = ?
        `, discord_id, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT discord_id FROM users u WHERE u.discord_id = ${discord_id}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT discord_id FROM users u WHERE u.discord_id = ${discord_id}`);
                resolve((rows.length > 0));
            }
        });
    });
}

async function get_mobs(db, category, subcategory) {
    return new Promise((resolve, reject) => {
        if (subcategory) {
            db.all(`
                SELECT mob
                FROM mobs m
                WHERE m.category = ? AND m.subcategory = ?
            `, category, subcategory, (err, rows) => {
                if (err) {
                    generate_console_message(`Error: SELECT mob FROM mobs m WHERE m.category = ${category} AND m.subcategory = ${subcategory}`);
                    reject(err);
                }
                else {
                    generate_console_message(`Success: SELECT mob FROM mobs m WHERE m.category = ${category} AND m.subcategory = ${subcategory}`);
                    resolve(rows);
                }
            });
        }
        else {
            db.all(`
                SELECT mob
                FROM mobs m
                WHERE m.category = ?
            `, category, (err, rows) => {
                if (err) {
                    generate_console_message(`Error: SELECT mob FROM mobs m WHERE m.category = ${category}`);
                    reject(err);
                }
                else {
                    generate_console_message(`Success: SELECT mob FROM mobs m WHERE m.category = ${category}`);
                    resolve(rows);
                }
            });
        }
    });
}

async function get_bounties_followed_table(db) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT *
            FROM bounties_followed
        `, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT * FROM bounties_followed`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT * FROM bounties_followed`);
                resolve(rows);
            }
        });
    });
}

async function get_bounties_followed(db, discord_id) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT mob
            FROM bounties_followed bf
            WHERE bf.discord_id = ?
        `, discord_id, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT mob FROM bounties_followed bf WHERE bf.discord_id = ${discord_id}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT mob FROM bounties_followed bf WHERE bf.discord_id = ${discord_id}`);
                resolve(rows);
            }
        });
    });
}

async function get_distinct_users_in_bounties_followed(db) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT DISTINCT discord_id
            FROM bounties_followed
        `, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT DISTINCT discord_id FROM bounties_followed`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT DISTINCT discord_id FROM bounties_followed`);
                resolve(rows);
            }
        });
    });
}

async function get_bountydone(db, discord_id) {
    return new Promise((resolve, reject) => {
        if (!discord_id) {
            db.all(`
                SELECT discord_id, bountydone
                FROM bounty_preferences
            `, discord_id, (err, rows) => {
                if (err) {
                    generate_console_message(`Error: SELECT discord_id, bountydone FROM bounty_preferences`);
                    reject(err);
                }
                else {
                    generate_console_message(`Success: SELECT discord_id, bountydone FROM bounty_preferences`);
                    resolve(rows);
                }
            });
        }
        else {
            db.all(`
                SELECT bountydone
                FROM bounty_preferences bp
                WHERE bp.discord_id = ?
            `, discord_id, (err, rows) => {
                if (err) {
                    generate_console_message(`Error: SELECT bountydone FROM bounty_preferences bp WHERE bp.discord_id = ${discord_id}`);
                    reject(err);
                }
                else {
                    generate_console_message(`Success: SELECT bountydone FROM bounty_preferences bp WHERE bp.discord_id = ${discord_id}`);
                    resolve(rows[0].bountydone);
                }
            });
        }
    })
}

async function set_bountydone(db, discord_id, bountydone) {
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE bounty_preferences
            SET bountydone = ?
            WHERE discord_id = ?
        `, bountydone, discord_id, (err) => {
            if (err) {
                generate_console_message(`Error: UPDATE bounty_preferences SET bountydone = ${bountydone} WHERE discord_id = ${discord_id}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: UPDATE bounty_preferences SET bountydone = ${bountydone} WHERE discord_id = ${discord_id}`);
                resolve();
            }
        });
    })
}

async function get_active_hours(db, discord_id) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT activehoursstart, activehoursend
            FROM bounty_preferences bf
            WHERE bf.discord_id = ?
        `, discord_id, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT activehoursstart, activehoursend FROM bounty_preferences WHERE discord_id = ${discord_id}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT activehoursstart, activehoursend FROM bounty_preferences WHERE discord_id = ${discord_id}`);
                if (rows.length > 0) resolve(rows[0])
                else resolve(null);
            }
        });
    })
}

async function set_active_hours(db, discord_id, starttime, endtime) {
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE bounty_preferences
            SET activehoursstart = ?, activehoursend = ?
            WHERE discord_id = ?
        `, starttime, endtime, discord_id, (err) => {
            if (err) {
                generate_console_message(`Error: UPDATE bounty_preferences SET activehoursstart = ${starttime}, activehoursend = ${endtime} WHERE discord_id = ${discord_id}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: UPDATE bounty_preferences SET activehoursstart = ${starttime}, activehoursend = ${endtime} WHERE discord_id = ${discord_id}`);
                resolve();
            }
        });
    })
}

async function get_usernames(db, discord_id_arr) {
    return new Promise((resolve, reject) => {
        const placeholders = discord_id_arr.map(() => "?").join(",");
        db.all(`
            SELECT discord_username, drip_username
            FROM users
            WHERE users.discord_id IN (${placeholders})
        `, discord_id_arr, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT discord_username, drip_username FROM users WHERE users.discord_id IN discord_id_array`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT discord_username, drip_username FROM users WHERE users.discord_id IN discord_id_array`);
                let out = new Array();
                rows.forEach((row) => {
                    if (row.drip_username != null) out.push(row.drip_username);
                    else out.push(row.discord_username);
                });
                resolve(out);
            }
        })
    })
}

async function get_channel_info(db, channel_id) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT *
            FROM channel_list
            WHERE channel_list.channel_id = ?
        `, channel_id, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT * FROM channel_list WHERE channel_id = ${channel_id}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT * FROM channel_list WHERE channel_id = ${channel_id}`);
                if (rows.length > 0) resolve(rows[0]);
                else resolve(null);
            }
        });
    });
}

async function get_channel_id(db, channel_name, channel_server) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT channel_id
            FROM channel_list
            WHERE channel_list.channel_name = ? AND channel_list.channel_server = ?
        `, channel_name, channel_server, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT channel_id FROM channel_list WHERE channel_name = ${channel_name} AND channel_server = ${channel_server}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT channel_id FROM channel_list WHERE channel_name = ${channel_name} AND channel_server = ${channel_server}`);
                if (rows.length > 0) resolve(rows[0]);
                else resolve(null);
            }
        });
    });
}

async function get_channel_message_types(db, channel_name, channel_server) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT message_type
            FROM channel_whitelist cw
            WHERE cw.channel_name = ? AND cw.channel_server = ?
        `, channel_name, channel_server, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT message_type FROM channel_whitelist WHERE channel_name = ${channel_name} AND channel_server = ${channel_server}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT message_type FROM channel_whitelist WHERE channel_name = ${channel_name} AND channel_server = ${channel_server}`);
                resolve(rows);
            }
        });
    });
}

async function get_all_message_types(db) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT DISTINCT message_type
            FROM channel_whitelist
        `, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT DISTINCT message_type FROM channel_whitelist`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT DISTINCT message_type FROM channel_whitelist`);
                resolve(rows);
            }
        });
    });
}

async function get_role_id(db, role, server) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT role_id
            FROM role_ids ri
            WHERE ri.role = ? AND ri.server = ?
        `, role, server, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT role_id FROM role_ids WHERE role = ${role} AND server = ${server}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT role_id FROM role_ids WHERE role = ${role} AND server = ${server}`);
                if (rows.length > 0) resolve(rows[0].role_id);
                else resolve(null);
            }
        });
    });
}

async function get_user_ping_timer(db, discord_id, category) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT ?
            FROM user_ping_timers upt
            WHERE upt.discord_id = ?
        `, category, discord_id, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT ${category} FROM user_ping_timers WHERE discord_id = ${discord_id}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT ${category} FROM user_ping_timers WHERE discord_id = ${discord_id}`);
                if (rows.length > 0) resolve(rows[0][category]);
                else resolve(null);
            }
        });
    });
}

async function set_user_ping_timer(db, discord_id, category, timestamp) {
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE user_ping_timers
            SET ${category} = ?
            WHERE discord_id = ?
        `, timestamp, discord_id, (err) => {
            if (err) {
                generate_console_message(`Error: UPDATE user_ping_timers SET ${category} = ${timestamp} WHERE discord_id = ${discord_id}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: UPDATE user_ping_timers SET ${category} = ${timestamp} WHERE discord_id = ${discord_id}`);
                resolve();
            }
        })
    })
}

async function get_all_ping_timers(db) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT *
            FROM user_ping_timers
        `, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT * FROM user_ping_timers`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT * FROM user_ping_timers`);
                if (rows.length > 0) resolve(rows);
                else resolve(null);
            }
        });
    });
}

async function get_event_timers_timestamp(db, category = null) {
    return new Promise((resolve, reject) => {
        if (!category) {
            db.all(`
                SELECT *
                FROM event_timers
            `, (err, rows) => {
                if (err) {
                    generate_console_message(`Error: SELECT * FROM event_timers`);
                    reject(err);
                }
                else {
                    generate_console_message(`Success: SELECT * FROM event_timers`);
                    if (rows.length > 0) resolve(rows);
                    else resolve(null);
                }
            });
        }
        else {
            db.all(`
                SELECT *
                FROM event_timers e
                WHERE e.event_name = ?
            `, category, (err, rows) => {
                if (err) {
                    generate_console_message(`Error: SELECT * FROM event_timers WHERE event_name = ${category}`);
                    reject(err);
                }
                else {
                    generate_console_message(`Success: SELECT * FROM event_timers WHERE event_name = ${category}`);
                    if (rows.length > 0) resolve(rows[0].timestamp);
                    else resolve(null);
                }
            });
        }
    });
}

async function set_event_timers_timestamp(db, category, timestamp) {
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE event_timers
            SET timestamp = ?
            WHERE event_name = ?
        `, timestamp, category, (err) => {
            if (err) {
                generate_console_message(`Error: UPDATE event_timers SET timestamp = ${timestamp} WHERE event_name = ${category}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: UPDATE event_timers SET timestamp = ${timestamp} WHERE event_name = ${category}`);
                resolve();
            }
        });
    })
}

async function add_item_drop(db, message) {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO item_drops(message)
            VALUES (?)
        `, message, (err) => {
            if (err) {
                generate_console_message(`Error: INSERT INTO item_drops VALUES ( ${message} )`);
                reject(err);
            }
            else {
                generate_console_message(`Success: INSERT INTO item_drops VALUES ( ${message} )`);
                resolve();
            }
        });
    });
}

async function get_discord_id_from_drip_name(db, drip_username) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT discord_id
            FROM users
            WHERE users.drip_username = ?
        `, drip_username, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT discord_id FROM users WHERE drip_username = ${drip_username}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT discord_id FROM users WHERE drip_username = ${drip_username}`);
                if (rows.length > 0) resolve(rows[0].discord_id);
                else resolve(null);
            }
        });
    });
}

async function get_bounty_ping_history(db) {
    const bounty_ping_arr = await get_bounty_ping_arr(db);
    const current_time = new Date().getTime();
    const three_hours = 1000 * 60 * 60 * 3; //Milliseconds

    let index = 0;
    while (index < bounty_ping_arr.length) {
        const timestamp = bounty_ping_arr[index].timestamp;
        const timestamp_time = new Date(timestamp).getTime();

        if ((current_time - timestamp_time) > three_hours) {
            delete_bounty_ping_record(db, bounty_ping_arr[index].mob, timestamp);
            bounty_ping_arr.splice(index, 1);
        }
        else {
            index++;
        }
    }

    return bounty_ping_arr;
}

async function get_bounty_ping_arr(db) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT *
            FROM bounty_ping_history
        `, (err, rows) => {
            if (err) {
                generate_console_message(`Error: SELECT * FROM bounty_ping_history`);
                reject(err);
            }
            else {
                generate_console_message(`Success: SELECT * FROM bounty_ping_history`);
                resolve(rows);
            }
        });
    });
}

async function delete_bounty_ping_record(db, mob, timestamp) {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM bounty_ping_history
            WHERE mob = ? and timestamp = ?
        `, mob, timestamp, (err) => {
            if (err) {
                generate_console_message(`Error: DELETE FROM bounty_ping_history WHERE mob = ${mob} and timestamp = ${timestamp}`);
                reject(err);
            }
            else {
                generate_console_message(`Success: DELETE FROM bounty_ping_history WHERE mob = ${mob} and timestamp = ${timestamp}`);
                resolve();
            }
        });
    });
}

async function add_bounty_ping_history(db, mob, timestamp) {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO bounty_ping_history(mob, timestamp)
            VALUES (?, ?)
        `, mob, timestamp, (err) => {
            if (err) {
                generate_console_message(`Error: INSERT INTO bounty_ping_history(mob, timestamp) VALUES (${mob}, ${timestamp})`);
                reject(err);
            }
            else {
                generate_console_message(`Success: INSERT INTO bounty_ping_history(mob, timestamp) VALUES (${mob}, ${timestamp})`);
                resolve();
            }
        });
    });
}

module.exports = {
    add_user,
    add_bounty,
    remove_bounty,
    check_user_is_in_db,
    get_mobs,
    get_bounties_followed_table,
    get_bounties_followed,
    get_distinct_users_in_bounties_followed,
    get_bountydone,
    set_bountydone,
    get_active_hours,
    set_active_hours,
    get_usernames,
    get_channel_info,
    get_channel_id,
    get_channel_message_types,
    get_all_message_types,
    get_role_id,
    get_user_ping_timer,
    set_user_ping_timer,
    get_all_ping_timers,
    get_event_timers_timestamp,
    set_event_timers_timestamp,
    add_item_drop,
    get_discord_id_from_drip_name,
    get_bounty_ping_history,
    add_bounty_ping_history
}