Ti.App.AudioStreamer = require('com.woohoo.androidaudiostreamer');

var shouldStream = null;
// null or URL (string)
var shouldStopp = false;
// true or false

const STOPPED = 0,
    BUFFERING = 1,
    PLAYING = 2,
    STREAMERROR = 3,
    TIMEOUT =4,
    STATUS = ['STOPPED', 'BUFFERING', 'PLAYING', 'STREAMERROR','TIMEOUT'];

var timeoutTimer = null;
const TIMEOUTVALUE = 10000;

/* is callback function with payload:
 * String message
 * Integer status  ['STOPPED', 'BUFFERING', 'PLAYING', 'STREAMERROR']
 */
var callbackFn;

function onPlayerChange(_e) {
	var status = _e.status;
	if (status != PLAYING)
		console.log('Info: AAS onPlayerChange ' + STATUS[status]);
	if (timeoutTimer !== null) {
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
		shouldStopp = false;
		if (shouldStream) {
			console.log('AAS: play in STOP event node, timeouttimer started');
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
	var message = _e.title;
	callbackFn({
		message : message,
		status : 'PLAYING'
	});
}

function onTimeout() {
	L('OFFLINE_RADIO_TOAST') && Ti.UI.createNotification({
		message : L('OFFLINE_RADIO_TOAST')
	}).show();
	callbackFn({
		status : 'TIMEOUT'
	});

}

Ti.App.AudioStreamer.addEventListener('metadata', onMetaData);
Ti.App.AudioStreamer.addEventListener('change', onPlayerChange);

exports.play = function(_icyurl, _callbackFn) {
	callbackFn = _callbackFn;
	if (_icyurl != undefined && typeof _icyurl == 'string') {
		shouldStream = _icyurl;
		/* was playing: we stop, wait og stop is finished a try to start again */
		console.log('AAS status after start method = ' + STATUS[Ti.App.AudioStreamer.getStatus()]);
		if (Ti.App.AudioStreamer.getStatus() == PLAYING) {
			console.log('AAS: was playing => forced stopp');
			shouldStop = true;
			Ti.App.AudioStreamer.stop();
		} else {
			timeoutTimer = setTimeout(onTimeout, TIMEOUT);
			Ti.App.AudioStreamer.play(_icyurl);
		}
	}
};

exports.stop = function() {
	shouldStream = null;
	shoudStopp = true;
	Ti.App.AudioStreamer.stop();
};

exports.isPlaying = function() {
	return Ti.App.AudioStreamer.getStatus() == PLAYING ? true : false;
};
