//https://gist.github.com/manumaticx/6239830

var serviceIntent = Ti.Android.currentService.getIntent(); 
mirrorPodcasts();
Ti.Android.stopService(serviceIntent);


function mirrorPodcasts() {
    var Podcast = new (require('controls/feed.adapter'))();
    Podcast.mirrorAllFeeds();
}
