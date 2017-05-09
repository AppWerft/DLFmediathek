'use strict';

var RecentsAdapter = require('controls/recents.adapter'),
    CacheAdapter = require('controls/cache.adapter'),
    Stations = require('model/stations'),
    playerViewModule = require('ui/audioplayer.widget'),
	VisualizerView = require('ti.audiovisualizerview'),
	TelephonyManager = require('com.goyya.telephonymanager'),
	timeout = null,
	TIMEOUT = 30000;

TelephonyManager.addEventListener('callState',function(_e){
	if (TelephonyManager.CALL_STATE_RINGING ==  _e.state && singletonPlayer.playing==true) singletonPlayer.pause();
});

var singletonPlayer = Ti.Media.createAudioPlayer({
	allowBackground : true,
	volume : 1.0
});
console.log("📻singletonPlayer created");
if (singletonPlayer.seek === undefined)
	singletonPlayer.seek = singletonPlayer.setTime;

var alertactive = false;

/* ********************************************************* */
var $ = function(options) {
	if (!options.station)
		options.station = Ti.App.Properties.getString('LAST_STATION');
	options.color = options.station  && Stations[options.station]? Stations[options.station].color : "#555";
	this.options = options;
	if (singletonPlayer && singletonPlayer.playing)
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
		if (_e.error) Ti.UI.createNotication({
			message : _e.error,
			duration : 3000
		}).show();
		console.log("📻onCompleteFn success=" + _e.success);
		console.log("📻onCompleteFn error=" + _e.error);
		console.log("📻onCompleteFn code=" + _e.code);
		var diff = Math.abs(_e.source.getDuration() - _e.source.getTime());
		if (diff<10*1000) {
			console.log("📻onCompleteFn diff=" + diff);
			if (that._view)
				that._view.setVisible(false);
			that._Recents.setComplete();
			that.onStatusChangeFn({
				description : 'stopped'
			});
		} else {
			that.startPlayer(_e.source.getTime());
		}

	};
	this.onStatusChangeFn = function(_e) {
		console.log("📻onStatusChangeFn Info: AudioPlayer sends >>>>>>" + _e.description);
		switch (_e.description) {
		case 'stopped':
		case "stopping":
			if (this.onProgressFn && typeof this.onProgressFn == 'function')
				singletonPlayer.removeEventListener('progress', this.onProgressFn);
			if (this.onCompleteFn && typeof this.onCompleteFn == 'function')
				singletonPlayer.removeEventListener('complete', this.onCompleteFn);
			if (this.onStatusChangeFn && typeof this.onStatusChangeFn == 'function')
				singletonPlayer.removeEventListener('change', this.onStatusChangeFn);
			that._view.mVisualizerView = null;	
			singletonPlayer && singletonPlayer.release();
			setTimeout(function() {
				that._view.control.image = '/images/play.png';
				if (that._window) {
					that._window.removeEventListener('close', that.stopPlayer);
					that._window.removeAllChildren();
					that._window.close({
						 activityEnterAnimation: Ti.Android.R.anim.fade_in,
    					 activityExitAnimation: Ti.Android.R.anim.fade_out
					});
				}
			},1500);
			
			break;
		case 'stopping':
			break;
		case 'starting':
			if (timeout) {
				clearTimeout(timeout);
				timeout=null;
			}
			setTimeout(function() {
				CacheAdapter.cacheURL(options);
			}, 3000);
			//that._view.control.image = '/images/leer.png';
			break;
		case 'paused':
			that._view.sendung.ellipsize = false;
			that._view.control.setImage('/images/play.png');
			that._view.slider.show();
			that._view.progress.hide();
			that._view.visualizerContainer.hide();
			that._view.slider.addEventListener('change', that.onSliderChangeFn);
			break;
		case 'playing':
			if (alertactive === true)
				return;
			that._view.slider.removeEventListener('change', that.onSliderChangeFn);
			that._view.progress.show();
			that._view.slider.hide();
			that._view.spinner.hide();
			//that._view.subtitle.ellipsize = Ti.UI.TEXT_ELLIPSIZE_TRUNCATE_MARQUEE;
			that._view.sendung.ellipsize = Ti.UI.TEXT_ELLIPSIZE_TRUNCATE_MARQUEE;
			that._view.visualizerContainer.show();
			that.setControlView();
			break;
		}
	};
	this.stopPlayer = function() {
		console.log("📻 stopPlayer");
		if (that._view.mVisualizerView) {
			this._view.mVisualizerView = null;
		}
		if (this._view){
			this._view.removeAllChildren();
			this._view == null;
		}
	//	singletonPlayer.seek(0);
		singletonPlayer.stop();
		singletonPlayer && singletonPlayer.release();
	//	if (!singletonPlayer.playing)  {
			that._window.close();
	//	}	
		singletonPlayer.removeEventListener('progress', this.onProgressFn);
		singletonPlayer.removeEventListener('complete', this.onCompleteFn);
		singletonPlayer.removeEventListener('change', this.onStatusChangeFn);
	};
	this.startPlayer = function(time) {
		if (!time) time =0;
		var that = this;
		this._view.setVisible(true);
		var maxRange = this.options.duration * 1000;
		this._view.progress.setMax(maxRange);
		this._view.slider.setMax(maxRange);
		this._view.progress.setValue(0);
		this._view.slider.setValue(0);
		this._view.sendung.setText(this.options.title);
		//this._view.title.setColor(this.options.color);
		this._view.title.setText(this.options.subtitle);
		this._view.description.setText(this.options.description?this.options.description:"");
		this._view.duration.setText(('' + this.options.duration * 1000).toHHMMSS());
		singletonPlayer && singletonPlayer.release();
		singletonPlayer.seek(time);
		var item = CacheAdapter.getURL({
			station : this.options.station,
			url : this.options.url
		});
		console.log("📻" + JSON.stringify(item));

		if (item.cached || Ti.Network.online)  {
			singletonPlayer.setUrl(item.url);
			singletonPlayer.start();
			timeout = setTimeout(that.stopPlayer,TIMEOUT);
			return; 
		}   
		Ti.UI.createNotification({
			message : "Der Beitrag ist noch nicht nicht heruntergeladen und ich sehe Probleme mit dem Internet"
		}).show();
		this.stopPlayer(); 
	};
	this.createWindow = function() {
		if (!Ti.Network.online && !CacheAdapter.isCached(this.options)) {
			return false;
		}
		this._window = Ti.UI.createWindow({
			backgroundColor : 'transparent',
			theme : 'Theme.NoActionBar',
			//orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT],
			fullscreen : true
		});
		var that = this;
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

		this._window.addEventListener('open', function() {
			require('vendor/permissions').requestPermissions(['RECORD_AUDIO'], function(_success) {
				if (_success !== true)
					return;
				that._view.hifi.addEventListener('click',function(){
					require("ui/hifi/main.dialog")(true);
				});	
				that._view.mVisualizerView = VisualizerView.createView({
					audioSessionId : 0,
					touchEnabled : false,
					zIndex : 1,
					lifecycleContainer : that._window,
					height : Ti.UI.FILL,
					width : Ti.UI.FILL
				});
				that._view.visualizerContainer.add(that._view.mVisualizerView);
				setTimeout(function() {
					if (that._view.mVisualizerView)
						that._view.mVisualizerView.addBarGraphRenderer({
							color : options.color,
							width : 60.0*Ti.Platform.displayCaps.logicalDensityFactor,
							divisions:16 
						});
				}, 1000);
				setTimeout(function() {
					if (that._view.mVisualizerView)
						that._view.mVisualizerView.addLineRenderer();

				}, 2500);
				that.startPlayer();
			});
		});
		this._window.open();
		return true;
	};

	/* here begins the real code */

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
	if (this.createWindow()) {
		console.log("📻createWindow");
		var that = this;
		if (CacheAdapter.isCached(this.options) && !this._Recents.isComplete(this.options.url)) {
			console.log('📻 is cached and not complete ==> try to continue');
			alertactive = true;
			var dialog = Ti.UI.createAlertDialog({
				cancel : 1,
				buttonNames : ['Neustart', 'Weiter'],
				message : 'Das Stück wurde unterbrochen, was soll jetzt geschehen?',
				title : 'Weiterhören'
			});
			console.log("📻alert with question created");
			dialog.addEventListener('click', function(e) {
				console.log("📻reaction on alert");
				alertactive = false;
				that.startPlayer();
				if (e.index != 0) {
					singletonPlayer.playing && singletonPlayer.seek(that.progress);
					that.progress && Ti.UI.createNotification({
						duration : 2000,
						message : 'Setzte Wiedergabe am Zeitpunkt „' + ('' + that.progress).toHHMMSS() + '“ fort.'
					}).show();
					return;
				} else console.log("📻Cancel in alert");
			});
			dialog.show();
		}
		console.log("📻adding events to Player");
		singletonPlayer.addEventListener('progress', this.onProgressFn);
		singletonPlayer.addEventListener('complete', this.onCompleteFn);
		singletonPlayer.addEventListener('change', this.onStatusChangeFn);
		this._window.addEventListener("android:back", function() {
			that._view.control.fireEvent('longpress', {});
			return false;
		});
	}
	return this._view;
};
exports.createAndStartPlayer = function(options) {
	return new $(options);
};
