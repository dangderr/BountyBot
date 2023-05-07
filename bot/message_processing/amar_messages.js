const db_access = require('../../database/db_access.js');

async function check_amar_storm_message(message) {
    const db = message.client.db;
    try {
        let roleID;
        let location;

        if (message.content.includes("Time to grab a kite, a thunderstorm is rolling into")) {
            //roleID = "634550019126722590";
            roleID = await db_access.get_role_id(db, 'thunderstorm', 'amar');
            location = message.content.split(" into ")[1];
        }
        else if (message.content.includes("A rainbow emerges as a light rain begins to fall in")) {
            //roleID = "689292919307501603";
            roleID = await db_access.get_role_id(db, 'event', 'amar');
            location = message.content.split(" fall in ")[1];
        }
        else {
            return;
        }

        if (!roleID) {
            console.log('Error in getting role ID');
            return;
        }

        let str = "<@&" + roleID + "> at " + location;
        const channel = message.client.channels.cache.get(message.channelId);
        channel.send(str);
    }
    catch (err) {
        console.log('Error in processing Amar Storm Notification');
        console.log(err);
    }
}

module.exports = {
    check_amar_storm_message
}