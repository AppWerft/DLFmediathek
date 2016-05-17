const DELAY= 0;

module.exports = function() {
	var Moment = require('vendor/moment');

	if (!Ti.Network.online || Ti.App.Properties.hasProperty('LASTSYNC') && Ti.App.Properties.getInt('LASTSYNC') - parseInt(Moment().format('X')) < 3600 * 24) {
		console.log('Warning: sync aborted, last sync is to fresh ≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠');
		return;
	}
	Ti.App.Properties.setString('LASTSYNC',parseInt(Moment().format('X')));
	var today = Moment().format('YYMMDD');
	var alarmManager = require('bencoding.alarmmanager').createAlarmManager();
	alarmManager.addAlarmNotification({
		requestCode : 2, // must be INT to identify the alarm
		second : DELAY,
		contentTitle : 'DLR Mediathek',
		contentText : ' Podcastssynchronisierung gestartet',
		playSound : true,
		icon : Ti.App.Android.R.drawable.appicon,
		sound : Ti.Filesystem.getResRawDirectory() + 'kkj', //Set a custom sound to play
	});
	alarmManager.addAlarmService({
		service : 'de.appwerft.dlrmediathek.PodcastsyncService',
		second : DELAY,
		repeat : 'daily',
		interval : 3600 * 24 * 1000
	});
	
};
