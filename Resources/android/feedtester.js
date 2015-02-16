//https://gist.github.com/manumaticx/6239830

var mirrorPodcasts = function() {
    var Podcast = new (require('controls/feed.adapter'))();
    Podcast.mirrorAllFeeds({
        done : function() {
            Ti.Android.stopService(serviceIntent);
        }
    });
};

var serviceIntent = Ti.Android.currentService.getIntent();
mirrorPodcasts();

