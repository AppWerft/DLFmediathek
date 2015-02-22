//https://gist.github.com/manumaticx/6239830

var alarmManager = require('bencoding.alarmmanager').createAlarmManager();


var setNotification = function(alarm) {
    var activity = Ti.Android.currentActivity;
    var intent = Ti.Android.createIntent({
        action : Ti.Android.ACTION_MAIN,
        className : 'de.appwerft.dlrmediathek.DlrMediathekActivity',
        flags : Ti.Android.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED | Ti.Android.FLAG_ACTIVITY_SINGLE_TOP
    });
    intent.addCategory(Titanium.Android.CATEGORY_LAUNCHER);

    var message = "Time is up!";

    Ti.Android.NotificationManager.notify(1, Ti.Android.createNotification({
        contentIntent : Ti.Android.createPendingIntent({
            activity : activity,
            intent : intent,
            type : Ti.Android.PENDING_INTENT_FOR_ACTIVITY,
            flags : Ti.Android.FLAG_ACTIVITY_NO_HISTORY
        }),
        contentTitle : 'Notification Test',
        contentText : message,
        tickerText : message,
        when : new Date().getTime(),
        icon : Ti.App.Android.R.drawable.appicon,
        flags : Titanium.Android.FLAG_AUTO_CANCEL | Titanium.Android.FLAG_SHOW_LIGHTS | Titanium.Android.FLAG_INSISTENT,
        sound : Ti.Filesystem.getResRawDirectory() + 'dlrj'
    }));
    Ti.Media.vibrate([0, 100, 100, 200, 100, 100, 200, 100, 100, 200]);
};

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
