var Canvas = require('com.wwl.canvas');

var Widget = function(args) {
	var canvas = Canvas.createCanvasView({
		width : args.width ? args.width : Ti.UI.FILL,
		height : args.height ? args.height : Ti.UI.FILL,
		left : args.left ? args.left : undefined,
		top : args.top ? args.top : undefined,
		right : args.right ? args.right : undefined,
		bottom : args.bottom ? args.bottom : undefined,
		
		backgroundColor : args.backgroundColor ? args.backgroundColor : 'transparent',
		
		

	});
	function paint() {
		canvas.clear();
		canvas.beginPath();
		canvas.moveTo(170, 80);
		canvas.bezierCurveTo(130, 100, 130, 150, 230, 150);
		canvas.bezierCurveTo(250, 180, 320, 180, 340, 150);
		canvas.bezierCurveTo(420, 150, 420, 120, 390, 100);
		canvas.bezierCurveTo(430, 40, 370, 30, 340, 50);
		canvas.bezierCurveTo(320, 5, 250, 20, 250, 50);
		canvas.bezierCurveTo(200, 5, 150, 20, 170, 80);
		canvas.closePath();
		canvas.lineWidth = 5;
		canvas.fillStyle = '#8ED6FF';
		canvas.fill();
		canvas.strokeStyle = 'blue';
		canvas.stroke();
		setTimeout(paint, 50);
	}
	canvas.addEventListener('load', function() {
		setTimeout(paint, 50);
	});
	return canvas;
};

exports.createView = function(args) {
	return new Widget(args);
};
