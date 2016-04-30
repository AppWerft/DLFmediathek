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
	/*
	 $.container = Ti.UI.createView({
	 width : Ti.UI.SIZE,
	 height : 50,
	 bottom : 50,
	 backgroundColor : '#3000',
	 left : 10,
	 right : 10,
	 borderRadius : 5
	 });
	 $.add($.container);
	 $.progressView = Ti.UI.createView({
	 height : 50,
	 opacity : 0.2,
	 backgroundColor : '#000',
	 width : '1%'
	 });
	 $.container.add($.progressView);
	 $.progressView.animate({
	 width : '100%',
	 opacity : 1.0,
	 duration : 10000
	 });
	 $.container.add($.progressView);
	 $.container.add(Ti.UI.createLabel({
	 text : ' Hole Programmdetails vom Radioserver ',
	 height : Ti.UI.SIZE,
	 textAlign : 'center',
	 font : {
	 fontSize : 20,
	 fontFamily : 'ScalaSans'
	 }
	 }));*/
	return $;
};
