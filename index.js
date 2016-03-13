var Twitter = require('node-tweet-stream');
var id = 'summit-view-twitter';
var config, summit, tw, keywords = [], latest = [];

var track = function(topic) {
    // untrack current keywords
    while( i = keywords.pop() ) {
        tw.untrack(i);
    }

    // track new keywords
    var topics = topic.split(',');
    for (var i = topics.length - 1; i >= 0; i--) {
        var keyword = topics[i].trim();
        keywords.push(keyword);
        tw.track(keyword);
    }
};

module.exports = function(s) {
    summit = s;

    // emit the latest tweets on new connection
    summit.io.on('connection', function() {
        summit.io.emit('tweets', latest);
    });

    // init twitter-client
    tw = new Twitter({
        consumer_key: config.consumer_key,
        consumer_secret: config.consumer_secret,
        token: config.token,
        token_secret: config.token_secret,
    });

    // emit tweets as they come in
    tw.on('tweet', function (tweet) {
        summit.io.emit('tweet', tweet);

        if( latest.length == 10 ) {
            latest.shift();
        }

        latest.push(tweet);
    });

    tw.on('error', function (err) {

    });

    return summit.settings()
        .then(function(settings) {

            if( !config.consumer_key ) {
                summit.registerSetting({
                    name: 'consumer_key',
                    label: 'Consumer Key (n/a)',
                    type: 'text',
                    value: settings.consumer_key || '',
                });
            }

            if( !config.consumer_secret ) {
                summit.registerSetting({
                    name: 'consumer_secret',
                    label: 'Consumer Secret (n/a)',
                    type: 'text',
                    value: settings.consumer_secret || '',
                });
            }

            if( !config.token ) {
                summit.registerSetting({
                    name: 'token',
                    label: 'Token (n/a)',
                    type: 'text',
                    value: settings.token || '',
                });
            }

            if( !config.token_secret ) {
                summit.registerSetting({
                    name: 'token_secret',
                    label: 'Token Secret (n/a)',
                    type: 'text',
                    value: settings.token_secret || '',
                });
            }

            summit.registerSetting({
                name: 'topic',
                label: 'Topic',
                type: 'text',
                instructions: 'Enter topic to track. Separate multiple topics with a comma.',
                icon: 'hashtag',
                value: settings.topic || '',
            });

            if( settings.topic ) {
                track(settings.topic)
            }

            return {
                id: id,
            };
        });
};

module.exports.id = id;

module.exports.client = __dirname + '/lib/client.js';

module.exports.style = __dirname + '/public/style.css';

module.exports.onSettings = function(settings) {
    track(settings.topic);
};

module.exports.init = function(cfg) {
    config = cfg;
    return module.exports;
};
