var Model = require('model/stations'),
    Moment = require('vendor/moment'),
    FlipModule = require('de.manumaticx.androidflip'),
    Podcast = new (require('controls/feed.adapter'))(),
    stations = ['dlf', 'drk', 'drw'];

var tiles3template = {
	properties : {
		layout : 'horizontal',
		height : Ti.UI.SIZE,
	},
	childTemplates : [{
		type : 'Ti.UI.ImageView',
		bindId : 'i1',
		properties : {
			left : 0,
			top : 0,
			width : '33%',
			height : 'auto'
		}
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'i2',
		properties : {
			left : 0,
			top : 0,
			width : '33%',
			height : 'auto'
		}
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'i3',
		properties : {
			left : 0,
			top : 0,
			width : '33%',
			height : 'auto'
		}
	}]
};
var tiles2template = {
	properties : {
		layout : 'horizontal',
		height : Ti.UI.SIZE,
	},
	childTemplates : [{
		type : 'Ti.UI.ImageView',
		bindId : 'i1',
		properties : {
			left : 0,
			top : 0,
			width : '50%',
			height : 'auto'
		}
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'i2',
		properties : {
			left : 0,
			top : 0,
			width : '50%',
			height : 'auto'
		}
	}]
};
module.exports = function() {
	var self = Ti.UI.createWindow();

	var pages = [];
	for (var ndx = 0; ndx < stations.length; ndx++) {
		var podcasts = require('model/' + stations[ndx]);
		var color = podcasts.color;
		pages[ndx] = Ti.UI.createListView({
			templates : {
				'tiles' : tiles3template,
			},
			defaultItemTemplate : 'tiles',
			sections : [Ti.UI.createListSection({})]
		});
		pages[ndx].addEventListener('itemclick', function(_e) {
			if (_e.bindId) {
				var item = JSON.parse(_e.itemId)[_e.bindId];
				if (item) {
					item.color = color;
					item.station = stations[ndx];
					require('ui/podcastlist.window')(item).open();
				}
			}
		});
		var dataitems = [];
		for (var i = 0; i < podcasts.length; i += 3) {
			var item = {
				i1 : {
					image : (podcasts[i].a) ? podcasts[i].a.img.src : podcasts[i].img.src,
				}
			};
			var itemId = {
				i1 : {
					title : (podcasts[i].a) ? podcasts[i].a.img.alt : podcasts[i].img.alt,
					url : (podcasts[i].a) ? podcasts[i].a.href : podcasts[i].href,
				}
			};

			if (podcasts[i + 1]) {
				item.i2 = {
					image : (podcasts[i + 1].a) ? podcasts[i + 1].a.img.src : podcasts[i + 1].img.src,
				};
				itemId.i2 = {
					title : (podcasts[i + 1].a) ? podcasts[i + 1].a.img.alt : podcasts[i + 1].img.alt,
					url : (podcasts[i + 1].a) ? podcasts[i + 1].a.href : podcasts[i + 1].href,
				};

			}
			if (podcasts[i + 2]) {
				item.i3 = {
					image : (podcasts[i + 2].a) ? podcasts[i + 2].a.img.src : podcasts[i + 2].img.src,
				};
				itemId.i3 = {
					title : (podcasts[i + 2].a) ? podcasts[i + 2].a.img.alt : podcasts[i + 2].img.alt,
					url : (podcasts[i + 2].a) ? podcasts[i + 2].a.href : podcasts[i + 2].href,
				};
			}
			item.properties = {
				itemId : JSON.stringify(itemId)
			};
			dataitems.push(item);
		}
		pages[ndx].sections[0].setItems(dataitems);
	}
	self.FlipViewCollection = FlipModule.createFlipView({
		orientation : FlipModule.ORIENTATION_HORIZONTAL,
		overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
		views : pages,
		currentPage : Ti.App.Properties.getInt('LAST_STATION_NDX', 0),
		height : Ti.UI.FILL,
		width : Ti.UI.FILL
	});
	if (Ti.App.Properties.getInt('LAST_STATION_NDX', 0) == 0) {
		Ti.App.fireEvent('app:station', {
			station : pages[0].name
		});
	}
	self.FlipViewCollection.addEventListener('flipped', function(_e) {
		Ti.App.Properties.setString('LAST_STATION', pages[_e.index].station);
		Ti.App.Properties.setInt('LAST_STATION_NDX', _e.index);
		Ti.App.fireEvent('app:station', {
			station : pages[_e.index].name
		});
		//Geo.savePosition(stations[_e.index]);
	});
	self.add(self.FlipViewCollection);

	return self;
};
