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
	var ndx = Math.round((Math.random() * 777777777) % 2100);
	Player.setUrl('http://wurfsendung.dradio.de/wurf/index.php/de/Home/PlayTrack/TrackId/' + ndx);
	Player.play();
	setTimeout(done, 1000);
	console.log('Info: player started');
	return ndx;
};
