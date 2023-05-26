function sqlite_date_string_to_Date_obj(str_date, ymd_delimiter = '-') {
    if (!str_date) return null;

    let pattern = new RegExp("(\\d{4})" + ymd_delimiter + "(\\d{2})" + ymd_delimiter + "(\\d{2}) (\\d{2}):(\\d{2}):(\\d{2})");
    let parts = str_date.match(pattern);

    return new Date(Date.UTC(
        parseInt(parts[1])
        , parseInt(parts[2], 10) - 1
        , parseInt(parts[3], 10)
        , parseInt(parts[4], 10)
        , parseInt(parts[5], 10)
        , parseInt(parts[6], 10)
        , 0
    ));
}

function check_same_day(first, second) {
    if (!first || !second) return false;
    first = new Date(first);
    second = new Date(second);

    if (first.getUTCFullYear() == second.getUTCFullYear() && first.getUTCMonth() == second.getUTCMonth() && first.getUTCDate() == second.getUTCDate())
        return true;
    return false;
}

//Returns milliseconds
function parse_drip_time_string(msg_arr) {
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    for (let row = 0; row < msg_arr.length; row++) {
        let arr = msg_arr[row].split(' ');
        try {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].includes('d.')) {
                    if (arr[i] == 'd.' && i > 0) {
                        try {
                            let temp = parseInt(arr[i - 1]);
                            if (temp) days = temp;
                        } catch (err) { }
                    }
                    else {
                        try {
                            let temp = parseInt(arr[i]);
                            if (temp) days = temp;
                        } catch (err) { }
                    }
                } else if (arr[i].includes('h.')) {
                    if (arr[i] == 'h.' && i > 0) {
                        try {
                            let temp = parseInt(arr[i - 1]);
                            if (temp) hours = temp;
                        } catch (err) { }
                    }
                    else {
                        try {
                            let temp = parseInt(arr[i]);
                            if (temp) hours = temp;
                        } catch (err) { }
                    }
                }
                else if (arr[i].includes('min.')) {
                    if (arr[i] == 'min.' && i > 0) {
                        try {
                            let temp = parseInt(arr[i - 1]);
                            if (temp) minutes = temp;
                        } catch (err) { }
                    }
                    else {
                        try {
                            let temp = parseInt(arr[i]);
                            if (temp) minutes = temp;
                        } catch (err) { }
                    }
                }
                else if (arr[i].includes('s.')) {
                    if (arr[i] == 's.' && i > 0) {
                        try {
                            let temp = parseInt(arr[i - 1]);
                            if (temp) seconds = temp;
                        } catch (err) { }
                    }
                    else {
                        try {
                            let temp = parseInt(arr[i]);
                            if (temp) seconds = temp;
                        } catch (err) { }
                    }
                }
            }
        }
        catch (err) {
            console.log('Error in parsing time string.');
            console.log(err);
        }
    }
    return (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000;
}

function parse_amar_time_string(msg_arr) {
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    for (let row = 0; row < msg_arr.length; row++) {
        let arr = msg_arr[row].split(' ');
        try {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].includes('hr')) {
                    if ((arr[i] == 'hr' || arr[i] == 'hrs') && i > 0) {
                        try {
                            let temp = parseInt(arr[i - 1]);
                            if (temp) hours = temp;
                        } catch (err) { }
                    }
                    else {
                        try {
                            let temp = parseInt(arr[i]);
                            if (temp) hours = temp;
                        } catch (err) { }
                    }
                }
                else if (arr[i].includes('min')) {
                    if ((arr[i] == 'min' || arr[i] == 'mins') && i > 0) {
                        try {
                            let temp = parseInt(arr[i - 1]);
                            if (temp) minutes = temp;
                        } catch (err) { }
                    }
                    else {
                        try {
                            let temp = parseInt(arr[i]);
                            if (temp) minutes = temp;
                        } catch (err) { }
                    }
                }
            }
        }
        catch (err) {
            console.log('Error in parsing time string.');
            console.log(err);
        }
    }
    return (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000;
}

function check_active_time(activehourstart, activehourend) {  //hh:mm format
    //true == active

    if (!activehourstart || !activehourend)
        return true;

    if (activehourstart == activehourend)       //If time is same, then always active
        return true;

    const current_time = new Date();
    let hour = current_time.getUTCHours();
    let minutes = current_time.getUTCMinutes();

    let starthour = activehourstart.split(':')[0];
    let startminutes = activehourstart.split(':')[1];
    let endhour = activehourend.split(':')[0];
    let endminutes = activehourend.split(':')[1];


    let startbeforeend = true;      //Two possibilities, start time before end time or end time before start time
    if (endhour < starthour || (endhour == starthour && endminutes < startminutes))
        startbeforeend = false;

    if (startbeforeend) {
        if (hour < starthour)
            return false;
        if (hour == starthour && minutes < startminutes)
            return false;
        if (hour > endhour)
            return false;
        if (hour == endhour && minutes > endminutes)
            return false;
        return true;
    }
    else {
        if (hour > starthour)
            return true;
        if (hour == starthour && minutes > startminutes)
            return true;
        if (hour < endhour)
            return true;
        if (hour == endhour && minutes < endminutes)
            return true;
        return false;
    }

    return true;
}

function parse_global_timestamp(message) {
    message = message.trim();
    if (message.includes(' Global: ')) {
        message = message.split(' Global: ')[0];      // '[HH:MM:SS]'
    } else if (message.includes(' Event: ')) {
        message = message.split(' Event: ')[0];      // '[HH:MM:SS]'
    }

    if (message.length != 10 || message.charAt(0) != '[' || message.charAt(9) != ']') {
        return;
    }

    try {
        const timeArr = message.slice(1, 9).split(':');      // '[HH:MM:SS]' => ['HH', 'MM', 'SS']
        const current_time = new Date();
        const event_notification_time = new Date(Date.UTC(
            current_time.getUTCFullYear(),
            current_time.getUTCMonth(),
            current_time.getUTCDate(),
            parseInt(timeArr[0]),
            parseInt(timeArr[1]),
            parseInt(timeArr[2])
        ));;

        //Correction if original message vs paste time spans the daily reset
        if (parseInt(timeArr[0]) > current_time.getUTCHours()) {
            event_notification_time.setUTCDate(event_notification_time.getUTCDate() - 1);
        }

        return event_notification_time.toISOString();
    } catch {
        return;
    }
}

function get_time_str_from_hours(hours) {
    let str = '';
    if (hours > 1) {
        str += Math.floor(hours).toString() + ' h.';
        hours -= Math.floor(hours);
        if (hours > 0) {
            let minutes = hours * 60;
            str += ' ' + Math.ceil(minutes).toString() + ' min.';
        }
    } else if (hours * 60 > 1) {
        let minutes = hours * 60;
        str += Math.floor(minutes).toString() + ' min.';
        minutes -= Math.floor(minutes);
        if (minutes > 0) {
            let seconds = minutes * 60;
            str += ' ' + Math.ceil(seconds).toString() + ' s.';
        }
    } else if (hours * 60 * 60 > 1) {
        let seconds = hours * 60 * 60;
        str += Math.ceil(seconds).toString() + ' s.';
    } else {
        str = '0 s.';
    }

    return str;
}

module.exports = {
    sqlite_date_string_to_Date_obj,
    check_same_day,
    parse_drip_time_string,
    parse_amar_time_string,
    check_active_time,
    parse_global_timestamp,
    get_time_str_from_hours
}