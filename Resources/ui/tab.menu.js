var AudioStreamer = require('controls/audiostreamer.adapter');

function LOG() {
	console.log('ABMENU ≠≠≠≠≠≠≠≠≠≠≠≠≠: ' + arguments[0]);
}

/* constants for menuItems */
const RECENT = 0,
    MYFAVS = 1,
    MYPODS = 2,
    MYPLAYLIST = 3,
    PLAY = 4;

/* Reference to Play icon to control it outside the callback */
var playIcon;

var lastOnlineState = Ti.Network.online;

/* if after station changing the live radio should switch */
var autoSwitch = false;

/* saves the status of live raddio */
var onAir = false;

/* logic for callbacks from audiostreamer module */
function onCallbackFn(_payload) {
	switch(_payload.status) {
	case 'PLAYING':
		playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_stop_' + currentStation]);
		if (_payload.message) {
			АктйонБар.setSubtitle('Radio ist onAir');
			Ti.App.fireEvent('app:setRadiotext', {
				message : _payload.message
			});
		}
		onAir = true;
		break;
	case 'TIMEOUT':
		LOG('event TIMEOUT');
		onAir = false;
		playIcon.setVisible(Ti.Network.online);
		Ti.UI.createNotification({
			message : L('OFFLINE_RADIO_TOAST')
		}).show();
		Ti.App.fireEvent('app:setRadiotext', {
			message : ''
		});
		break;
	case 'STOPPED':
		playIcon.setVisible(Ti.Network.online);
		playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
		АктйонБар.setSubtitle('Radio angehalten');
		Ti.App.fireEvent('app:setRadiotext', {
			message : ''
		});
		onAir = false;
		setTimeout(function() {
			АктйонБар.setSubtitle('Mediathek');
		}, 3000);
		break;
	case 'BUFFERING':
		playIcon.setVisible(true);
		playIcon.setIcon(Ti.App.Android.R.drawable.ic_action_loading);
		_payload.message && АктйонБар.setSubtitle('Lade Puffer …');
		break;
	}
}

function onPlayStopClickFn() {
	playIcon.setVisible(false);
	if (onAir == false) {
		AudioStreamer.play(stations[currentStation].icyurl[0], onCallbackFn);
		LOG('onAir was false now setting  to true');
		onAir = true;
	} else {
		AudioStreamer.stop(onCallbackFn);
		LOG('onAir was true now setting  to false');
		onAir = false;
	}
};

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

/* INTERFACE */
/* =================================================*/
module.exports = function(_event) {
	console.log('Info: starting tabmenu ≠≠≠≠≠≠≠≠≠≠');
	АктйонБар.setTitle(Model[currentStation].name);
	АктйонБар.setSubtitle('Mediathek');
	АктйонБар.setFont("Aller");
	АктйонБар.setBackgroundColor('#444444');
	АктйонБар.subtitleColor = "#ccc";
	АктйонБар.setStatusbarColor(Model[currentStation].color);
	searchView.where = _event.source.activeTab.ndx;
	require('vendor/versionsreminder')();
	var activity = _event.source.getActivity();
	if (activity) {
		activity.onCreateOptionsMenu = function(_menuevent) {
			LOG('onCreateOptionsMenu');
			_menuevent.menu.clear();
			_menuevent.menu.add({
				title : 'Start live Radio',
				itemId : PLAY,
				visible : false,
				icon : Ti.App.Android.R.drawable['ic_action_play_' + currentStation],
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
			}).addEventListener("click", onPlayStopClickFn);
			playIcon = _menuevent.menu.findItem(PLAY);
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
				//backgroundColor : '#777',
				textColor : "white",
				hintColor : "silver",
				line : "/images/my_textfield_activated_holo_light.9.png",
				cancelIcon : "/images/cancel.png",
				searchIcon : "/images/search.png"
			});
			setTimeout(function() {
				playIcon.setVisible(Ti.Network.online ? true : false);
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
					title : 'RadioZumMitnehmen',
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
			}, 700);
			playIcon = _menuevent.menu.findItem(PLAY);
			activity.actionBar.displayHomeAsUp = false;

			/*
			 *
			 * Users has swiped the flipboard and want to switch station
			 *
			 * */
			Ti.App.addEventListener('app:station', function(_e) {

				if (!_e.station) {
					console.log('Warning: no station');
					return;
				}

				currentStation = _e.station;
				АктйонБар.setStatusbarColor(Model[currentStation].color);
				Ti.App.Properties.setString('LAST_STATION', currentStation);
				АктйонБар.setTitle(Model[currentStation].name);
				Ti.App.fireEvent('app:setRadiotext', {
					message : ''
				});
				if (onAir == false) {
					LOG('radio was offline ==> changing color of playbotton');
					playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
				}
				if (autoSwitch == true) {
					LOG('autoSwitch ==> try to switch station');
					playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
					activity.actionBar.logo = '/images/' + currentStation + '.png';
					if (onAir == true)
						AudioStreamer.play(stations[currentStation].icyurl[0], onCallbackFn);
				}
			});
			Ti.App.addEventListener('app:stopAudioStreamer', function(_event) {
				if (AudioStreamer.isPlaying()) {
					AudioStreamer.stop();
					Ti.UI.createNotification({
						message : L('START_MEDIATHEK_TOAST')
					}).show();
				}
			});
		};
		//activity && activity.invalidateOptionsMenu();
		activity.onResume = function() {
			playIcon && playIcon.setVisible(Ti.Network.online);
			currentStation = Ti.App.Properties.getString('LAST_STATION', 'dlf');
			activity.actionBar.logo = '/images/' + currentStation + '.png';
			try {
				АктйонБар.setStatusbarColor(Model[currentStation].color);
			} catch(E) {
			}
		};
		activity.invalidateOptionsMenu();
	} else
		LOG('no activity');
		
};

var lastOnlineState = Ti.Network.online;
Ti.Network.addEventListener('change', function(event) {
	var onlineState = Ti.Network.online;
	playIcon && playIcon.setVisible(onlineState);
	if (lastOnlineState != onlineState) {
		lastOnlineState = onlineState;
		if (onlineState == false)
			playIcon && playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
	}
});

Ti.Android.currentActivity.onRestart = function() {
	playIcon && playIcon.setVisible(Ti.Network.online);
};

