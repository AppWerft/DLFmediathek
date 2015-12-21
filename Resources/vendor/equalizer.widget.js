var Canvas = require('com.wwl.canvas');

var LDF = Ti.Platform.displayCaps.logicalDensityFactor || 1;
var COLS = 12;

var Widget = function(args) {
	var width = args.width ? args.width * LDF : Ti.Platform.displayCaps.platformWidth,
	    height = args.height ? args.height * LDF : Ti.Platform.displayCaps.platformHeight;
	var canvas = Canvas.createCanvasView({
		width : args.width ? args.width : Ti.UI.FILL,
		height : args.height ? args.height : Ti.UI.FILL,
		left : args.left ? args.left : undefined,
		top : args.top ? args.top : undefined,
		right : args.right ? args.right : undefined,
		bottom : args.bottom ? args.bottom : undefined,
		backgroundColor : args.backgroundColor ? args.backgroundColor : 'transparent',
		antiAlias : true,
		//borderColor : 'orange',
		//borderWidth : LDF/2
	});
	function paint() {
		//canvas.clear();
		canvas.beginPath();
		canvas.fillStyle = 'gray';
		for (var i = 0; i < COLS.length; i++) {
			var x = i * width / COLS;
			var y = Math.random() * height;
			console.log('x='+x);
			console.log('y='+y);
			
			canvas.moveTo(x, height / 2);
			canvas.fillRect(x, height / 2, width / COLS, Math.random() * height);
		}
		setTimeout(paint, 5);
	}
	canvas.addEventListener('load', function() {
		console.log('Info: canvas loaded');
		setTimeout(paint, 50);
	});
	return canvas;
};

exports.createView = function(args) {
	return new Widget(args);
};
