//https://gist.github.com/manumaticx/6239830

var alarmManager = require('bencoding.alarmmanager').createAlarmManager();

var mirrorPodcasts = function() {
    var Podcast = new (require('controls/feed.adapter'))();
    alarmManager.addAlarmNotification({
        requestCode : 1, 
        second : 1,
        contentTitle : 'DLR Mediathek',
        contentText : 'Podcasts-Synchronisierung',
        playSound : true,
        icon : Ti.App.Android.R.drawable.appicon,
        sound : Ti.Filesystem.getResRawDirectory() + 'kkj', 
    });
    Podcast.mirrorAllFeeds({
        done : function(_args) {
            alarmManager.addAlarmNotification({
                requestCode : 2,
                second : 1,
                contentTitle : 'DLR Mediathek',
                contentText : _args.total + ' Podcasts synchronisiert',
                playSound : true,
                icon : Ti.App.Android.R.drawable.appicon,
                sound : Ti.Filesystem.getResRawDirectory() + 'kkj', //Set a custom sound to play
            });
            Ti.Android.stopService(serviceIntent);
        }
    });
};

var serviceIntent = Ti.Android.currentService.getIntent();
mirrorPodcasts();