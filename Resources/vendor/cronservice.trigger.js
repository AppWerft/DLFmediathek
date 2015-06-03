

module.exports = function() {
    var Moment = require('vendor/moment');
    var today = Moment().format('YYMMDD');
    if (Ti.App.Properties.getString('LASTSYNC', '') != today) {
        var alarmManager = require('bencoding.alarmmanager').createAlarmManager();
        Ti.App.Properties.setString('LASTSYNC', today);
        var nextsynctime = Moment().add(100, 'sec');
        alarmManager.addAlarmNotification({
            requestCode : 2, // must be INT to identify the alarm
            second : 10,
            contentTitle : 'DLR Mediathek',
            contentText : ' Podcastssynchronisierung gestartet',
            playSound : true,
            icon : Ti.App.Android.R.drawable.appicon,
            sound : Ti.Filesystem.getResRawDirectory() + 'kkj', //Set a custom sound to play
        });
        alarmManager.addAlarmService({
            service : 'de.appwerft.dlrmediathek.PodcastsyncService',
            second : nextsynctime.diff(Moment(), 'seconds'),
            repeat : 'daily',
            interval : 3600 * 24 * 1000
        });
    }
};
