async function check_amar_storm_message(message) {
    const db = message.client.drip_db;

    try {
        let role_id;
        let location;

        if (message.content.includes("Time to grab a kite, a thunderstorm is rolling into")) {
            role_id = await db.get_role_id('thunderstorm', 'amar');
            location = message.content.split(" into ")[1];
        }
        else if (message.content.includes("A rainbow emerges as a light rain begins to fall in")) {
            role_id = await db.get_role_id('event', 'amar');
            location = message.content.split(" fall in ")[1];
        }
        else {
            return;
        }

        if (!role_id) {
            console.log('Error in getting role ID');
            return;
        }

        let str = "<@&" + role_id + "> at " + location;
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