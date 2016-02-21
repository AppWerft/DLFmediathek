Ti.App.AudioStreamer = require('com.woohoo.androidaudiostreamer');

const RECENT = 0,
    MYFAVS = 1,
    MYPODS = 2,
    MYPLAYLIST = 3,
    PLAY = 4;

var Moment = require('vendor/moment');

/* timeout for stream requesting */
const NETTIMEOUT = 30000;

var playIcon;
var bufferingTimer;
// timer for  timeout for stream requesting
var radioShouldPlay = false;
// should play to detect loosing of connection
var hadplayed;
var lastOnlineState = Ti.Network.online;

function onPlayStopClickFn() {
	console.log('Info: AAS onPlayStopClickFn ≠≠≠≠≠≠≠≠≠≠');
	playIcon.setVisible(false);
	/* Handling of PlayIcon*/
	//var menuitem = _menuevent.menu.findItem(PLAY);
	if (Ti.App.AudioStreamer.getStatus() == PLAYING) {
		radioShouldPlay = false;
		Ti.App.AudioStreamer.stop();
		console.log('Info: AAS was playing forced stop');
		return;
	}
	if (Ti.Network.online) {
		playIcon.setVisible(false);
		console.log('Info: AAS startAudioStreamer() START');
		startAudioStreamer();
	} else {
		АктйонБар.setSubtitle(L('OFFLINE_RADIO'));
		setTimeout(function() {
			АктйонБар.setSubtitle('Mediathek');
		}, 3000);
		Ti.UI.createNotification({
			message : L('OFFLINE_RADIO_TOAST')
		}).show();
	}
}

var startAudioStreamer = function(doRestart) {
	var icyurl = stations[currentStation].icyurl[0];
	var status = Ti.App.AudioStreamer.getStatus();
	if (status == BUFFERING || status == PLAYING) {
		console.log('Playerinfo: was active ' + status);
		console.log('Info: AAS was playing forced stop in startTi.App.AudioStreamer');
		Ti.App.AudioStreamer.stop();
	}

	АктйонБар.setSubtitle('Verbindung mit RadioServer');
	Ti.App.AudioStreamer.play(icyurl);
	if (radioShouldPlay) {// try to restart with ugly trick
		console.log('Info: AAS  forced restart because of radioShoudPlay');
		radioShouldPlay = false;
		Ti.UI.createNotification({
			message : L('LOST_CONNECTION_TOAST')
		}).show();
		setTimeout(function() {
			Ti.App.AudioStreamer.stop(icyurl);
			setTimeout(function() {
				Ti.App.AudioStreamer.play(icyurl);
				radioShouldPlay = true;
			}, 80);
		}, 80);
	}
	radioShouldPlay = true;
	/* test of succesful streaming: */
	bufferingTimer = setTimeout(function() {
		console.log('Info: AAS stopped bebause of ATREAMERTIMEOUT');
		Ti.App.AudioStreamer.stop();
		АктйонБар.setSubtitle('Mediathek');
		playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
		playIcon.setVisible(true);
	}, NETTIMEOUT);
};

/* constants for Ti.App.AudioStreamer */
var STOPPED = 0,
    BUFFERING = 1,
    PLAYING = 2,
    STREAMERROR = 3,
    STATUS = 0;
var STATE = ['STOPPED', 'BUFFERING', 'PLAYING', 'STREAMERROR'];

var Model = require('model/stations'),
    АктйонБар = require('com.alcoapps.actionbarextras'),
    stations = require('model/stations'),
    currentStation = Ti.App.Properties.getString('LAST_STATION', 'dlf');

if (currentStation == undefined || currentStation.length != 3)
	currentStation = 'dlf';

var searchView = Ti.UI.Android.createSearchView({
	hintText : "Suche"
});

var searchMenu;

searchView.addEventListener('submit', function(_e) {
	require('ui/search.window')({
		needle : _e.source.value,
		where : searchView.where
	}).open();
	searchMenu.collapseActionView();
});

module.exports = function(_event) {
	АктйонБар.setTitle(Model[currentStation].name);
	АктйонБар.setSubtitle('Mediathek');
	АктйонБар.setFont("Aller");
	АктйонБар.setBackgroundColor('#444444');
	АктйонБар.subtitleColor = "#ccc";
	АктйонБар.setStatusbarColor(Model[currentStation].color);
	searchView.where = _event.source.activeTab.ndx;
	var activity = _event.source.getActivity();
	if (activity) {
		activity.actionBar.logo = '/images/' + currentStation + '.png';
		activity.onPrepareOptionsMenu = function() {
			console.log('Info: AAS onPrepareOptionsMenu');
		};
		activity.onCreateOptionsMenu = function(_menuevent) {
			console.log('Info: AAS onCreateOptionsMenu');
			_menuevent.menu.clear();
			_menuevent.menu.add({
				title : 'Start live Radio',
				itemId : PLAY,
				visible : Ti.Network.online ? true : false,
				icon : Ti.App.Android.R.drawable['ic_action_play_' + currentStation],
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
			}).addEventListener("click", onPlayStopClickFn);
			searchMenu = _menuevent.menu.add({
				title : L('MENU_SEARCH'),
				visible : false,
				actionView : searchView,
				icon : (Ti.Android.R.drawable.ic_menu_search ? Ti.Android.R.drawable.ic_menu_search : "my_search.png"),
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER | Ti.Android.SHOW_AS_ACTION_COLLAPSE_ACTION_VIEW
			});
			setTimeout(function() {
				searchMenu.setVisible(true);
			}, 5000);
			// changing a searchview
			АктйонБар.setSearchView({
				searchView : searchView,
				backgroundColor : '#777',
				textColor : "white",
				hintColor : "silver",
				line : "/images/my_textfield_activated_holo_light.9.png",
				cancelIcon : "/images/cancel.png",
				searchIcon : "/images/search.png"
			});
			setTimeout(function() {
				_menuevent.menu.add({
					title : L('MENU_FAV'),
					itemId : MYFAVS,
					icon : Ti.App.Android.R.drawable.ic_action_fav,
					showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
				}).addEventListener("click", function(_e) {
					require('ui/merkliste.window')().open();
				});
				_menuevent.menu.add({
					title : 'Meine Podcasts',
					itemId : MYPODS,
					icon : Ti.App.Android.R.drawable.ic_action_fav,
					showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
				}).addEventListener("click", function(_e) {
					require('ui/mypodcasts.window')().open();
				});
				_menuevent.menu.add({
					title : 'Letztgehört …',
					itemId : RECENT,
					icon : Ti.App.Android.R.drawable.ic_action_fav,
					showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
				}).addEventListener("click", function(_e) {
					require('ui/recents.window')().open();
				});
				_menuevent.menu.add({
					title : 'PDF Sendepläne',
					showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
				}).addEventListener("click", function(_e) {
					require('ui/pdf.window')().open();
				});
			}, 7000);
			playIcon = _menuevent.menu.findItem(PLAY);
			activity.actionBar.displayHomeAsUp = false;

			/*
			 *
			 * Users has swiped the flipboard and want to switch station
			 *
			 * */
			Ti.App.addEventListener('app:station', function(_e) {
				if (!_e.station)
					return;
				currentStation = _e.station;
				Ti.App.Properties.setString('LAST_STATION', currentStation);
				console.log('Info: AAS onStationChanged   ≠≠≠≠≠≠≠≠≠≠≠');
				АктйонБар.setStatusbarColor(Model[currentStation].color);
				Ti.App.fireEvent('app:setRadiotext', {
					message : ''
				});
				playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
				activity.actionBar.logo = '/images/' + currentStation + '.png';
				АктйонБар.setTitle(Model[currentStation].name);
				// only if radio is active we switch to other station:
				if (Ti.App.AudioStreamer.getStatus() == PLAYING) {
					radioShouldPlay = false;
					Ti.App.AudioStreamer.stop();
					setTimeout(startAudioStreamer, 3000);
				}
			});
			Ti.App.addEventListener('app:stopAudioStreamer', function(_event) {
				console.log('Info: AAS stopAudioStreamer');
				if (radioShouldPlay)
					Ti.UI.createNotification({
						message : L('START_MEDIATHEK_TOAST')
					}).show();
				radioShouldPlay = false;
				Ti.App.AudioStreamer.stop();
			});

			playIcon = _menuevent.menu.findItem(PLAY);
		};
		//activity && activity.invalidateOptionsMenu();
		activity.onResume = function() {
			console.log('Info: AAS onResume');
			playIcon && playIcon.setVisible(Ti.Network.online);
			currentStation = Ti.App.Properties.getString('LAST_STATION', 'dlf');
			activity.actionBar.logo = '/images/' + currentStation + '.png';
			АктйонБар.setStatusbarColor(Model[currentStation].color);
		};
		activity.onPause = function() {
		};
	}
};

Ti.Network.addEventListener('change', function(event) {
	console.log('Info: AAS Network changed');
	var onlineState = Ti.Network.online;
	playIcon && playIcon.setVisible(onlineState);
	if (lastOnlineState != onlineState) {
		lastOnlineState = onlineState;
		console.log('Info: NetStatus=' + Ti.Network.online + ' && Ti.App.AudioStreamer.status=' + Ti.App.AudioStreamer.getStatus() + ' && shouldPlay=' + radioShouldPlay);
		if (Ti.Network.online && Ti.App.AudioStreamer.getStatus() == STOPPED && radioShouldPlay == true) {
			startAudioStreamer(stations[currentStation].stream, true);
		}
	}
});

Ti.Android.currentActivity.onRestart = function() {
	playIcon.setVisible(Ti.Network.online);
};

/* Handling of Playerevents */
/* in meta data event is radiotext */

function onMetaData(_e) {
	console.log('Info: AAS onMetaData');
	var message = _e.title;
	Ti.App.fireEvent('app:setRadiotext', {
		message : message
	});
	var parts = message.split(/\s/);
	if (parts.length > 2)
		Ti.UI.createNotification({
			message : message,
			duration : 5000
		}).show();
}

function onPlayerChange(_e) {
	STATUS = _e.status;
	if (STATUS != 2)
		console.log('Info: AAS onPlayerChange ' + STATE[STATUS]);

	clearTimeout(bufferingTimer);
	switch (_e.status) {
	case BUFFERING:
		playIcon.setVisible(true);
		АктйонБар.setSubtitle('Zwischenspeicherung …');
		playIcon.setIcon(Ti.App.Android.R.drawable.ic_action_loading);
		break;
	case PLAYING:
		playIcon.setVisible(true);
		hadplayed = true;
		АктйонБар.setSubtitle('Radio ist aktiv');
		playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_stop_' + currentStation]);
		break;
	case STOPPED:
		playIcon.setVisible(false);
		Ti.App.fireEvent('app:setRadiotext', {
			message : ''
		});
		АктйонБар.setSubtitle('Radio gestoppt.');
		setTimeout(function() {
			АктйонБар.setSubtitle('Mediathek');
		}, 3000);
		playIcon.setVisible(true);
		playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
		break;
	case STREAMERROR:
		Ti.App.AudioStreamer.stop();
		АктйонБар.setSubtitle('Fehler beim Radiostreaming');
		Ti.UI.createNotification({
			message : 'Fehler beim Zugriff auf den Ti.App.AudioStreamerserver.',
			duration : 7000
		}).show();
		Ti.App.fireEvent('app:setRadiotext', '');
		break;
	};

}

Ti.App.AudioStreamer.addEventListener('metadata', onMetaData);
Ti.App.AudioStreamer.addEventListener('change', onPlayerChange);
