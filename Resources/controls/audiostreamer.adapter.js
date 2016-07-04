/* Init */
//https://github.com/vbartacek/aacdecoder-android/blob/master/decoder/src/com/spoledge/aacdecoder/IcyInputStream.java#L98-L112

var StreamingPlayer = require('com.woohoo.androidaudiostreamer');

const TICK = 3000;

var wasLastPingSuccessful = false;
var audioSessionId;

function LOG() {
	console.log('AAS: ' + arguments[0]);
}

function requestOnlinestate(_cb) {
	if (Ti.Network.online == false) {
		wasLastPingSuccessful = false;
		_cb && _cb(false);
	} else {
		var xhr = Ti.Network.createHTTPClient({
			timeout : TICK,
			onload : function() {
				if (xhr.status == 301) {
					wasLastPingSuccessful = true;
					_cb && _cb(true);
				} else {
					wasLastPingSuccessful = false;
					_cb && _cb(false);
				}
			},
			onerror : function() {
				wasLastPingSuccessful = false;
				_cb && _cb(false);
			}
		});
		xhr.setAutoRedirect(false);
		xhr.open('HEAD', 'https://facebook.com/'), xhr.send();
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
		LOG('event STOPPED FROM streamer');
		if (!shouldStopp) {
			LOG('stopping by offline');
			StreamingPlayer.stop();
		}
		shouldStopp = false;

		if (shouldStream && Ti.Network.online) {
			LOG('play in STOP event node, timeouttimer started');
			timeoutTimer = setTimeout(onTimeout, TIMEOUTVALUE);
			StreamingPlayer.play(shouldStream);
		}
		callbackFn({
			status : 'STOPPED',
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
	var message = _e.title;
	callbackFn({
		message : message,
		status : 'PLAYING'
	});
}

function onTimeout() {
	console.log('Error: get timeout!!');
	callbackFn({
		status : 'TIMEOUT'
	});

}

StreamingPlayer.addEventListener('ready', function(_e) {
	console.log(_e);
	callbackFn({
		audioSessionId : _e.audioSessionId
	});
});
StreamingPlayer.addEventListener('metadata', onMetaData);
StreamingPlayer.addEventListener('change', onPlayerChange);

exports.play = function(_icyurl, _callbackFn) {
	callbackFn = _callbackFn;
	if (_icyurl != undefined && typeof _icyurl == 'string') {
		shouldStream = _icyurl;
		StreamingPlayer.stop();
		/* was playing: we stop, wait og stop is finished a try to start again */
		LOG('status after start method = ' + STATUS[StreamingPlayer.getStatus()]);
		if (StreamingPlayer.getStatus() == PLAYING) {
			LOG('was playing => forced stopp');
			shouldStop = true;
			StreamingPlayer.stop();
		} else {
			requestOnlinestate(function(_online) {
				console.log('Result from requestOnlinestate ' + _online);
				if (_online == true) {
					LOG('timeout watcher started, status was ' + STATUS[StreamingPlayer.getStatus()]);
					//	timeoutTimer = setTimeout(onTimeout, TIMEOUTVALUE);
					//	console.log('timeouttimer started');
					StreamingPlayer.play({
						url : _icyurl,
						expectedKBitSecRate : 128
					});
					LOG('PLAY STARTED');
				} else {
					timeoutTimer && clearTimeout(timeoutTimer);
					callbackFn({
						status : 'OFFLINE'
					});
				}
			});
		}
	}
};

exports.stop = function() {
	LOG('≠≠≠≠≠≠≠ STOP');
	shouldStream = null;
	shoudStopp = true;
	StreamingPlayer.stop();
};

exports.isPlaying = function() {
	return StreamingPlayer.getStatus() == PLAYING ? true : false;
};

exports.isOnline = function() {
	return wasLastPingSuccessful;
};

/* every click */
/*
 var watchDog = setInterval(function() {

 if (shouldStream != null)
 requestOnlinestate(function() {
 });
 // set module variable wasLastPingSuccessful
 }, TICK);
 */
