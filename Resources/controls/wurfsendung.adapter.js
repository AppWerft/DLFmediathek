var Player = Ti.Media.createAudioPlayer();
module.exports = function() {
    var url = 'http://wurfsendung.dradio.de/wurf/index.php/de/Home/PlayTrack/TrackId/';
    var ndx = '' + Math.round((Math.random() * 777777777) % 2000);
    if (Player && Player.isPlaying()) {
        Player.stop();
        Player.release();
    }
    Player.setUrl(url + ndx);
    Player.play();
    return ndx;
};
