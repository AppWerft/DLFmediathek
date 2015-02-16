//https://gist.github.com/manumaticx/6239830

var mirrorPodcasts = function() {
    var Podcast = new (require('controls/feed.adapter'))();
    Podcast.mirrorAllFeeds({
        done : function(_args) {
            var alarmManager = require('bencoding.alarmmanager').createAlarmManager();
            var alarm = {
                requestCode : 1, // must be INT to identify the alarm
                second : 10,
                contentTitle : 'DLR Mediathek',
                contentText : _args.total +' Podcasts synchronisiert',
                playSound : true,
                icon : Ti.App.Android.R.drawable.appicon,
                sound : Ti.Filesystem.getResRawDirectory() + 'kkj', //Set a custom sound to play
            };
            alarmManager.addAlarmNotification(alarm);

            Ti.Android.stopService(serviceIntent);
        }
    });
};

var serviceIntent = Ti.Android.currentService.getIntent();
mirrorPodcasts();

