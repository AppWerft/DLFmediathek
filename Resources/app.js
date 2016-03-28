! function() {
	var introWindow = require('ui/intro.window')();
	console.log('end intro => adding open Listener');
	introWindow.addEventListener('open',function(){
		require('ui/main.window')();
	});
	console.log('intro open');
	introWindow.open();
}();
