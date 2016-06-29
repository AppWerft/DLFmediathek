var Schema = require('controls/rss.adapter');

module.exports = function() {
	var $ = Ti.UI.createWindow({
		theme : 'Theme.TranslucentNoTitleBar',
		width : Ti.UI.FILL,
		fullscreen : true,
		height : Ti.UI.FILL,
		backgroundImage : '/images/background.png'
	});
	var width = Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor;
	$.wheel = Ti.UI.createView({
		backgroundImage : '/images/background_.png',
		center : {
			x : '50%',
			y : '70%'
		},
		borderRadius : width / 3,
		height : width / 1.5,
		width : width / 1.5
	});
	$.wheel.animate({
		duration : 30000,
		transform : Ti.UI.create2DMatrix({
			rotate : -3600,
		})
	});
	$.add($.wheel);
	$.spinView = require("de.appwerft.spinkit").createSpinnerView({
		type : 2,
		color : '#90505050',
		width : 240,
		height : 240,
		borderWidth:0,
		borderColor:'white',
		center : {
			x : '50%',
			y : '70%'
		}
	});
	$.add($.spinView);
	Schema.getRSS({
		station : "dlf"
	});
	Schema.getRSS({
		station : "drk"
	});
	return $;
};
