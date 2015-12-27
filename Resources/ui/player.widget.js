console.log('Info: start player building');
var start = new Date().getTime();
var createView = function(args) {
	if (!args)
		args = {};
	console.log('PPPPPPPPPPPPPP');	
	console.log(args);
	var color = (args.color) ? args.color : 'black',
	    self = Ti.UI.createView({
		visible : false
	});
	self.add(Ti.UI.createView({
		opacity : 0.5,
		touchEnabled : false,
		backgroundColor : color
	}));
	if (args.image) {
		self.add(Ti.UI.createImageView({
			touchEnabled : false,
			bottom : 130,
			width : '60%',
			left:0,
			height : 'auto',
			image : args.image
		}));
	}	
	self.add(Ti.UI.createView({
		opacity : 0.3,
		touchEnabled : false,
		backgroundColor : 'black'
	}));
	self.container = Ti.UI.createView({
		bubbleParent : false,
		touchEnabled : false,
		height : 230,
		bottom : -230,
		backgroundColor : 'white'
	});
	self.add(self.container);
	self.progress = Ti.UI.createProgressBar({
		bottom : 120,
		left : 80,
		right : 10,
		height : 30,
		width : Ti.UI.FILL,
		min : 0,
		max : 100
	});
	self.duration = Ti.UI.createLabel({
		bottom : 102,
		bubbleParent : false,
		touchEnabled : false,
		font : {
			fontSize : 12
		},
		color : color,
		right : 10,
	});
	self.title = Ti.UI.createLabel({
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
	self.subtitle = Ti.UI.createLabel({
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
	self.control = Ti.UI.createImageView({
		width : 50,
		height : 50,
		bubbleParent : false,
		left : 10,
		image : '/images/play.png',
		bottom : 115
	});

	self.equalizer = Ti.UI.createWebView({
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
	});
	self.container.add(self.progress);
	self.container.add(self.duration);
	self.container.add(self.title);
	self.container.add(self.subtitle);
	self.container.add(self.control);
	return self;
};

exports.getView = createView;

