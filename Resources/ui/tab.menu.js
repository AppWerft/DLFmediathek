var AudioStreamer = require('controls/audiostreamer.adapter');
var snooze;

function LOG() {
	console.log('ABMENU ………………………: ' + arguments[0]);
}

/* constants for menuItems */
const RECENTS = 1,
    MYFAVS = 2,
    MYPODS = 3,
    HIFI = 4,
    MYPLAYLIST = 5,
    PLAY = 6;

/* Reference to Play icon to control it outside the callback */
var playIcon;
var hifiIcon;

var lastOnlineState = Ti.Network.online;

/* if after station changing the live radio should switch */
var autoSwitch = false;

/* saves the status of live radio */
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
	case 'STREAMERROR':
		playIcon.setVisible(Ti.Network.online);
		playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
		АктйонБар.setSubtitle('Radio hat Störung');
		Ti.App.fireEvent('app:setRadiotext', {
			message : ''
		});
		onAir = false;
		break;
	case 'TIMEOUT':
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
		require("ui/snooze.dialog")(function(_duration) {
			console.log(">>>>>>>>>>>>>  callback from snoozydialog " + _duration);
			if (_duration >= 0) {
				Ti.Media.vibrate([30, 20]);
				if (_duration > 0)
					snoozy = setTimeout(onPlayStopClickFn, _duration);
				AudioStreamer.play(stations[currentStation].icyurl[0], onCallbackFn);
				onAir = true;
			} else
				playIcon.setVisible(true);
		});

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
	}).open({
		activityEnterAnimation : Ti.Android.R.anim.slide_in_left,
		activityExitAnimation : Ti.Android.R.anim.slide_out_right
	});
	searchMenu.collapseActionView();
});

/* INTERFACE */
/* =================================================*/
module.exports = function(_event) {
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
			_menuevent.menu.clear();
			try {
				playIcon = _menuevent.menu.add({
					title : 'Start live Radio',
					itemId : PLAY,
					visible : false,
					icon : Ti.App.Android.R.drawable['ic_action_play_' + currentStation],
					showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
				});
				playIcon.addEventListener && playIcon.addEventListener("click", onPlayStopClickFn);
			} catch (E) {
				AudioStreamer && AudioStreamer.stop(onCallbackFn);
			}
			searchMenu = _menuevent.menu.add({
				title : L('MENU_SEARCH'),
				groupId : 0,
				visible : true,
				actionView : searchView,
				icon : "/images/lupe.png",
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM | Ti.Android.SHOW_AS_ACTION_COLLAPSE_ACTION_VIEW
			});
			_menuevent.menu.add({
				title : "Hifi Transfer",
				visible : (Ti.Network.getNetworkType() == Ti.Network.NETWORK_WIFI || require("de.appwerft.a2dp").Bluetooth.isEnabled()) ? true : false,
				itemId : HIFI,
				icon : "/images/hifi.png", //Ti.Android.R.drawable.ic_action_hifi,
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS
			}).addEventListener("click", function() {
				require("ui/hifi/main.dialog")(_event.source);
			});

			hifiIcon = _menuevent.menu.findItem(HIFI);
			АктйонБар.setSearchView({
				searchView : searchView,
				//backgroundColor : '#777',
				textColor : "white",
				hintColor : "silver",
				line : "/images/my_textfield_activated_holo_light.9.png",
				cancelIcon : "/images/cancel.png",
				searchIcon : "/images/search.png"
			});
			//setTimeout(function() {
			playIcon.setVisible(Ti.Network.online ? true : false);
			_menuevent.menu.add({
				title : L('MENU_FAV'),
				itemId : MYFAVS,
				groupId : 1,
				visible : false,
				icon : Ti.App.Android.R.drawable.ic_action_fav,
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
			}).addEventListener("click", function(_e) {
				require('ui/merkliste.window')().open();
			});
			_menuevent.menu.add({
				title : 'Meine Podcasts',
				itemId : MYPODS,
				groupId : 1,
				visible : false,
				icon : Ti.App.Android.R.drawable.ic_action_fav,
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
			}).addEventListener("click", function(_e) {
				require('ui/podcast/my.window')().open();
			});
			_menuevent.menu.add({
				title : 'RadioZumMitnehmen',
				itemId : RECENTS,
				groupId : 1,
				visible : false,
				icon : Ti.App.Android.R.drawable.ic_action_fav,
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
			}).addEventListener("click", function(_e) {
				require('ui/recents.window')().open();
			});
			_menuevent.menu.add({
				title : 'PDF Sendepläne',
				groupId : 2,
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
			}).addEventListener("click", function(_e) {
				require('ui/pdf.window')().open();
			});

			//	}, 700);
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
		activity.onPrepareOptionsMenu = function(e) {
			var menu = e.menu;
			if (!menu)
				return;
			// favs:
			if (menu.findItem(MYFAVS)) {
				var favs = (new (require('controls/favorites.adapter'))()).getAllFavs();
				if (favs)
					if (favs.length) {
						menu.findItem(MYFAVS).setVisible(true);
						menu.findItem(MYFAVS).setTitle("Vorgemerktes (" + favs.length + ")");
					} else
						menu.findItem(MYFAVS).setVisible(false);
			}
			// mypodcasts:
			if (menu.findItem(MYPODS)) {
				var feeds = (new (require('controls/feed.adapter'))()).getAllFavedFeeds();
				if (feeds.length) {
					menu.findItem(MYPODS).setVisible(true);
					menu.findItem(MYPODS).setTitle("Lieblingspodcasts (" + feeds.length + ")");
				} else
					menu.findItem(MYPODS).setVisible(false);
			}
			// recents:
			if (menu.findItem(RECENTS)) {
				var count = (new (require('controls/recents.adapter'))()).getAllRecentsCount();
				if (count > 0) {
					menu.findItem(RECENTS).setTitle("Letztgehörtes (" + count + ")");
					menu.findItem(RECENTS).setVisible(true);
				} else
					menu.findItem(RECENTS).setVisible(false);
			}
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
		_event.source.addEventListener("androidback", function() {
			var message = 'Der Back-Button wurde gedrückt.';
			if (onAir)
				message += " Derweil läuft noch das Liveradio. ";
			message += " Tatsächlich beenden?";
			if (onAir)
				message += "\n\nFalls das Radio nicht enden soll, jetzt abbrechen und einen der anderen Knöpfe am Handy betätigen";

			var dialog = Ti.UI.createAlertDialog({
				cancel : 1,
				buttonNames : ['Jawoll', 'Abbruch'],
				message : message,
				title : 'Eventuelles Ende'
			});
			dialog.addEventListener('click', function(e) {
				if (e.index === e.source.cancel) {
				} else {
					AudioStreamer.stop();
					setTimeout(function() {
						_event.source.close(onCallbackFn);
					}, onAir ? 200 : 20);

				}
			});
			dialog.show();
			return false;
		});

	} else
		LOG('no activity');

};

var lastOnlineState = Ti.Network.online;
Ti.Network.addEventListener('change', function(event) {
	var onlineState = Ti.Network.online;
	if (Ti.Network.getNetworkType() == Ti.Network.NETWORK_WIFI) {
		hifiIcon && hifiIcon.setVisible(true);
	} else {
		hifiIcon && hifiIcon.setVisible(false);
	};

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
/*
 actionBar.setHomeButtonEnabled(true);
 abx.setDisplayShowHomeEnabled(true);
 abx.setDisplayUseLogoEnabled(true);
 actionBar.setIcon('/images/acv-white-noText.png');
 abx.setDisplayShowTitleEnabled(false);
 *
 * */
