module.exports = function() {
    var alarmManager = require('bencoding.alarmmanager').createAlarmManager();
    if (!Ti.App.Properties.hasProperty('SERVICESUBSCRIBER4') || true) {
        Ti.App.Properties.setString('SERVICESUBSCRIBER4', '1');
        var nextsynctime = Moment().add(1, 'day').startOf('day').add(Math.round(Math.random() * 3600));
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
