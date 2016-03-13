define([], function() {
    var render = function(tweet, panel) {
        var html = '<div class="media"><div class="img"><img src="' + tweet.user.profile_image_url + '" /></div><div class="bd">' + tweet.text + '</div></div>';
        panel.insertAdjacentHTML('afterbegin', html);
    };

    var init = function(panel, socket) {
        socket.once('tweets', function(tweets) {
            for (var i = 0; i < tweets.length; i++) {
                render(tweets[i], panel);
            }
        });

        socket.on('tweet', function(tweet) {
            render(tweet, panel);
        });
    };

    return init;
});
