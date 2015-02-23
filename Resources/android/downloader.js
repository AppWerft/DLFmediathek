//https://gist.github.com/manumaticx/6239830

var alarmManager = require('bencoding.alarmmanager').createAlarmManager();



var mirrorPodcasts = function() {
    var Podcast = new (require('controls/feed.adapter'))();
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
            Ti.Android.stopService(Ti.Android.currentService.getIntent());
        }
    });
    var RSS = new (require('controls/rss.adapter'))();
    RSS.getRSS({
        station : 'dlf'
    });
    RSS.getRSS({
        station : 'drk'
    });

};

mirrorPodcasts();
