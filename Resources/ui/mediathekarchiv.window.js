'use strict';
var Model = require('model/stations'),
    Favs = new (require('controls/favorites.adapter'))(),
    Moment = require('vendor/moment'),
    АктйонБар = require('com.alcoapps.actionbarextras');

var MediathekPage = require('ui/mediathek.page');

module.exports = function(args) {
	//http://jgilfelt.github.io/android-actionbarstylegenerator/#name=dlrmediathek&compat=appcompat&theme=dark&actionbarstyle=solid&texture=0&hairline=0&neutralPressed=1&backColor=6b6a6a%2C100&secondaryColor=6b6a6a%2C100&tabColor=949393%2C100&tertiaryColor=b6b6b6%2C100&accentColor=33B5E5%2C100&cabBackColor=d6d6d6%2C100&cabHighlightColor=949393%2C100
	var station = args.station;
	var locked = false;
	var color = Model[station].color;
	var date = args.date;

	var $ = Ti.UI.createWindow();
	$.onitemclickFunc = function(_e) {
		var start = new Date().getTime();
		if (locked == true)
			return;
		locked = true;
		setTimeout(function() {
			locked = false;
		}, 700);
		if (_e.bindId && _e.bindId == 'fav') {
			var item = _e.section.getItemAt(_e.itemIndex);
			var payload = JSON.parse(item.properties.itemId);
			var isfav = Favs.toggleFav(payload);
			item.fav.image = isfav ? '/images/fav.png' : '/images/favadd.png';
			if (isfav)
				require('ui/download.dialog')(function() {
					if (true == Ti.App.Properties.getBool('OFFLINE_DECISION')) {
						/* init the download*/
						var CacheAdapter = require('controls/cache.adapter');

						CacheAdapter.cacheURL(payload);
					}
				});
			item.fav.opacity = isfav ? 0.8 : 0.5;
			_e.section.updateItemAt(_e.itemIndex, item);
		} else if (_e.bindId && _e.bindId == 'share') {
			var message = 'Höre gerade mit der #DRadioMediathekApp „' + JSON.parse(_e.itemId).subtitle + '“';
			Ti.UI.createNotification({
				message : 'Verkürze URL des Beirags.\nEinen Augenblick …'
			}).show();
			require('vendor/socialshare')({
				type : 'all',
				message : message,
				url : JSON.parse(_e.itemId).url,
			});
		} else if (_e.bindId && _e.bindId == 'playtrigger') {
			Ti.App.fireEvent('app:stopAudioStreamer');
			var data = JSON.parse(_e.itemId);
			require('ui/audioplayer.window').createAndStartPlayer({
				color : '#000',
				url : data.url,
				duration : data.duration,
				title : data.title,
				subtitle : data.subtitle,
				author : data.author,
				station : data.station,
				pubdate : data.pubdate
			});
		}
	};

	$.pageView = MediathekPage({
		station : station,
		date : date,
		top : 80,
		archiv : true,
		window : $,
		color : color,
		mediathek : Model[station].mediathek,
	});
	$.pageView.setTop(10);
	$.onFocusFunc = function() {
		///$.FlipViewCollection.peakNext(true);
		Ti.App.fireEvent('app:state', {
			state : true
		});

	};
	$.addEventListener('focus', $.onFocusFunc);
	$.addEventListener('open', function(_event) {
		АктйонБар.title = Model[station].name;
		АктйонБар.subtitle = ' Mediathek vom ' + date.format('LL');
		АктйонБар.titleFont = "Aller Bold";
		АктйонБар.subtitleColor = "#ccc";
		АктйонБар.setBackgroundColor('#444444');
		АктйонБар.setStatusbarColor(color);
		var activity = _event.source.getActivity();
		if (activity) {
			activity.onCreateOptionsMenu = function(_menuevent) {
				activity.actionBar.displayHomeAsUp = true;
				_menuevent.menu.clear();
				_menuevent.menu.add({
					title : '<',
					itemId : -1,
					visible : true,
					icon : "/images/yesterday.png",
					showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
				}).addEventListener("click", function() {
					date = Moment(date).add(-1, "days");
					АктйонБар.subtitle = ' Mediathek vom ' + date.format('LL');
					$.remove($.pageView);
					$.pageView = MediathekPage({
						station : station,
						date : date,
						top : 80,
						archiv : true,
						window : $,
						color : color,
						mediathek : Model[station].mediathek,
					});
					$.add($.pageView);
					$.pageView.setTop(10);
				});
				_menuevent.menu.add({
					title : '>',
					itemId : 1,
					visible : true,
					icon : "/images/tomorrow.png",
					showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
				}).addEventListener("click", function() {
					date = Moment(date).add(1, "days");
					АктйонБар.subtitle = ' Mediathek vom ' + date.format('LL');
					$.remove($.pageView);
					$.pageView = MediathekPage({
						station : station,
						date : date,
						top : 80,
						archiv : true,
						window : $,
						color : color,
						mediathek : Model[station].mediathek,
					});
					$.add($.pageView);
					$.pageView.setTop(10);
				});
			};
			activity.actionBar.onHomeIconItemSelected = function() {
				$.close();
			};
			activity.invalidateOptionsMenu();
		};
	});

	$.add($.pageView);
	$.addEventListener('blur', function() {
		Ti.App.fireEvent('app:state', {
			state : false
		});
	});
	Ti.Gesture.addEventListener('orientationchange', function() {
	});

	return $;
};
