//https://gist.github.com/manumaticx/6239830

var alarmManager = require('bencoding.alarmmanager').createAlarmManager(),
    Moment = require('vendor/moment'),
    PodcastMirror = new (require('controls/feed.adapter'))();

var mirrorPodcasts = function() {
	function getUnix() {
		return parseInt(Moment().format('X'));
	}

	if (Ti.App.Properties.hasProperty('LASTPODCAST') && Ti.App.Properties.getInt('LASTPODCAST') - getUnix() < 3600 * 24) {
		console.log('Warning: sync aborted, last sync is to fresh');
		return;
	}
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
			Ti.App.Properties.setInt('LASTPODCAST', getUnix());
			return;
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
