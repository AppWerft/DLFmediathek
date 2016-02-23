var Model = require('model/stations'),
    Moment = require('vendor/moment'),
    FlipModule = require('de.manumaticx.androidflip'),
    Podcast = new (require('controls/feed.adapter'))(),
    stations = ['dlf', 'drk', 'drw'];

function getTilewidth() {
	var screenwidth = Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor,
	    screenheight = Ti.Platform.displayCaps.platformHeight / Ti.Platform.displayCaps.logicalDensityFactor;
	var tilewidth = Math.min(screenwidth, screenheight)/2;
	return tilewidth;
}

module.exports = function() {
	var self = Ti.UI.createWindow();
	var pages = [];
	function flipTo() {
		var laststation = Ti.App.Properties.getString('LAST_STATION', 'dlf');
		var stationindex;
		for (var ndx = 0; ndx < stations.length; ndx++) {
			if (stations[ndx] == laststation)
				stationindex = ndx;
		}
		if (self.FlipViewCollection)
			self.FlipViewCollection.currentPage = stationindex;
	}

	for (var ndx = 0; ndx < stations.length; ndx++) {
		var podcasts = require('model/' + stations[ndx]);
		var color = podcasts.color;
		pages[ndx] = Ti.UI.createScrollView({
			scrollType : 'vertical',
			layout : 'horizontal',
			width : Ti.UI.FILL,
			contentWidth : Ti.UI.FILL,
			horizontalWrap : true,
		});
		pages[ndx].addEventListener('click', function(_e) {
			if (_e.source.itemId) {
				var item = JSON.parse(_e.source.itemId);
				console.log(item);

				if (item) {
					item.color = color;
					item.station = stations[ndx];
					require('ui/podcastlist.window')(item).open();
				}
			}
		});
		podcasts.forEach(function(p) {
			var itemId = {
				title : (p.a) ? p.a.img.alt : p.img.alt,
				url : (p.a) ? p.a.href : p.href,
			};
			var backgroundImage = ndx == 2 ? '/images/podcasts/' + p.img.src : '/images/' + stations[ndx] + 'tile.png';
			console.log(backgroundImage);
			var cv = Ti.UI.Android.createCardView({
				padding : 0,
				width : getTilewidth(),
				height : getTilewidth(),
				top : 0,
				itemId : JSON.stringify(itemId),
				borderRadius : 10,
				useCompatPadding : true,
				backgroundImage : backgroundImage,
			});
			cv.add(Ti.UI.createImageView({
				image : backgroundImage,
				width : Ti.UI.FILL,
				height : Ti.UI.FILL,
				touchEnabled : false
			}));
			if (ndx < 2)
				cv.add(Ti.UI.createLabel({
					text : (p.a) ? p.a.img.alt : p.img.alt,
					bottom : 10,
					left : 10,
					font : {
						fontSize : 18,
						fontFamily : 'ScalaSans'
					}
				}));
			pages[ndx].add(cv);

		});
	}
	self.FlipViewCollection = FlipModule.createFlipView({
		orientation : FlipModule.ORIENTATION_HORIZONTAL,
		overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
		views : pages,
		top : 127,

		height : Ti.UI.FILL,
		width : Ti.UI.FILL
	});
	self.FlipViewCollection.addEventListener('flipped', function(_e) {
		Ti.App.fireEvent('app:station', {
			station : stations[_e.source.currentPage],
			page : 'Podcasts'
		});
	});
	self.add(self.FlipViewCollection);
	self.addEventListener('focus', flipTo);
	Ti.Gesture.addEventListener('orientationchange', function() {
		self.FlipViewCollection && self.FlipViewCollection.setTop(Ti.Platform.displayCaps.platformHeight > Ti.Platform.displayCaps.platformWidth ? 132 : 67);
	});
	return self;
};
