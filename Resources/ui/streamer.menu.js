const RECENT = 0,
    MYFAVS = 1,
    MYPODS = 2,
    MYPLAYLIST = 3,
    PLAY = 4;
var AudioStreamer = require('com.woohoo.androidaudiostreamer');
AudioStreamer.setAllowBackground(true);
var Moment = require('vendor/moment');

var playIcon;

var startAudioStreamer = function(m3u) {
	var status = AudioStreamer.getStatus();
	if (status == BUFFERING || status == PLAYING) {
		console.log('Playerinfo: was active ' + status);
		AudioStreamer.stop();
	}

	setTimeout(function() {
		require('controls/resolveplaylist')({
			playlist : m3u,
			onload : function(_icyUrl) {
				АктйонБар.setSubtitle('Verbindung mit RadioServer');
				AudioStreamer.play(_icyUrl + '?' + Math.random());
			}
		});
	}, 50);

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
    currentStation = Ti.App.Properties.getString('LAST_STATION', 'dlf'),
    lifeRadio = null;

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
	searchView.where = _event.source.activeTab.ndx;
	var subtitles = _event.source.tabs.map(function(tab) {
		return tab.title;
	});
	АктйонБар.setTitle(Model[currentStation].name);
	АктйонБар.setSubtitle('Mediathek');
	АктйонБар.setFont("Aller");
	АктйонБар.setBackgroundColor('#444444');
	АктйонБар.subtitleColor = "#ccc";
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
				icon : Ti.App.Android.R.drawable['ic_action_play_' + currentStation],
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
			}).addEventListener("click", function() {
				/* Handling of PlayIcon*/
				//var menuitem = _menuevent.menu.findItem(PLAY);
				if (AudioStreamer.getStatus() == PLAYING) {
					AudioStreamer.stop();
					return;
				}
				if (Ti.Network.online) {
					playIcon.setVisible(false);
					startAudioStreamer(stations[currentStation].stream);
				} else {
					АктйонБар.setSubtitle('kein Netz, LiveR	adio unmöglich');
					Ti.UI.createNotification({message:'Gerät ist nicht online.\nProbleme mit der Radiowiedergabe.'}).show;
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
			
			/* Handling of Playerevents */
			playIcon = _menuevent.menu.findItem(PLAY);
			/* in meta data event is radiotext */
			AudioStreamer.addEventListener('metadata', function(_e) {
				var message = _e.title;
				Ti.App.fireEvent('radiotext', {
					message : message
				});
				//console.log('PlayerStatus ' + _e.status);
				var parts = message.split(/\s/);
				if (parts.length > 2)
					Ti.UI.createNotification({
						message : message,
						duration : 5000
					}).show();
				//АктйонБар.setSubtitle(_e.title);
			});
			/* player changed the status */
			AudioStreamer.addEventListener('change', function(_e) {
				STATUS = _e.status;
				console.log('AAS: ' + _e.status);
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
					Ti.App.fireEvent('radiotext', {
						message : null
					});
					АктйонБар.setSubtitle('Radio gestoppt.');
					setTimeout(function(){
						АктйонБар.setSubtitle('Mediathek');
					},3000);
					playIcon.setVisible(true);
					playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
					break;
				case STREAMERROR:
					AudioStreamer.stop();
					АктйонБар.setSubtitle('Fehler beim Radiostreaming');
					Ti.UI.createNotification({
						message : 'Fehler beim Zugriff auf den AudioStreamerserver.',
						duration : 7000
					}).show();
					Ti.App.fireEvent('radiotext', null);
					break;
				};
			});
			activity.actionBar.displayHomeAsUp = false;

			/*
			 *
			 * Users has swiped the flipboard
			 *
			 * */
			Ti.App.addEventListener('app:station', function(_e) {
				АктйонБар.setStatusbarColor(Model[_e.station].color);
				if (_e.station) {
					Ti.App.fireEvent('radiotext', {
						message : null
					});
					currentStation = _e.station;
					playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
					activity.actionBar.logo = '/images/' + currentStation + '.png';
					АктйонБар.setTitle(Model[currentStation].name);
					Ti.App.Properties.setString('LAST_STATION', currentStation);
					// only if radio is active we switch to other station:
					if (AudioStreamer.getStatus() == PLAYING) {
						AudioStreamer.stop();
						startAudioStreamer(stations[currentStation].stream);
					}
				}
			});
			Ti.App.addEventListener('app:stop', function(_event) {
				AudioStreamer.stop();

			});
			Ti.App.addEventListener('app:play', function(_event) {
				AudioStreamer.stop();
			});
			playIcon = _menuevent.menu.findItem(PLAY);
		};
		activity && activity.invalidateOptionsMenu();
		require('vendor/versionsreminder')();
		activity.onResume = function() {
			currentStation = Ti.App.Properties.getString('LAST_STATION', 'dlf');
			activity.actionBar.logo = '/images/' + currentStation + '.png';
			АктйонБар.setStatusbarColor(Model[currentStation].color);
		};
	}
};
