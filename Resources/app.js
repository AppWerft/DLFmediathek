String.prototype.toHHMMSS = function() {
	var sec_num = parseInt(this / 1000, 10);
	// don't forget the second param
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);
	if (hours < 10)
		hours = "0" + hours;
	if (minutes < 10)
		minutes = "0" + minutes;
	if (seconds < 10)
		seconds = "0" + seconds;
	var time = (hours != '00') ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds;
	return time;
};

//if (require("de.appwerft.cameraparameters").isPermissionGranted())//

//require("de.appwerft.cameraparameters").getAllCameras({
//	onSuccess : function() {
//		console.log(arguments[0]);
//	}
//});
! function() {
 var introWindow = require('ui/intro.window')();
 introWindow.addEventListener('open', function() {
 require('ui/main.tabgroup')();
 });
 introWindow.open();
 require('cronservice.trigger')();

 }();

