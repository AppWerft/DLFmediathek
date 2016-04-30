var start = new Date().getTime();
var $ = function(args) {
	if (!args)
		args = {};
	var color = (args.color) ? args.color : 'white';

	var $ = Ti.UI.createView({
		visible : true,bottom:0
	});
	color = '#fff';
	$.add(Ti.UI.createView({
		opacity : 0.92,
		touchEnabled : false,
		backgroundColor : 'black'
	}));
	if (args.image) {
		$.add(Ti.UI.createImageView({
			touchEnabled : false,
			top : 0,
			right:0,
			width : '60%',
			height : 'auto',
			image : args.image
		}));
	}
	$.visualizerContainer = Ti.UI.createView({
		height : Ti.UI.FILL,visible:false
	});
	$.add($.visualizerContainer);
	$.container = Ti.UI.createView({
		bubbleParent : false,
		touchEnabled : false,
		height : 230,
		zIndex : 99,
		bottom : 0,
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
	$.slider = Ti.UI.createSlider({
		bottom : 115,
		left : 80,
		visible : false,
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
		color : 'white',
		right : 10,
	});
	$.title = Ti.UI.createLabel({
		top : 8,
		bubbleParent : false,
		touchEnabled : false,
		color : 'white',
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
		color : 'white',
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
		style : Ti.UI.ActivityIndicatorStyle.BIG,
		bubbleParent : true,
		touchEnabled : false,
		left : 10,
		bottom : 115
	});
	$.spinner.show();
	$.container.add($.progress);
	$.container.add($.slider);
	$.container.add($.duration);
	$.container.add($.title);
	$.container.add($.subtitle);
	$.container.add($.control);
	$.container.add($.spinner);
	return $;
};
exports.getView = $;

