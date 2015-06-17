var RecentsModule = require('controls/recents.adapter');

String.prototype.toHHMMSS = function() {
	var sec_num = parseInt(this, 10);
	// don't forget the second param
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);
	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	var time = (hours != '00') ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds;
	return time;
};

var Player = function() {
	this._player = Ti.Media.createAudioPlayer({
		allowBackground : true,
		volume : 1
	});
	var that = this;
	this._player.addEventListener('progress', function(_e) {
		console.log(_e.progress);
	//	that._progress.setValue(_e.progress / 1000);
	//	that._duration.setText(('' + _e.progress / 1000).toHHMMSS() + ' / ' + that.duration);
	//	that._Recents.setProgress(Math.round(_e.progress / 1000));
	});
	this._player.addEventListener('complete', function(_e) {
		Ti.API.error(_e.error);
		Ti.API.error('completed code = ' + _e.code);
		that._player.release();
		that._view.setVisible(false);
		that._Recents.setComplete();

	});
	this._player.addEventListener('change', function(_e) {
		Ti.API.error(_e.state + '    ' + _e.description);
		switch (_e.description) {
		case 'initialized':
			that._control.image = '/images/stop.png';
			Ti.Media.vibrate();
			break;
		case 'stopped':
			that._equalizer.opacity = 0;
			that._control.image = '/images/play.png';
			break;
		case 'stopping':
			that._equalizer.opacity = 0;
			that._control.image = '/images/leer.png';
			break;
		case 'starting':
			that._control.image = '/images/leer.png';
			break;
		case 'paused':
			that._equalizer.opacity = 0;
			that._control.image = '/images/play.png';
			break;
		case 'playing':
			that._equalizer.animate({
				opacity : 1,
				duration : 700
			});
			console.log('PLAYING');
			//that._control.setImage('/images/pause.png');
			break;
		}
	});
	return this;
};
Player.prototype = {
	createView : function(args) {
		this._view = Ti.UI.createView({
			visible : false
		});
		this._view.add(Ti.UI.createView({
			opacity : 0.5,
			touchEnabled : false,
			backgroundColor : (args.color) ? args.color : 'black'
		}));
		this._view.add(Ti.UI.createView({
			opacity : 0.5,
			touchEnabled : false,
			backgroundColor : 'black'
		}));
		this._container = Ti.UI.createView({
			bubbleParent : false,
			touchEnabled : false,
			height : 150,
			bottom : 0,
			backgroundColor : 'white'
		});
		this._view.add(this._container);
		this._progress = Ti.UI.createProgressBar({
			bottom : 20,
			left : 80,
			right : 10,
			height : 30,
			width : Ti.UI.FILL,
			min : 0,
			max : 100
		});
		this._duration = Ti.UI.createLabel({
			bottom : 5,
			bubbleParent : false,
			touchEnabled : false,
			font : {
				fontSize : 10
			},
			right : 10,
		});
		this._title = Ti.UI.createLabel({
			bottom : 70,
			bubbleParent : false,
			touchEnabled : false,
			color : '#555',
			height : 36,
			height : Ti.UI.SIZE,
			font : {
				fontSize : 18,
				fontWeight : 'bold',
				fontFamily : 'Aller Bold'
			},
			left : 10,
		});
		this._control = Ti.UI.createImageView({
			width : 50,
			height : 50,
			bubbleParent : false,
			left : 10,
			image : '/images/play.png',
			bottom : 15
		});
		this._equalizer = Ti.UI.createWebView({
			borderRadius : 1,
			width : 200,
			height : 33,
			bubbleParent : false,
			touchEnabled : false,
			scalesPageToFit : true,
			url : '/images/equalizer.gif',
			bottom : 30,
			left : 80,
			opacity : 0,
			enableZoomControls : false
		});
		this._view.add(this._progress);
		this._view.add(this._duration);
		this._view.add(this._title);
		this._view.add(this._control);

		var that = this;
		this._control.addEventListener('click', function() {
			if (that._player.isPlaying()) {
				that._player.pause();
			} else if (that._player.isPaused()) {
				that._player.play();
			}
		});
		this._view.addEventListener('click', function() {
			Ti.API.error('Info: background of player clicked');
			that.stopPlayer();
		});
		return this._view;
	},
	startPlayer : function(args) {
		if (Ti.Network.online != true) {
			Ti.UI.createNotification({
				message : 'Bitte Internetverbindung prüfen'
			}).show();
			this.stopPlayer();
			return;
		}
		this.duration = args.duration;
		this._Recents = new RecentsModule({
			url : args.url,
			title : args.title,
			duration : args.duration,
			sendung : args.sendung,
			author : args.author,
			image : args.image,
			station : args.station,
			pubdate : args.pubdate
		});
		Ti.App.fireEvent('app:stop');
		this._view.setVisible(true);
		this._progress.setMax(('' + args.duration).toHHMMSS());
		this._progress.setValue(0);
		this._player.setUrl(args.url + '?_=' + Math.random());
		var progress = this._Recents.getProgress() * 1000;
		console.log(progress);
		progress && Ti.UI.createNotification({
			duration : 2000,
			message : 'Setzte Wiedergabe am Zeitpunkt ' + ('' + progress).toHHMMSS() + ' fort.'
		}).show();
		this._player.setTime(progress);
		console.log('201');
		this._title.setText(args.title);
		console.log('203  ' + args.duration);
		//this._duration.setText(('' + args.duration).toHHMMSS());
		//this._view.add(this._equalizer);
		console.log('205');
		console.log('STARTPlayer');
		this._player.start();
	},
	stopPlayer : function(args) {
		if (this._player.isPlaying() || this._player.isPaused()) {
			Ti.API.error('Info: try 2 stop player - was playing or paused');
			this._player.stop();
			this._player.release();
		}
		this._view.setVisible(false);
	}
};

exports.createPlayer = function() {
	return new Player();
};
