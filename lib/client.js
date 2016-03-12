define([], function() {
    var init = function(panel, socket) {
        socket.on('tweet', function(tweet) {
            var html = '<div class="media"><div class="img"><img src="' + tweet.user.profile_image_url + '" /></div><div class="bd">' + tweet.text + '</div></div>';
            panel.insertAdjacentHTML('afterbegin', html);
        });
    };

    return init;
});
