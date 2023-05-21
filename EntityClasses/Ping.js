
class Ping {
    id;
    user_id;
    role_id;
    channel_id;
    message_id;
    content;
    type;
    timestamp;
    delay;

    constructor(ping_log_record) {
        this.id = ping_log_record.id;
        this.user_id = ping_log_record.user_id;
        this.role_id = ping_log_record.role_id;
        this.channel_id = ping_log_record.channel_id;
        this.message_id = ping_log_record.message_id;
        this.content = ping_log_record.content;
        this.type = ping_log_record.type;
        this.timestamp = ping_log_record.timestamp;
        this.delay = ping_log_record.delay;
    }

    get unix_time() {
        return Math.round(new Date(this.timestamp).getTime() / 1000);
    }
}

module.exports = Ping;