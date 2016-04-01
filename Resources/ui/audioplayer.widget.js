var start = new Date().getTime();
var createView = function(args) {
	if (!args)
		args = {};
	var color = (args.color) ? args.color : 'black',
	    $ = Ti.UI.createView({
		visible : false
	});
	$.add(Ti.UI.createView({
		opacity : 0.5,
		touchEnabled : false,
		backgroundColor : color
	}));
	if (args.image) {
		$.add(Ti.UI.createImageView({
			touchEnabled : false,
			bottom : 130,
			width : '60%',
			left : 0,
			zIndex : 99,
			height : 'auto',
			image : args.image
		}));
	}
	$.add(Ti.UI.createView({
		opacity : 0.3,
		touchEnabled : false,
		backgroundColor : 'black'
	}));
	$.container = Ti.UI.createView({
		bubbleParent : false,
		touchEnabled : false,
		height : 230,
		bottom : -230,
		backgroundColor : 'white'
	});
	$.add($.container);
	$.progress = Ti.UI.createProgressBar({
		bottom : 120,
		left : 80,
		right : 10,
		height : 30,
		width : Ti.UI.FILL,
		min : 0,
		max : 100
	});
	$.duration = Ti.UI.createLabel({
		bottom : 102,
		bubbleParent : false,
		touchEnabled : false,
		font : {
			fontSize : 12
		},
		color : color,
		right : 10,
	});
	$.title = Ti.UI.createLabel({
		top : 8,
		bubbleParent : false,
		touchEnabled : false,
		color : this.color,
		horizontalWrap : false,
		width : Ti.UI.FILL,
		wordWrap : false,
		ellipsize : Ti.UI.TEXT_ELLIPSIZE_TRUNCATE_MARQUEE,
		height : 25,
		font : {
			fontSize : 20,
			fontWeight : 'bold',
			fontFamily : 'Aller Bold'
		},
		left : 10,
	});
	$.subtitle = Ti.UI.createLabel({
		top : 36,
		bubbleParent : false,
		touchEnabled : false,
		color : '#555',
		horizontalWrap : false,
		wordWrap : false,
		ellipsize : true,
		width : Ti.UI.FILL,
		height : 20,
		font : {
			fontSize : 14,
			fontFamily : 'Aller Bold'
		},
		left : 10,
		right : 15
	});
	$.control = Ti.UI.createImageView({
		width : 50,
		height : 50,
		bubbleParent : false,
		left : 10,
		image : '/images/play.png',
		bottom : 115
	});
	$.spinner = Ti.UI.createActivityIndicator({
		width : 50,
		height : 50,
		style: Ti.UI.ActivityIndicatorStyle.BIG,
		bubbleParent : true,
		touchEnabled:false,
		left : 10,
		bottom : 115
	});
	$.spinner.show();
	/*$.equalizer = Ti.UI.createWebView({
		borderRadius : 1,
		width : 250,
		height : 40,
		bubbleParent : false,
		touchEnabled : false,
		scalesPageToFit : true,
		url : '/images/equalizer.gif',
		bottom : 30,
		left : 80,
		opacity : 0,
		enableZoomControls : false
	});*/
		$.equalizer  = require('com.miga.gifview').createGifView({
			width : 300,
			height : 77,
			bubbleParent : false,
			touchEnabled : false,
			image : '/images/equalizer.gif',
			bottom : 20,
			left : 60,
			opacity : 0,
			autoStart:true
		});
	$.container.add($.progress);
	$.container.add($.duration);
	$.container.add($.title);
	$.container.add($.subtitle);
	$.container.add($.control);
	$.container.add($.spinner);
	return $;
};
exports.getView = createView;

