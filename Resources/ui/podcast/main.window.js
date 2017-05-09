'use strict';

var Model = require('model/stations'),
    Moment = require('vendor/moment'),
    FlipModule = require('de.manumaticx.androidflip'),
    Podcast = new (require('controls/feed.adapter'))(),
    CardView = require("ui/podcast/cardview.widget"),
    stations = ["dlf", "drk", "drw"];

var getTileDims = function() {
	var tilewidth,
	    tileheight;
	var screenwidth = Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor,
	    screenheight = Ti.Platform.displayCaps.platformHeight / Ti.Platform.displayCaps.logicalDensityFactor;
	var tilewidth = Math.min(screenwidth, screenheight) / 2;
	if (Ti.Platform.displayCaps.platformHeight > Ti.Platform.displayCaps.platformWidth) {
		tilewidth = '50%';
		tileheight = screenwidth / 2;

	} else {
		tilewidth = '25%';
		tileheight = screenwidth / 4;
	}
	return {
		width : tilewidth,
		height : tileheight
	};
};

module.exports = function() {
	var $ = Ti.UI.createWindow();
	var pages = [];
	function flipTo() {
		var laststation = Ti.App.Properties.getString('LAST_STATION', 'dlf');
		var stationindex;
		for (var ndx = 0; ndx < stations.length; ndx++) {
			if (stations[ndx] == laststation)
				stationindex = ndx;
		}
		if ($.FlipViewCollection)
			$.FlipViewCollection.currentPage = stationindex;
	}


	stations.forEach(function(station, ndx) {
		var podcasts = require('model/' + station);
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
				Ti.Media.vibrate([20, 10]);
				var item = JSON.parse(_e.source.itemId);
				if (item) {
					item.station = stations[ndx];
					if (Array.isArray(item.url)) {
						var dialog = Ti.UI.createOptionDialog({
							options : ["Beiträge", "Ganze Sendung"]
						});
						dialog.addEventListener("click", function(event) {
							if (event.index >= 0 && event.index<item.url.length) {
								item.url = item.url[event.index];
								require('ui/podcast/list.window')(item).open();
							}
						});
						dialog.show();
					} else
						require('ui/podcast/list.window')(item).open();
				}
			}
		});
		var dims = getTileDims();
		podcasts.forEach(function(podcast) {
			pages[ndx].add(CardView(podcast, station, dims));
		});
	});

	$.FlipViewCollection = FlipModule.createFlipView({
		orientation : FlipModule.ORIENTATION_HORIZONTAL,
		overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
		views : pages,
		top : 127,
		height : Ti.UI.FILL,
		width : Ti.UI.FILL
	});
	$.FlipViewCollection.addEventListener('flipped', function(_e) {
		Ti.App.fireEvent('app:station', {
			station : stations[_e.source.currentPage],
			page : 'Podcasts'
		});
	});
	$.add($.FlipViewCollection);
	$.addEventListener('focus', flipTo);
	Ti.Gesture.addEventListener('orientationchange', function() {
		var currentStation = Ti.App.Properties.getString('LAST_STATION', 'dlf');
		if (Ti.Platform.displayCaps.platformHeight > Ti.Platform.displayCaps.platformWidth) {
			$.FlipViewCollection && $.FlipViewCollection.setTop(130);
		} else {
			$.FlipViewCollection && $.FlipViewCollection.setTop(80);
		}
		var dims = getTileDims();
		if (dims != undefined) {
			var tilewidth = dims.width;
			var tileheight = dims.height;
			pages[0].children.forEach(function(view) {
				view.hide();
				view.setWidth(tilewidth), view.setHeight(tileheight);
				view.show({
					animated : currentStation == stations[0] ? true : false
				});
			});
			pages[1].children.forEach(function(view) {
				view.hide();
				view.setWidth(tilewidth), view.setHeight(tileheight);
				view.show({
					animated : currentStation == stations[1] ? true : false
				});
			});
			pages[2].children.forEach(function(view) {
				view.hide();
				view.setWidth(tilewidth), view.setHeight(tileheight);
				view.show({
					animated : currentStation == stations[2] ? true : false
				});
			});
		}
	});
	return $;
};
