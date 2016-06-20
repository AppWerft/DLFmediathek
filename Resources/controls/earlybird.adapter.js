	'use strict';
var DEPOT = 'EARLYBIRDWEB∞';

module.exports = function(_container, _i, _onload) {
	if (Ti.App.Properties.hasProperty(DEPOT + _i)) {
		_onload(Ti.App.Properties.getList(DEPOT + _i));
	}
	require('de.appwerft.scraper').createScraper({
		url : 'http://dradiowissen.de/early-bird/p' + (_i + 1),
		rootXpath : "//section",
		subXpaths : {
			title : "//figure[@class=teaser__image]/button/@data-title",
			mp3 : "//figure[@class=teaser__image]/button/@data-mp3",
			image : "//figure[@class=teaser__image]/a/img/@src"
		}
	}, function(_e) {
		if (_e.success) {
			var items = _e.items;
			/* sanitizing (extracting duration) */
			for (var i = 0; i < _e.count; i++) {
				var item = _e.items[i];
				if (item.title) {
					var match = item.title.match(/\(([\d][\d]:[\d][\d])\)/);
					if (match) {
						item.duration = parseInt(match[1].split(':')[0]) * 60 + parseInt(match[1].split(':')[1]);
						item.title = item.title.replace(/\(([\d][\d]:[\d][\d])\)/, '').replace('Early Bird - ', '');
					} ;
				}
			};
			Ti.App.Properties.setList(DEPOT + _i, items);
			_onload(items);
		}
	});
	return;
};
