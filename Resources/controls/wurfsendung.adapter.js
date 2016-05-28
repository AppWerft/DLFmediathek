var Player = Ti.Media.createAudioPlayer();
var done;
module.exports = function(onstarted) {
	var args = arguments[0] || {};

	if (Player) {
		Player.stop();
		Player.release();
		console.log('Info: player stopped and released');
	}
	var ndx = Math.round((Math.random() * 777777777) % 2500);
	var url = 'http://wurfsendung.dradio.de/wurf/index.php/de/Home/PlayTrack/TrackId/' + ndx;
	
	Player.setUrl(url);
	Player.play();
	if (done && typeof done == 'function')
		setTimeout(done, 1000);
	return ndx;
};
