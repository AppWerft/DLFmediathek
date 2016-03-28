//https://gist.github.com/manumaticx/6239830

var alarmManager = require('bencoding.alarmmanager').createAlarmManager(),
    PodcastMirror = new (require('controls/feed.adapter'))();
//   PlaylistMirror = require('controls/rss.adapter');

var mirrorPodcasts = function() {
    PodcastMirror.mirrorAllFeeds({
        done : function(_args) {
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
            // would stop service totally:
            //Ti.Android.stopService(Ti.Android.currentService.getIntent());
        }
    });
};

var mirrorPlaylists = function() {
    PlaylistMirror.getRSS({
        station : 'dlf'
    });
    PlaylistMirror.getRSS({
        station : 'drk'
    });
};

// our tasks:
mirrorPodcasts();
//mirrorPlaylists();
