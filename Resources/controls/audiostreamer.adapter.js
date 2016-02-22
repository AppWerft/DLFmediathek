Ti.App.AudioStreamer = require('com.woohoo.androidaudiostreamer');

function LOG() {
	//console.log('AAS: ' + arguments[0]);
}

function pingNet(onSuccess, onError) {
	if (Ti.Network.online == false)
		onError();
	else {
		var xhr = Ti.Network.createHTTPClient({
			onload : onSuccess
		});
		xhr.open('HEAD', 'https://google.com/'), xhr.send();
	}

}

var shouldStream = null;
// null or URL (string)
var shouldStopp = false;
// true or false

const STOPPED = 0,
    BUFFERING = 1,
    PLAYING = 2,
    STREAMERROR = 3,
    TIMEOUT = 4,
    STATUS = ['STOPPED', 'BUFFERING', 'PLAYING', 'STREAMERROR', 'TIMEOUT'];

var timeoutTimer = null;
const TIMEOUTVALUE = 10000;

/* is callback function with payload:
 * String message
 * Integer status  ['STOPPED', 'BUFFERING', 'PLAYING', 'STREAMERROR']
 */
var callbackFn;

function onPlayerChange(_e) {
	var status = _e.status;
	if (timeoutTimer) {
		LOG('stopping watchdog timer by player event	');
		clearTimeout(timeoutTimer);
		timeoutTimer = null;
	}

	switch (status) {
	case BUFFERING:
		callbackFn({
			status : 'BUFFERING'
		});
		break;
	case PLAYING:
		callbackFn({
			status : 'PLAYING'
		});
		break;
	case STOPPED:
		if (!shouldStopp) {
			LOG('stopping by offline');
			Ti.App.AudioStreamer.stop();
		}
		shouldStopp = false;
		LOG('event STOPPED FROM streamer');
		if (shouldStream && Ti.Network.online) {
			LOG('play in STOP event node, timeouttimer started');
			timeoutTimer = setTimeout(onTimeout, TIMEOUTVALUE);
			Ti.App.AudioStreamer.play(shouldStream);
		}
		callbackFn({
			status : 'STOPPED'
		});
		break;
	case STREAMERROR:
		callbackFn({
			status : 'STREAMERROR'
		});
		L('LOST_CONNECTION_TOAST') && Ti.UI.createNotification({
			message : L('LOST_CONNECTION_TOAST')
		}).show();
		break;
	};
}

function onMetaData(_e) {
	console.log(_e);
	var message = _e.title;
	callbackFn({
		message : message,
		status : 'PLAYING'
	});
}

function onTimeout() {
	callbackFn({
		status : 'TIMEOUT'
	});

}

Ti.App.AudioStreamer.addEventListener('metadata', onMetaData);
Ti.App.AudioStreamer.addEventListener('change', onPlayerChange);

exports.play = function(_icyurl, _callbackFn) {
	callbackFn = _callbackFn;
	if (_icyurl != undefined && typeof _icyurl == 'string') {
		LOG('≠≠≠≠≠≠≠ PLAY');
		shouldStream = _icyurl;
		/* was playing: we stop, wait og stop is finished a try to start again */
		LOG('status after start method = ' + STATUS[Ti.App.AudioStreamer.getStatus()]);
		if (Ti.App.AudioStreamer.getStatus() == PLAYING) {
			LOG('was playing => forced stopp');
			shouldStop = true;
			Ti.App.AudioStreamer.stop();
		} else {
			LOG('timeout watcher started, statsu was ' + STATUS[Ti.App.AudioStreamer.getStatus()]);
			timeoutTimer = setTimeout(onTimeout, TIMEOUTVALUE);
			Ti.App.AudioStreamer.play(_icyurl);
			LOG('PLAY STARTED');
		}
	}
};

exports.stop = function() {
	LOG('≠≠≠≠≠≠≠ STOP');
	shouldStream = null;
	shoudStopp = true;
	Ti.App.AudioStreamer.stop();
};

exports.isPlaying = function() {
	return Ti.App.AudioStreamer.getStatus() == PLAYING ? true : false;
};
