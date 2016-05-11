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
		bottom : 50,
		borderRadius : width/2,
		height : Ti.UI.FILL,height:width
	});
	$.wheel.animate({
		duration : 30000,
		transform : Ti.UI.create2DMatrix({
			rotate : 3600,

		})
	});
	$.add($.wheel);
	return $;
};
