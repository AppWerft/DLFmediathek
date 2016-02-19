const RECENT = 0,
    MYFAVS = 1,
    MYPODS = 2,
    MYPLAYLIST = 3,
    PLAY = 4;
    
var AudioStreamer = require('com.woohoo.androidaudiostreamer');
AudioStreamer.setAllowBackground(true);

var Moment = require('vendor/moment');

/* timeout for stream requesting */
const NETTIMEOUT = 30000;

var playIcon;  
var bufferingTimer; // timer for  timeout for stream requesting
var radioShouldPlay = false; // should play to detect loosing of connection
var lastOnlineState = Ti.Network.online;

var startAudioStreamer = function(m3u, doRestart) {
	var status = AudioStreamer.getStatus();
	if (status == BUFFERING || status == PLAYING) {
		console.log('Playerinfo: was active ' + status);
		AudioStreamer.stop();
	}
	require('controls/resolveplaylist')({
		playlist : m3u,
		onload : function(_icyUrl) {
			АктйонБар.setSubtitle('Verbindung mit RadioServer');
			if (AudioStreamer.getStatus() == PLAYING) {
				AudioStreamer.stop();
			}
			AudioStreamer.play(_icyUrl);
			if (radioShouldPlay) { // try to restart with ugly trick
				radioShouldPlay = false;
				Ti.UI.createNotification({
					message : 'Verbindung verloren.\nVersuche Wiederanknüpfung.'
				}).show();
				setTimeout(function() {
					AudioStreamer.stop(_icyUrl);
				}, 10);
				setTimeout(function() {
					AudioStreamer.play(_icyUrl);
					radioShouldPlay = true;
				}, 20);
			}
			radioShouldPlay = true;
			/* test of succesful streaming: */
			bufferingTimer = setTimeout(function() {
				AudioStreamer.stop();
				АктйонБар.setSubtitle('Mediathek');
				playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
				playIcon.setVisible(true);
			}, NETTIMEOUT);
		}
	});
};

/* constants for audiostreamer */
var STOPPED = 0,
    BUFFERING = 1,
    PLAYING = 2,
    STREAMERROR = 3,
    STATUS = 0;

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
	var subtitles = _event.source.tabs.map(function(tab) {
		return tab.title;
	});
	var activity = _event.source.getActivity();

	if (activity) {
		activity.actionBar.logo = '/images/' + currentStation + '.png';
		activity.onPrepareOptionsMenu = function() {
		};
		activity.onCreateOptionsMenu = function(_menuevent) {
			_menuevent.menu.clear();
			_menuevent.menu.add({
				title : 'Start live Radio',
				itemId : PLAY,
				visible : Ti.Network.online ? true : false,
				icon : Ti.App.Android.R.drawable['ic_action_play_' + currentStation],
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
			}).addEventListener("click", function() {
				playIcon.setVisible(false);
				/* Handling of PlayIcon*/
				//var menuitem = _menuevent.menu.findItem(PLAY);
				if (AudioStreamer.getStatus() == PLAYING) {
					radioShouldPlay = false;
					AudioStreamer.stop();
					return;
				}
				if (Ti.Network.online) {
					playIcon.setVisible(false);
					startAudioStreamer(stations[currentStation].stream);
				} else {
					АктйонБар.setSubtitle('kein Netz, LiveRadio unmöglich');
					setTimeout(function() {
						АктйонБар.setSubtitle('Mediathek');
					}, 3000);
					Ti.UI.createNotification({
						message : 'Gerät ist nicht online.\nProbleme mit der Radiowiedergabe.'
					}).show();
				}
			});
			searchMenu = _menuevent.menu.add({
				title : 'S U C H E ',
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
					title : 'Meine Vormerkliste',
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
			 * Users has swiped the flipboard
			 *
			 * */
			Ti.App.addEventListener('app:station', function(_e) {
				АктйонБар.setStatusbarColor(Model[_e.station].color);
				if (_e.station) {
					Ti.App.fireEvent('app:setRadiotext', {
						message : ''
					});
					currentStation = _e.station;
					playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
					activity.actionBar.logo = '/images/' + currentStation + '.png';
					АктйонБар.setTitle(Model[currentStation].name);
					Ti.App.Properties.setString('LAST_STATION', currentStation);
					// only if radio is active we switch to other station:
					if (AudioStreamer.getStatus() == PLAYING) {
						console.log('AAS: stopped by station switch');
						radioShouldPlay = false;
						AudioStreamer.stop();
						startAudioStreamer(stations[currentStation].stream);
					}
				}
			});
			Ti.App.addEventListener('app:stopAudioStreamer', function(_event) {
				if (radioShouldPlay)
					Ti.UI.createNotification({
						message : 'Mediathek will starten.\nUnterbrechung LiveRadio.'
					}).show();
				radioShouldPlay = false;
				AudioStreamer.stop();
			});

			playIcon = _menuevent.menu.findItem(PLAY);
		};
		activity && activity.invalidateOptionsMenu();
		require('vendor/versionsreminder')();
		activity.onResume = function() {
			console.log('currentActivity.onResume ≠≠≠≠≠≠≠≠≠≠≠');
			playIcon && playIcon.setVisible(Ti.Network.online);
			currentStation = Ti.App.Properties.getString('LAST_STATION', 'dlf');
			activity.actionBar.logo = '/images/' + currentStation + '.png';
			АктйонБар.setStatusbarColor(Model[currentStation].color);
		};
		activity.onPause = function() {
			console.log('currentActivity.onPause ≠≠≠≠≠≠≠≠≠≠≠');
		};
	}
};

Ti.Network.addEventListener('change', function(event) {
	var onlineState = Ti.Network.online;
	playIcon && playIcon.setVisible(onlineState);
	if (lastOnlineState != onlineState) {
		lastOnlineState = onlineState;
		console.log('Info: NetStatus=' + Ti.Network.online + ' && Audiostreamer.status=' + AudioStreamer.getStatus() + ' && shouldPlay=' + radioShouldPlay);
		if (Ti.Network.online && AudioStreamer.getStatus() == STOPPED && radioShouldPlay == true) {
			console.log('Info: we try to restart');
			startAudioStreamer(stations[currentStation].stream, true);
		}
	}
});

Ti.Android.currentActivity.onRestart = function() {
	console.log('currentActivity.onRestart');
	playIcon.setVisible(Ti.Network.online);
};

/* Handling of Playerevents */
/* in meta data event is radiotext */

function onMetaData(_e) {
	return;
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
	clearTimeout(bufferingTimer);
	switch (_e.status) {
	case BUFFERING:
		playIcon.setVisible(true);
		АктйонБар.setSubtitle('Zwischenspeicherung …');
		playIcon.setIcon(Ti.App.Android.R.drawable.ic_action_loading);
		break;
	case PLAYING:
		playIcon.setVisible(true);
		АктйонБар.setSubtitle('Radio ist aktiv');
		playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_stop_' + currentStation]);
		break;
	case STOPPED:
		console.log('295');
		Ti.App.fireEvent('app:setRadiotext', {
			message : ''
		});
		console.log('299');
		АктйонБар.setSubtitle('Radio gestoppt.');
		console.log('301');
		setTimeout(function() {
			АктйонБар.setSubtitle('Mediathek');
		}, 3000);
		playIcon.setVisible(true);
		console.log('306');
		playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
		break;
	case STREAMERROR:
		AudioStreamer.stop();
		АктйонБар.setSubtitle('Fehler beim Radiostreaming');
		Ti.UI.createNotification({
			message : 'Fehler beim Zugriff auf den AudioStreamerserver.',
			duration : 7000
		}).show();
		Ti.App.fireEvent('app:setRadiotext', '');
		break;
	};

}

AudioStreamer.addEventListener('metadata', onMetaData);
AudioStreamer.addEventListener('change', onPlayerChange); 