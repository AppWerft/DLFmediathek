//https://gist.github.com/manumaticx/6239830

var alarmManager = require('bencoding.alarmmanager').createAlarmManager(),
    PodcastMirror = new (require('controls/feed.adapter'))(),
    PlaylistMirror = new (require('controls/rss.adapter'))();

var mirrorPodcasts = function() {
    PodcastMirror.mirrorAllFeeds({
        done : function() {
            alarmManager.addAlarmNotification({
                requestCode : 2,
                second : 1,
                contentTitle : 'DLR Mediathek',
                contentText : _args.total + ' Podcasts synchronisiert',
                playSound : true,
                icon : Ti.App.Android.R.drawable.appicon,
                sound : Ti.Filesystem.getResRawDirectory() + 'kkj', 
            });
            return;
            // would stop service otally:
            Ti.Android.stopService(Ti.Android.currentService.getIntent());
        }
    });
};

var mirrorPlaylists = function() {
    RSSMirror.getRSS({
        station : 'dlf'
    });
    RSSMirror.getRSS({
        station : 'drk'
    });
};

// our tasks:
mirrorPodcasts();
mirrorPlaylists();
