var FlipModule = require('de.manumaticx.androidflip'),
    stations = {
	'dlf' : 0,
	'drk' : 1,
	'drw' : 2
},
    Model = require('model/stations');

module.exports = function() {
	//http://jgilfelt.github.io/android-actionbarstylegenerator/#name=dlrmediathek&compat=appcompat&theme=dark&actionbarstyle=solid&texture=0&hairline=0&neutralPressed=1&backColor=6b6a6a%2C100&secondaryColor=6b6a6a%2C100&tabColor=949393%2C100&tertiaryColor=b6b6b6%2C100&accentColor=33B5E5%2C100&cabBackColor=d6d6d6%2C100&cabHighlightColor=949393%2C100
	
	var self = Ti.UI.createWindow();
	var pages = [];
	for (var station in Model) {
		pages.push(require('ui/mediathek.page')({
			station : station,
			color : Model[station].color,
			mediathek : Model[station].mediathek,
		}));
	};
	
	self.FlipViewCollection = FlipModule.createFlipView({
		orientation : FlipModule.ORIENTATION_HORIZONTAL,
		overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
		views : pages,
		currentPage : stations[Ti.App.Properties.getString('LAST_STATION', 'dlf')],
		height : Ti.UI.FILL
	});
	self.FlipViewCollection.addEventListener('flipped', function(_e) {
		console.log('Info: Mediathek flipped');
		Ti.App.fireEvent('app:station', {
			station : pages[_e.index].station,
			page : 'mediathek'
		});
		pages.forEach(function(page, ndx) {
			if (ndx == _e.index)
				setTimeout(function() {
					page.updateCurrentinTopBox(true);
				}, 1000);
			else
				page.hideCurrent([_e.index]);
		});
	});
	self.add(self.FlipViewCollection);
	self.addEventListener('focus', function() {
		self.FlipViewCollection.peakNext(true);
		Ti.App.fireEvent('app:state', {
			state : true
		});
		Ti.App.fireEvent('app:tab', {
			subtitle : 'Mediathek',
			title : Ti.App.Properties.getString('LAST_STATION'),
			icon : 'drk'
		});
	});
	self.addEventListener('blur', function() {
		Ti.App.fireEvent('app:state', {
			state : false
		});
	});
	return self;
};
