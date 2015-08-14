var Player = Ti.Media.createAudioPlayer();
var done;
module.exports = function() {
	var args = arguments[0] || {};
	done = args.done;
	if (Player) {
		Player.stop();
		Player.release();
		console.log('Info: player stopped and released');
	}
	var ndx = Math.round((Math.random() * 777777777) % 2500);
	var url = 'http://wurfsendung.dradio.de/wurf/index.php/de/Home/PlayTrack/TrackId/' + ndx;
	console.log(url);
	Player.setUrl(url);
	Player.play();
	setTimeout(done, 1000);
	return ndx;
};
