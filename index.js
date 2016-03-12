var Twitter = require('node-tweet-stream');
var id = 'summit-view-twitter';
var config, summit, tw;

module.exports = function(s) {
    summit = s;

    var tw = new Twitter({
        consumer_key: config.consumer_key,
        consumer_secret: config.consumer_secret,
        token: config.token,
        token_secret: config.token_secret,
    });

    tw.on('tweet', function (tweet) {
        summit.io.emit('tweet', tweet);
    });

    tw.on('error', function (err) {

    });

    // TODO: Remove when settings-API is implemented in summit-view
    tw.track('socket.io');
    tw.track('javascript');

    return {
        id: id,
    };
};

module.exports.id = id;

module.exports.client = __dirname + '/lib/client.js';

module.exports.init = function(cfg) {
    config = cfg;
    return module.exports;
};
