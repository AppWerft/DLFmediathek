var RecentsAdapter = require('controls/recents.adapter'),
    CacheAdapter = require('controls/cache.adapter'),
    playerViewModule = require('ui/audioplayer.widget');

var singletonPlayer = require('com.kcwdev.audio').createAudioPlayer({
	allowBackground : true,
	volume : 1
});

var alertactive = false;
/* ********************************************************* */
var $ = function(options) {
	if (singletonPlayer.playing)
		singletonPlayer.release();
	this.setControlView = function() {
		if (CacheAdapter.isCached(this.options)) {
			that._view.control.setImage('/images/pause.png');
		} else {
			var sec = Math.round((new Date().getTime() / 1000));
			that._view.control.setImage(sec % 2 ? '/images/cache.png' : '/images/cache_.png');
		}

	};
	this.onSliderChangeFn = function(_e) {
		that._view.progress.setValue(_e.value);
		that._view.duration.setText(('' + _e.value).toHHMMSS() + ' / ' + ('' + that.options.duration * 1000).toHHMMSS());
	};
	this.onProgressFn = function(_e) {
		that._view.progress.setValue(_e.progress);
		that._view.slider.setValue(_e.progress);
		that._view.duration.setText(('' + _e.progress ).toHHMMSS() + ' / ' + ('' + that.options.duration * 1000).toHHMMSS());
		/* saving to model */
		that._Recents.setProgress({
			progress : _e.progress / 1000,
			url : that.options.url
		});
		// updating ControlView
		that.setControlView();
	};
	this.onCompleteFn = function(_e) {
		if (that._view)
			that._view.setVisible(false);
		that._Recents.setComplete();
		that.onStatusChangeFn({
			description : 'stopped'
		});

	};
	this.onStatusChangeFn = function(_e) {
		switch (_e.description) {
		case 'stopped':
			if (this.onProgressFn && typeof this.onProgressFn == 'function')
				singletonPlayer.removeEventListener('progress', this.onProgressFn);
			if (this.onCompleteFn && typeof this.onCompleteFn == 'function')
				singletonPlayer.removeEventListener('complete', this.onCompleteFn);
			if (this.onStatusChangeFn && typeof this.onStatusChangeFn == 'function')
				singletonPlayer.removeEventListener('change', this.onStatusChangeFn);
			that._view.remove(that._view.equalizer);
			that._view.equalizer.opacity = 0;
			that._view.control.image = '/images/play.png';
			if (that._window) {
				that._window.removeEventListener('close', that.stopPlayer);
				that._window.removeAllChildren();
				that._window.close();
			}
			break;
		case 'stopping':
			break;
		case 'starting':
			setTimeout(function() {
				CacheAdapter.cacheURL(options);
			}, 5000);
			//that._view.control.image = '/images/leer.png';
			break;
		case 'paused':
			that._view.subtitle.ellipsize = false;
			that._view.equalizer.hide();
			that._view.equalizer.setOpacity(0);
			that._view.control.setImage('/images/play.png');
			that._view.slider.show();
			that._view.progress.hide();
			that._view.slider.addEventListener('change', that.onSliderChangeFn);
			break;
		case 'playing':
			if (alertactive === true)
				return;
			that._view.slider.removeEventListener('change', that.onSliderChangeFn);
			that._view.progress.show();
			that._view.slider.hide();
			that._view.spinner.hide();
			that._view.subtitle.ellipsize = Ti.UI.TEXT_ELLIPSIZE_TRUNCATE_MARQUEE;
			that._view.title.ellipsize = Ti.UI.TEXT_ELLIPSIZE_TRUNCATE_MARQUEE;
			that._view.equalizer.show();
			that._view.equalizer.animate({
				opacity : 1,
				duration : 1000
			});
			that.setControlView();
			break;
		}
	};
	this.stopPlayer = function() {
		singletonPlayer.seek(0);
		singletonPlayer.stop();
		singletonPlayer.release();

	};
	this.startPlayer = function() {
		var that = this;
		var url = CacheAdapter.getURL(this.options);
		this._view.setVisible(true);
		this._view.container.animate({
			bottom : -90
		}, function() {
			that._view.container.animate({
				bottom : -100,
				duration : 10
			});
		});
		var maxRange = this.options.duration * 1000;
		this._view.progress.setMax(maxRange);
		this._view.slider.setMax(maxRange);
		this._view.progress.setValue(0);
		this._view.slider.setValue(0);
		this._view.title.setText(this.options.title);
		this._view.title.setColor(this.options.color);
		this._view.subtitle.setText(this.options.subtitle);
		this._view.duration.setText(('' + this.options.duration * 1000).toHHMMSS());
		this._view.add(this._view.equalizer);
		singletonPlayer.seek(0);
		singletonPlayer.setUrl(url.url);
		singletonPlayer.start();
	};
	this.createWindow = function() {
		this.color = (this.options.color) ? this.options.color : 'black';
		this._window = Ti.UI.createWindow({
			backgroundColor : 'transparent',
			theme : 'Theme.NoActionBar',
			fullscreen : true
		});
		var that = this;
		setTimeout(function() {
			that._view = playerViewModule.getView(that.options);
			that._window.add(that._view);
			that._view.control.addEventListener('longpress', function() {
				that.stopPlayer();
			});
			that._view.control.addEventListener('singletap', function() {
				if (CacheAdapter.isCached(that.options)) {
					if (singletonPlayer.playing)
						singletonPlayer.pause();
					else {
						that.progress = that._view.slider.getValue();
						singletonPlayer.seek(that.progress);
						singletonPlayer.play();
					}
				}
			});
			that.startPlayer();
		}, 700);
		this._window.open();
		};
	this.options = options;
	this._Recents = new RecentsAdapter({
		url : this.options.url,
		title : this.options.title,
		subtitle : this.options.subtitle,
		duration : this.options.duration,
		author : this.options.author,
		image : '/images/' + this.options.station + '.png',
		station : this.options.station,
		pubdate : this.options.pubdate
	});
	this.progress = this._Recents.getProgress(this.options.url) * 1000;
	this.createWindow();
	var that = this;

	if (CacheAdapter.isCached(this.options) && !this._Recents.isComplete(this.options.url)) {
		alertactive = true;
		var dialog = Ti.UI.createAlertDialog({
			cancel : 1,
			buttonNames : ['Neustart', 'Weiter'],
			message : 'Das Stück wurde unterbrochen, was soll jetzt geschehen?',
			title : 'Weiterhören'
		});
		dialog.addEventListener('click', function(e) {
			alertactive = false;
			that.startPlayer();
			if (e.index != 0) {
				singletonPlayer.playing && singletonPlayer.seek(that.progress);
				that.progress && Ti.UI.createNotification({
					duration : 2000,
					message : 'Setzte Wiedergabe am Zeitpunkt „' + ('' + that.progress).toHHMMSS() + '“ fort.'
				}).show();
				return;
			}
		});    
		dialog.show();
	}
	singletonPlayer.addEventListener('progress', this.onProgressFn);
	singletonPlayer.addEventListener('complete', this.onCompleteFn);
	singletonPlayer.addEventListener('change', this.onStatusChangeFn);
	this._window.addEventListener("android:back", function() {
		return false;
	});
	return this._view;
};
exports.createAndStartPlayer = function(options) {
	return new $(options);
};
