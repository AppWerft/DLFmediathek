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
		that._progress.setValue(_e.progress / 1000);
		that._duration.setText(('' + _e.progress / 1000).toHHMMSS() + ' / ' + ('' + that.duration).toHHMMSS());
		that._Recents.setProgress(Math.round(_e.progress / 1000), that._player.url);
	});
	this._player.addEventListener('complete', function(_e) {
		Ti.API.error(_e.error);
		Ti.API.error('completed code = ' + _e.code);
		that._player.release();
		that._view.setVisible(false);
	});

	this._player.addEventListener('complete', function(_e) {
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
			that._player.release();
			//that._player = null;
			that._view.hide();
			break;
		case 'starting':
			//
			that._control.image = '/images/leer.png';
			break;
		case 'paused':
			that._subtitle.ellipsize = false;
			that._equalizer.opacity = 0;
			that._control.image = '/images/play.png';
			break;
		case 'playing':
			that._subtitle.ellipsize = Ti.UI.TEXT_ELLIPSIZE_TRUNCATE_MARQUEE;
			that._spinner.hide();
			that.progress = that._Recents.getProgress(that.url);
			Ti.API.error('progress=' + that.progress);
			that._player.setTime(that.progress * 1000);
			that._equalizer.animate({
				opacity : 1,
				duration : 700
			});
			that._control.image = '/images/pause.png';
			that.progress && Ti.UI.createNotification({
				duration : 2000,
				message : 'Setzte Wiedergabe am Zeitpunkt „' + ('' + that.progress).toHHMMSS() + '“ fort.'
			}).show();
			break;
		}
	});
	return this;
};
Player.prototype = {
	createView : function(args) {
		this.color = (args.color) ? args.color : 'black', this._view = Ti.UI.createView({
			visible : false
		});
		this._view.add(Ti.UI.createView({
			opacity : 0.5,
			touchEnabled : false,
			backgroundColor : this.color
		}));
		this._view.add(Ti.UI.createView({
			opacity : 0.5,
			touchEnabled : false,
			backgroundColor : 'black'
		}));
		this._container = Ti.UI.createView({
			bubbleParent : false,
			touchEnabled : false,
			height : 230,
			bottom : -230,
			backgroundColor : 'white'
		});
		this._view.add(this._container);
		this._progress = Ti.UI.createProgressBar({
			bottom : 120,
			left : 80,
			right : 10,
			height : 30,
			width : Ti.UI.FILL,
			min : 0,
			max : 100
		});
		this._duration = Ti.UI.createLabel({
			bottom : 102,
			bubbleParent : false,
			touchEnabled : false,
			font : {
				fontSize : 12
			},
			color : this.color,
			right : 10,
		});
		this._title = Ti.UI.createLabel({
			top : 10,
			bubbleParent : false,
			touchEnabled : false,
			color : this.color,
			height : 32,
			height : Ti.UI.SIZE,
			font : {
				fontSize : 20,
				fontWeight : 'bold',
				fontFamily : 'Aller Bold'
			},
			left : 10,
		});
		this._subtitle = Ti.UI.createLabel({
			top : 40,
			bubbleParent : false,
			touchEnabled : false,
			color : '#555',
			horizontalWrap : false,
			wordWrap : false,
			width : Ti.UI.FILL,
			ellipsize : true,
			height : 20,
			font : {
				fontSize : 16,
				fontFamily : 'Aller Bold'
			},
			left : 10,
			right : 15
		});
		this._control = Ti.UI.createImageView({
			width : 50,
			height : 50,
			bubbleParent : false,
			left : 10,
			image : '/images/play.png',
			bottom : 115
		});
		this._spinner = Ti.UI.createActivityIndicator({
			style : Ti.UI.ActivityIndicatorStyle.BIG,
			bottom : 102,
			left : -3,
			transform : Ti.UI.create2DMatrix({
				scale : 0.8
			}),
			height : Ti.UI.SIZE,
			width : Ti.UI.SIZE
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
		this._container.add(this._progress);
		this._container.add(this._duration);
		this._container.add(this._title);
		this._container.add(this._subtitle);
		this._container.add(this._control);
		this._container.add(this._spinner);

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
		this.url = args.url;
		this.duration = args.duration;
		this._Recents = new RecentsModule({
			url : args.url,
			title : args.title,
			duration : args.duration,
			author : args.author,
			sendung : args.sendung,
			image : '/images/' + args.station + '.png',
			station : args.station,
			pubdate : args.pubdate
		});
		//		//	args.duration && (this.duration = (''+args.duration).toHHMMSS());
		Ti.App.fireEvent('app:stop');
		this._view.setVisible(true);
		var that = this;
		this._container.animate({
			bottom : -90
		}, function() {
			that._container.animate({
				bottom : -100,
				duration : 10
			});
		});
		this._spinner.show();
		this._progress.setMax(args.duration);
		this._progress.setValue(0);
		this._player.setUrl(this.url + '?_=' + Math.random());
		this._title.setText(args.title);
		this._subtitle.setText(args.subtitle);
		this._duration.setText(('' + args.duration).toHHMMSS());
		this._view.add(this._equalizer);

		that._player.start();
	},
	stopPlayer : function(args) {
		if (this._player.isPlaying() || this._player.isPaused()) {
			Ti.API.error('Info: try 2 stop player - was playing or paused');
			this._player.stop();
			this._player.release();
		}
		
	}
};

exports.createPlayer = function() {
	return new Player();
};
