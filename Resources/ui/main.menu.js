const RECENT = 0,
    MYFAVS = 1,
    MYPODS = 2,
    MYPLAYLIST = 3,
    PLAY = 4;

var Player = Ti.Media.createAudioPlayer({
	allowBackground : true,
	volume : 1
}),
    Model = require('model/stations'),
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

var onCreateMenuFunc = function(_menuevent) {
	_menuevent.menu.clear();
	_menuevent.menu.add({
		title : 'Start live Radio',
		itemId : PLAY,
		icon : Ti.App.Android.R.drawable['ic_action_play_' + currentStation],
		showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
	}).addEventListener("click", function() {

		/* Handling of PlayIcon*/
		var url = stations[currentStation].stream;
		if (Player.isPlaying()) {
			Player.stop();
			Player.release();
			lifeRadio = false;
			return;
		}
		require('controls/resolveplaylist')({
			playlist : url,
			onload : function(_url) {
				Ti.UI.createNotification({
					message : 'Wir hören jetzt das laufende „' + stations[currentStation].name + '“.'
				}).show();
				Player.release();
				Player.setUrl(_url + '?_=' + Math.random());
				Player.start();
			}
		});
	});
	searchMenu = _menuevent.menu.add({
		title : 'S U C H E ',
		visible : false,
		actionView : searchView,
		icon : (Ti.Android.R.drawable.ic_menu_search ? Ti.Android.R.drawable.ic_menu_search : "my_search.png"),
		showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM | Ti.Android.SHOW_AS_ACTION_COLLAPSE_ACTION_VIEW
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
			title : 'Tagesübersicht',
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		}).addEventListener("click", function(_e) {
			require('ui/dayplan.window')().open();
		});
	}, 7000);

	/* Handling of Playerevents */
	var menuitem = _menuevent.menu.findItem(PLAY);
	Player.addEventListener('change', function(_e) {
		АктйонБар.setSubtitle('');
		switch (_e.state) {
		case 1:
			menuitem.setIcon(Ti.App.Android.R.drawable.ic_action_loading);
			break;
		case 3:
			АктйонБар.setSubtitle('LinearRadio');
			menuitem.setIcon(Ti.App.Android.R.drawable['ic_action_stop_' + currentStation]);
			lifeRadio = true;
			break;
		case 4:
		case 5:
			АктйонБар.setSubtitle('Mediathek');
			menuitem.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
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
		currentStation = _e.station;
		menuitem.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
		activity.actionBar.logo = '/images/' + currentStation + '.png';
		АктйонБар.setTitle(Model[currentStation].name);

		Ti.App.Properties.setString('LAST_STATION', currentStation);
		if (Player.isPlaying()) {
			Player.stop();
			setTimeout(function() {
				require('controls/resolveplaylist')({
					playlist : stations[currentStation].stream,
					onload : function(_url) {
						Ti.UI.createNotification({
							message : 'Wir hören jetzt das laufende „' + stations[currentStation].name + '“.'
						}).show();
						Player.release();
						Player.setUrl(_url + '?_=' + Math.random());
						Player.start();
					}
				});
			}, 1500);
		} else {
			console.log('Info: silent swiping');
		}
	});
	Ti.App.addEventListener('app:stop', function(_event) {
		if (Player.isPlaying()) {
			Player.stop();
			Player.release();
		}
	});
	Ti.App.addEventListener('app:play', function(_event) {
		if (Player.isPlaying()) {
			Player.stop();
			Player.release();
		}
	});
};

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
		activity.onCreateOptionsMenu = onCreateMenuFunc;

		activity && activity.invalidateOptionsMenu();
		require('vendor/versionsreminder')();
	}
};
