var Twitter = require('node-tweet-stream');
var id = 'summit-view-twitter';
var config, settings, summit, tw, latest = [];

var track = function(topic) {
    if( !tw ) {
        return;
    }

    // untrack current keywords
    tw.untrackAll();

    // track new keywords
    var topics = topic.split(',');
    for (var i = topics.length - 1; i >= 0; i--) {
        tw.track(topics[i].trim());
    }

    if( topic.trim().length == 0 ) {
        summit.io.emit('loading', 'No topics to track...');
    }
    else {
        summit.io.emit('loaded');
    }
};

var initClient = function() {
    if( tw ) {
        tw.untrackAll();
    }

    var cfg = {
        consumer_key: config.consumer_key || settings.consumer_key || '',
        consumer_secret: config.consumer_secret || settings.consumer_secret || '',
        token: config.token || settings.token || '',
        token_secret: config.token_secret || settings.token_secret || '',
        cacheLength: config.cacheLength || 15,
    };

    if( cfg.consumer_key && cfg.consumer_secret && cfg.token && cfg.token_secret ) {
        tw = new Twitter(cfg);

        // emit tweets as they come in
        tw.on('tweet', function (tweet) {
            summit.io.emit('tweet', tweet);

            if( latest.length >= cfg.cacheLength ) {
                latest.shift();
            }

            latest.push(tweet);
        });

        summit.io.emit('loaded');
    }
    else {
        if( tw ) {
            tw = false;
            summit.io.emit('loading', 'Need API-settings...');
        }
    }
};

module.exports = function(s) {
    summit = s;
    config = config || {};

    // emit the latest tweets on new connection
    summit.io.on('connection', function(socket) {
        socket.emit('tweets', latest);

        if( tw ) {
            socket.emit('loaded');
        }
        else {
            socket.emit('loading', 'Need settings...');
        }
    });

    return summit.settings()
        .then(function(s) {
            settings = s || {};

            if( !config.consumer_key ) {
                summit.registerSetting({
                    name: 'consumer_key',
                    label: 'Consumer Key',
                    type: 'text',
                    value: settings.consumer_key || '',
                });
            }

            if( !config.consumer_secret ) {
                summit.registerSetting({
                    name: 'consumer_secret',
                    label: 'Consumer Secret',
                    type: 'text',
                    value: settings.consumer_secret || '',
                });
            }

            if( !config.token ) {
                summit.registerSetting({
                    name: 'token',
                    label: 'Token',
                    type: 'text',
                    value: settings.token || '',
                });
            }

            if( !config.token_secret ) {
                summit.registerSetting({
                    name: 'token_secret',
                    label: 'Token Secret',
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

            initClient();

            if( settings.topic ) {
                track(settings.topic);
            }

            return {
                id: id,
                branding: {
                    icon: {
                        fa: 'twitter',
                    },
                    color: {
                        background: 'twitter',
                        text: 'clouds',
                        icon: 'clouds',
                    }
                },
            };
        });
};

module.exports.id = id;

module.exports.client = __dirname + '/lib/client.js';

module.exports.style = __dirname + '/public/style.css';

module.exports.onSettings = function(s) {
    settings = s;
    initClient();
    track(settings.topic);
};

module.exports.init = function(c) {
    config = c;
    return module.exports;
};
