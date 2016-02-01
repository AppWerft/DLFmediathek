var Model = require('model/stations'),
    Moment = require('vendor/moment'),
    FlipModule = require('de.manumaticx.androidflip'),
    Podcast = new (require('controls/feed.adapter'))(),
    stations = ['dlf', 'drk', 'drw'];

module.exports = function() {
	var self = Ti.UI.createWindow();
	var pages = [];
	for (var ndx = 0; ndx < stations.length; ndx++) {
		var podcasts = require('model/' + stations[ndx]);
		var color = podcasts.color;
		pages[ndx] = Ti.UI.createListView({
			templates : {
				'tiles' : require('TEMPLATES').tilestemplate,
			},
			defaultItemTemplate : 'tiles',
			station : stations[ndx].name,
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
		for (var i = 0; i < podcasts.length; i += 2) {
			var item = {
				i1 : {
					backgroundImage : ndx == 2 ? '/images/podcasts/' + podcasts[i].img.src : '/images/' + stations[ndx] + 'tile.png',
				},
				label1 : {
					text : ndx == 2 ? '' : (podcasts[i].a) ? podcasts[i].a.img.alt : podcasts[i].img.alt,
				}
			};
			var itemId = {
				i1 : {
					title : (podcasts[i].a) ? podcasts[i].a.img.alt : podcasts[i].img.alt,
					url : (podcasts[i].a) ? podcasts[i].a.href : podcasts[i].href,
				},
			};
			if (podcasts[i + 1]) {
				item.i2 = {
					backgroundImage : ndx == 2 ? '/images/podcasts/' + podcasts[i+1].img.src : '/images/' + stations[ndx] + 'tile.png',
				};
				item.label2 = {
					text : ndx == 2 ? '' : (podcasts[i + 1].a) ? podcasts[i + 1].a.img.alt : podcasts[i + 1].img.alt
				};
				itemId.i2 = {
					title : (podcasts[i + 1].a) ? podcasts[i + 1].a.img.alt : podcasts[i + 1].img.alt,
					url : (podcasts[i + 1].a) ? podcasts[i + 1].a.href : podcasts[i + 1].href,
				};
			}
			item.properties = {
				itemId : JSON.stringify(itemId)
			};
			dataitems.push(item);

			console.log(item.backgroundColor);

		}
		pages[ndx].sections[0].setItems(dataitems);
	}
	self.FlipViewCollection = FlipModule.createFlipView({
		orientation : FlipModule.ORIENTATION_HORIZONTAL,
		overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
		views : pages,
		currentPage : 0,
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
	return self;
};
