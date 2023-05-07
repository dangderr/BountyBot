const crypto = require('crypto');

function generate_token(size = 16) {
    let token = "";
    let counter = 0;
    while (token.length < size) {
        token = crypto.randomBytes(128).toString('base64').replace(/[^a-z0-9]/gi, '');
        if (++counter >= 10)
            return token;
    }
    return token.slice(0, size);
}

module.exports.generate_token = generate_token;