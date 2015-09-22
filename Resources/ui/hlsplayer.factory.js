var RecentsModule = require('controls/recents.adapter');

var playerViewModule = require('ui/player.widget');

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

var AudioPlayer = function(options) {
	this.options = options;
	this._Recents = new RecentsModule({
		url : this.options.url,
		title : this.options.title,
		subtitle : this.options.subtitle,
		duration : this.options.duration,
		author : this.options.author,
		image : '/images/' + this.options.station + '.png',
		station : this.options.station,
		pubdate : this.options.pubdate
	});
	this.progress = this._Recents.getProgress(this.options.url);
	this.createView();
	var that = this;
	this.createPlayerFunc = function() {
		that._player = Ti.Media.createAudioPlayer({
			allowBackground : true,
			volume : 1
		});
		that._player.addEventListener('progress', function(_e) {
			that._view.progress.setValue(_e.progress / 1000);
			that._view.duration.setText(('' + _e.progress / 1000).toHHMMSS() + ' / ' + ('' + that.options.duration).toHHMMSS());
			that._Recents.setProgress({
				progress : _e.progress,
				url : that.options.url
			});
		});
		that._player.addEventListener('complete', function(_e) {
			if (that._view)
				that._view.setVisible(false);
			that._Recents.setComplete();
		});
		that._player.addEventListener('change', function(_e) {
			Ti.API.error(_e.state + '    ' + _e.description);
			switch (_e.description) {
			case 'initialized':
				that._view.control.image = '/images/stop.png';
				Ti.Media.vibrate();
				break;
			case 'stopped':
				that._view.remove(that._view.equalizer);
				that._view.equalizer.opacity = 0;
				that._view.control.image = '/images/play.png';
				break;
			case 'stopping':
				that._view.equalizer.opacity = 0;
				if (that._interval)
					clearInterval(that._interval, 1000);
				that._view.control.image = '/images/play.png';
				that._player.release();
				that._view.hide();
				break;
			case 'starting':
				that._view.control.image = '/images/leer.png';
				break;
			case 'paused':
				that._view.subtitle.ellipsize = false;
				that._view.equalizer.opacity = 0;
				that._view.control.image = '/images/play.png';
				break;
			case 'playing':
				if (that.progress > 10) {
					var dialog = Ti.UI.createAlertDialog({
						cancel : 1,
						buttonNames : ['Neustart', 'Weiter'],
						message : 'Das Stück wurde unterbrochen, was soll jetzt geschehen?',
						title : 'Weiter hören'
					});
					dialog.addEventListener('click', function(e) {
						if (e.index != 0) {
							that._player.playing && that._player.setTime(that.progress * 1000);
							that.progress && Ti.UI.createNotification({
								duration : 2000,
								message : 'Setzte Wiedergabe am Zeitpunkt „' + ('' + that.progress).toHHMMSS() + '“ fort.'
							}).show();
							return;
						}
					});
					dialog.show();
				} else {
				}
				that._view.subtitle.ellipsize = Ti.UI.TEXT_ELLIPSIZE_TRUNCATE_MARQUEE;

				that._view.equalizer.animate({
					opacity : 1,
					duration : 700
				});
				that._view.control.image = '/images/pause.png';
				break;
			}
		});
		that.startPlayer();
	};
	setTimeout(this.createPlayerFunc, 50);
	return this._view;
};

AudioPlayer.prototype = {
	createView : function() {
		this.color = (this.options.color) ? this.options.color : 'black';
		this._view = playerViewModule.getView();
		var that = this;
		/*this._control.addEventListener('click', function() {
		 if (that._player.isPlaying()) {
		 that._player.pause();
		 } else if (that._player.isPaused()) {
		 that._player.play();
		 }
		 });*/
		this._view.addEventListener('click', function() {
			Ti.API.error('Info: background of player clicked');
			that.stopPlayer();
		});
		return this._view;
	},
	startPlayer : function() {
		if (Ti.Network.online != true) {
			Ti.UI.createNotification({
				message : 'Bitte Internetverbindung prüfen.\nAuch auch lizenzrechtlichen Gründen dürfen Mediathekstücke nicht offline gemacht werden.'
			}).show();
			this.stopPlayer();
			return;
		}
		Ti.App.fireEvent('app:stop');
		this._view.setVisible(true);
		var that = this;
		this._view.container.animate({
			bottom : -90
		}, function() {
			that._view.container.animate({
				bottom : -100,
				duration : 10
			});
		});
		this._view.progress.setMax(this.options.duration);
		this._view.progress.setValue(0);
		this._view.title.setText(this.options.title);
		this._view.subtitle.setText(this.options.subtitle);
		this._view.duration.setText(('' + this.options.duration).toHHMMSS());
		this._view.add(this._view.equalizer);
		this._player.setUrl(this.options.url + '?_=' + Math.random());
		that._player.start();
	},
	stopPlayer : function() {
		if (this._player.isPlaying() || this._player.isPaused()) {
			Ti.API.error('Info: try 2 stop player - was playing or paused');
			this._player.stop();
			this._player.release();
			Ti.API.error('Info: stopped and released');
		}

		if (this._view && this._view.oncomplete && typeof this._view.oncomplete == 'function') {
			this._view.oncomplete();
		}
	}
};

exports.createAndStartPlayer = function(options) {
	return new AudioPlayer(options);
};
