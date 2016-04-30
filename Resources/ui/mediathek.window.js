'use strict';
var FlipModule = require('de.manumaticx.androidflip'),
    stations = {
	'dlf' : 0,
	'drk' : 1,
	'drw' : 2
},
    Model = require('model/stations'),
    Favs = new (require('controls/favorites.adapter'))();

var MediathekPage = require('ui/mediathek.page');
var currentStation = Ti.App.Properties.hasProperty('LAST_STATION') ? Ti.App.Properties.getString('LAST_STATION') : 'dlf';

module.exports = function() {
	
	//http://jgilfelt.github.io/android-actionbarstylegenerator/#name=dlrmediathek&compat=appcompat&theme=dark&actionbarstyle=solid&texture=0&hairline=0&neutralPressed=1&backColor=6b6a6a%2C100&secondaryColor=6b6a6a%2C100&tabColor=949393%2C100&tertiaryColor=b6b6b6%2C100&accentColor=33B5E5%2C100&cabBackColor=d6d6d6%2C100&cabHighlightColor=949393%2C100
	var locked = false;
	var self = Ti.UI.createWindow();
	self.onitemclickFunc = require('ui/mediathek.onclick');
	var pages = [];
	for (var station in Model) {
		pages.push(MediathekPage({
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
		currentPage : stations[currentStation],
		height : Ti.UI.FILL
	});
	self.onFlippedFunc = function(_e) {
		console.log('#####################\nstationIndex' + _e.index);
		currentStation = _e.index != undefined ? pages[_e.index].station : _e.station;
		currentStation && Ti.App.Properties.setString('LAST_STATION', currentStation);
		Ti.App.fireEvent('app:station', {
			station : currentStation,
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
		self.FlipViewCollection && self.FlipViewCollection.setTop(Ti.Platform.displayCaps.platformHeight > Ti.Platform.displayCaps.platformWidth ? 124 : 74);
	});

	return self;
};
