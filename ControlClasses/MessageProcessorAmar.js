
class MessageProcessorAmar {
    #ping_controller;

    constructor(ping_controller) {
        this.#ping_controller = ping_controller;
    }

    async check_storm_message(message) {
        let role_id;
        let location;
        let time_str;
        let type;

        if (message.content.includes("Time to grab a kite, a thunderstorm is rolling into")) {
            role_id = message.client.Channels.get_role_id('thunderstorm', 'amar');
            location = message.content.split(" into ")[1];
            time_str = message.content.split(' Time to grab')[0];
            type = 'amar_storm';
        }
        else if (message.content.includes("A rainbow emerges as a light rain begins to fall in")) {
            role_id = message.client.Channels.get_role_id('event', 'amar');
            location = message.content.split(" fall in ")[1];
            time_str = message.content.split(' A rainbow emerges')[0];
            type = 'amar_event';
        }
        else {
            return;
        }

        if (!role_id) {
            console.log('Error in getting role ID');
            return;
        }

        if (location.includes('! Travel')) {
            location = location.replace('! Travel', '');
        } else if (location.includes('!')) {
            location = location.replace('!', '');
        }

        const time_arr = time_str.split(':');
        const current_time = new Date();

        let minutes_ago = current_time.getUTCHours() - time_arr[0];
        minutes_ago *= 60;
        minutes_ago += (current_time.getUTCMinutes() - time_arr[1]);
        if (current_time.getUTCHours() < time_arr[0]) {     //Correction if ping occurs on a new day
            minutes_ago += 24 * 60;
        }

        let content = 'at ' + location;
        if (minutes_ago > 3) {
            content += ' started ' + minutes_ago + ' minutes ago';
        }

        this.#ping_controller.add_ping(null, role_id, message.channel.id, message.id, content, type, null, null);
    }
}

module.exports = MessageProcessorAmar;
