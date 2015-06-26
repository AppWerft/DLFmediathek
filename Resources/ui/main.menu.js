var Player = Ti.Media.createAudioPlayer({
	allowBackground : true,
	volume : 1
}),
    Model = require('model/stations'),
    АктйонБар = require('com.alcoapps.actionbarextras'),
    stations = require('model/stations'),
    currentRadio = Ti.App.Properties.getString('LAST_STATION', 'dlf'),
// listening
    currentStation = Ti.App.Properties.getString('LAST_STATION', 'dlf');
// viewing

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
	var laststation = Ti.App.Properties.getString('LAST_STATION', 'dlf');
	console.log(laststation);
	var subtitles = _event.source.tabs.map(function(tab) {
		return tab.title;
	});
	var currentStationName = laststation;
	Model[laststation] && АктйонБар.setTitle(Model[laststation].name);
	АктйонБар.setSubtitle('Mediathek');
	АктйонБар.setFont("Aller");
	АктйонБар.setBackgroundColor('#444444');
	АктйонБар.subtitleColor = "#ccc";
	_event.source.addEventListener('focus', function(_e) {
		АктйонБар.setSubtitle(subtitles[_e.index]);
		//console.log('tabndx='+_e.index);
		/*
		 if (_e.index==3 || _e.index == undefined) {
		 АктйонБар.setHomeAsUpIcon("/images/menu.png");
		 activity.actionBar.setDisplayHomeAsUp(true);
		 activity.actionBar.onHomeIconItemSelected = function() {
		 Ti.App.fireEvent('app:togglemapmenu');
		 }
		 } else {
		 activity.actionBar.setDisplayHomeAsUp(false);
		 activity.actionBar.onHomeIconItemSelected = function() {}
		 }*/
	});
	var activity = _event.source.getActivity();
	if (activity) {
		activity.actionBar.logo = '/images/' + laststation + '.png';
		activity.onCreateOptionsMenu = function(_menuevent) {
			_menuevent.menu.clear();

			searchMenu = _menuevent.menu.add({
				title : 'Search',
				visible : false,
				actionView : searchView,
				icon : (Ti.Android.R.drawable.ic_menu_search ? Ti.Android.R.drawable.ic_menu_search : "my_search.png"),
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM | Ti.Android.SHOW_AS_ACTION_COLLAPSE_ACTION_VIEW
			});
			setTimeout(function() {
				searchMenu.setVisible(true);
			}, 10000);
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
			_menuevent.menu.add({
				title : 'RadioStart',
				itemId : '1',
				icon : Ti.App.Android.R.drawable.ic_action_play,
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
			}).addEventListener("click", function() {
				var url = stations[currentStation].stream;
				if (Player.isPlaying()) {
					Player.stop();
					Player.release();
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
			setTimeout(function() {
				_menuevent.menu.add({
					title : 'Meine Vormerkliste',
					itemId : '5',
					icon : Ti.App.Android.R.drawable.ic_action_fav,
					showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
				}).addEventListener("click", function(_e) {
					require('ui/merkliste.window')().open();
				});
				_menuevent.menu.add({
					title : 'Meine Podcasts',
					itemId : '6',
					icon : Ti.App.Android.R.drawable.ic_action_fav,
					showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
				}).addEventListener("click", function(_e) {
					require('ui/mypodcasts.window')().open();
				});

				_menuevent.menu.add({
					title : 'Letztgehört …',
					itemId : '16',
					icon : Ti.App.Android.R.drawable.ic_action_fav,
					showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
				}).addEventListener("click", function(_e) {
					require('ui/recents.window')().open();
				});
			}, 7000);

			/*
			_menuevent.menu.add({
			title : 'Hörerkarte',
			itemId : '7',
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
			}).addEventListener("click", function(_e) {
			require('ui/map.window')().open();
			});*/
			// end of click handling
			/* Handling of PlayIcon*/
			var menuitem = _menuevent.menu.findItem('1');
			Player.addEventListener('change', function(_e) {
				console.log('state: ' + _e.state + ' ' + _e.description);
				console.log('currentSation=' + currentStation);
				switch (_e.state) {
				case 1:
					menuitem.setIcon(Ti.App.Android.R.drawable.ic_action_loading);
					break;
				case 3:
					menuitem.setIcon(Ti.App.Android.R.drawable['ic_action_stop_' + currentStation]);
					break;
				case 4:
				case 5:
					menuitem.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
					break;

				};
			});
			activity.actionBar.displayHomeAsUp = false;
			Ti.App.addEventListener('app:station', function(_e) {
				currentStation = _e.station;
				switch (currentStation) {
				case 'dlf':
					АктйонБар.setTitle('Deutschlandfunk');
					if (!Player.isPlaying())
						menuitem.setIcon(Ti.App.Android.R.drawable.ic_action_play_dlf);
					break;
				case 'drk':
					АктйонБар.setTitle('DRadio Kultur');
					if (!Player.isPlaying())
						menuitem.setIcon(Ti.App.Android.R.drawable.ic_action_play_drk);
					break;
				case 'drw':
					АктйонБар.setTitle('DRadio Wissen');
					if (!Player.isPlaying())
						menuitem.setIcon(Ti.App.Android.R.drawable.ic_action_play_drw);
					break;
				}
				activity.actionBar.logo = '/images/' + _e.station + '.png';
			});
			Ti.App.addEventListener('app:stop', function(_event) {
				if (Player.isPlaying()) {
					Player.stop();
					Player.release();
				}
			});
			Ti.App.addEventListener('app:play', function(_event) {
				/*
				 var self = Ti.UI.createAlertDialog({
				 message : _event.item.subtitle,
				 ok : 'Beitrag anhören',
				 title : _event.item.title
				 });
				 self.show();
				 self.addEventListener('click', function(_e) {
				 if (_e.index < 0)
				 return;
				 if (Player.isPlaying()) {
				 Player.stop();
				 }
				 Player.release();
				 Player.setUrl(_event.item.url);
				 Player.start();
				 });*/
			});
		};
		activity && activity.invalidateOptionsMenu();
		require('vendor/versionsreminder')();
	}
};
