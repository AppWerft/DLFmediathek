var FlipModule = require('de.manumaticx.androidflip'),
    stations = {
	'dlf' : 0,
	'drk' : 1,
	'drw' : 2
},
    Model = require('model/stations'),
    Favs = new (require('controls/favorites.adapter'))();

var MediathekPage = require('ui/mediathek.page');

module.exports = function() {
	//http://jgilfelt.github.io/android-actionbarstylegenerator/#name=dlrmediathek&compat=appcompat&theme=dark&actionbarstyle=solid&texture=0&hairline=0&neutralPressed=1&backColor=6b6a6a%2C100&secondaryColor=6b6a6a%2C100&tabColor=949393%2C100&tertiaryColor=b6b6b6%2C100&accentColor=33B5E5%2C100&cabBackColor=d6d6d6%2C100&cabHighlightColor=949393%2C100
	var locked = false;
	var self = Ti.UI.createWindow();
	self.onitemclickFunc = function(_e) {
		var start = new Date().getTime();
		if (locked == true)
			return;
		locked = true;
		setTimeout(function() {
			locked = false;
		}, 700);
		if (_e.bindId && _e.bindId == 'fav') {
			var item = _e.section.getItemAt(_e.itemIndex);
			var isfav = Favs.toggleFav(JSON.parse(item.properties.itemId));
			item.fav.image = isfav ? '/images/fav.png' : '/images/favadd.png';
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
	var pages = [];
	
	for (var station in Model) {
		pages.push(new MediathekPage({
			station : station,
			window : self,
			color : Model[station].color,
			mediathek : Model[station].mediathek,
		}));
	};
	self.FlipViewCollection = FlipModule.createFlipView({
		orientation : FlipModule.ORIENTATION_HORIZONTAL,
		overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
		views : pages,
		top : 120,
		currentPage : stations[Ti.App.Properties.getString('LAST_STATION', 'dlf')],
		height : Ti.UI.FILL
	});
	self.onFlippedFunc = function(_e) {
		Ti.App.fireEvent('app:station', {
			station : _e.index != undefined ? pages[_e.index].station : _e.station,
			page : 'mediathek'
		});
		pages.forEach(function(page, ndx) {
			if (ndx == _e.index || _e.forced == true) {
				setTimeout(function() {
					page.updateCurrentinTopBox(true);
				}, 500);
				page.updateMediathekList();
			} else
				page.hideCurrent([_e.index]);
		});
	};
	self.onFocusFunc = function() {
		///self.FlipViewCollection.peakNext(true);
		Ti.App.fireEvent('app:state', {
			state : true
		});
		/*Ti.App.fireEvent('app:tab', {
		subtitle : 'Mediathek',
		title : Ti.App.Properties.getString('LAST_STATION'),
		icon : 'drk'
		});*/
		/*		self.onFlippedFunc({
		station : Ti.App.Properties.getString('LAST_STATION', 'dlf'),
		forced : true
		});*/
		// initial
	};
	self.FlipViewCollection.addEventListener('flipped', self.onFlippedFunc);
	self.addEventListener('focus', self.onFocusFunc);
	self.add(self.FlipViewCollection);
	self.addEventListener('blur', function() {
		Ti.App.fireEvent('app:state', {
			state : false
		});
	});
	Ti.Gesture.addEventListener('orientationchange', function() {
		self.FlipViewCollection && self.FlipViewCollection.setTop(Ti.Platform.displayCaps.platformHeight > Ti.Platform.displayCaps.platformWidth ? 120 : 65);
	});

	return self;
};
