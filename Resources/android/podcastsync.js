//https://gist.github.com/manumaticx/6239830

var alarmManager = require('bencoding.alarmmanager').createAlarmManager(),
    Moment = require('vendor/moment'),
    PodcastMirror = new (require('controls/feed.adapter'))();

var mirrorPodcasts = function() {
	function getUnix() {
		return parseInt(Moment().format('X'));
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
			console.log('FINISH sync SERVICE ≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠');
			Ti.App.Properties.setInt('LASTPODCAST', getUnix());
			return;
		}
	});
};

mirrorPodcasts();
console.log('start sync SERVICE mirr≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠');

/*var mirrorPlaylists = function() {
	PlaylistMirror.getRSS({
		station : 'dlf'
	});
	PlaylistMirror.getRSS({
		station : 'drk'
	});
};
mirrorPlaylists();
*/

