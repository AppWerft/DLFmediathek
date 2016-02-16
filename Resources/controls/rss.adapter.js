var Moment = require('vendor/moment'),
    XMLTools = require('vendor/XMLTools'),
    Model = require('model/stations');
Moment.locale('de   ');

var toType = function(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

var Module = function() {
	this.eventhandlers = {};
	this.dayplan = {};
	var that = this;
	Ti.App.addEventListener('daychanged', function() {
		var station = Ti.App.Properties.getString('LAST_STATION', 'dlf');
		var KEY = "CACHEDPLAN_DAYSTAMP_" + station;
		var today = Moment().format('YYYYMMDD');

		var lastday = Ti.App.Properties.getString(KEY, '');
		if (lastday != today) {
			Ti.UI.createNotification({
				message : 'Sendeplan wird neu geholt.'
			}).show();
			Ti.App.Properties.setString(KEY, today);
			//['dlf', 'drk'].forEach(function(station) {
			var url = Model[station].dayplan + '?YYYYMMDD=' + Moment().format('YYYYMMDD');
			//Ti.App.Properties.removeProperty(KEY);
			//});

		var key = 'LASTPLANDAY_' + Ti.App.Properties.getString('LAST_STATION', 'dlf');
		var lastday = Ti.App.Properties.getString(key, '');
		//	console.log(lastday +' ======= ' + today + '  '  + key);
		if (lastday != today && (Ti.App.Properties.getString('LAST_STATION', 'dlf') != 'drw')) {
			Ti.UI.createNotification({
				message : 'Sendeplan wird neu geholt.'
			}).show();
			//Ti.App.Properties.setString('LASTDAY', today);
			['dlf', 'drk'].forEach(function(station) {
				var url = Model[station].dayplan + '?YYYYMMDD=' + Moment().format('YYYYMMDD');
				Ti.App.Properties.removeProperty("DAYPLAN#" + station);
			});

		}
	});
	return this;
};

Module.prototype = {
	_sanitizeHTML : function(foo) {
		var bar = ( typeof foo == 'string')//
		? foo.replace(/[\s]+<p>[\s]+/gm, '').replace(/[\s]+<\/p>[\s]+/gm, '').replace(/[\n]+/gm, '<br/>⊃ ') : undefined;
		if (bar != undefined) {
			bar = bar.replace('⊃ Moderation', 'Moderation');
			bar = bar.replace('⊃ Von', 'von ');
			bar = bar.replace('⊃ Am Mikrofon', 'am Mikrofon');
		}
		return bar;
	},
	_updateTimestamps : function(_args) {
		var url = Model[_args.station].dayplan + '?YYYYMMDD=' + Moment().format('YYYYMMDD');
		if (Ti.App.Properties.hasProperty("CACHEDPLAN_" + _args.station)) {
			var items = JSON.parse(Ti.App.Properties.getString("CACHEDPLAN_" + _args.station));
			var length = items.length;
			var ndx = 0;
			for ( i = 0; i < length; i++) {
				var item = items[i];
				if (i == 0) {
					item.endtime = Moment(items[1].pubDate);
					item.duration = items[0].endtime.diff(Moment().startOf('day')) / 1000;
				} else if (i != length - 1) {
					item.endtime = Moment(items[i + 1].pubDate);
					item.duration = item.endtime.diff(Moment(item.pubDate)) / 1000;
				} else {
					item.endtime = Moment().startOf('day').add(1, 'day');
					item.duration = item.endtime.diff(Moment(item.pubDate)) / 1000;
				}
				item.progress = Moment().diff(Moment(item.pubDate)) / item.duration / 1000;
				item.duration_mmss = (item.duration > 3600)//
				? Moment.unix(item.duration).format('H:mm:ss')//
				: Moment.unix(item.duration).format('m:ss');
				item.description = this._sanitizeHTML(item.description);
				item.isonair = (Moment().isBetween(item.pubDate, item.endtime)) ? true : false;
				item.ispast = (Moment().isBefore(item.endtime)) ? false : true;
				if (!item.endtime.isAfter(Moment()))
					ndx++;
			}
			return items;
		} else
			return [];
	},
	getCurrentOnAir : function(_args) {
		if (_args.station != Ti.App.Properties.getString('LAST_STATION'))
			return;
		this.getRSS(_args);
		// test if new one (daychange)
		var currentonair = null;
		var items = this._updateTimestamps(_args);
		items.forEach(function(item) {
			if (item.isonair == true)
				currentonair = item;
		});
		// test if right day:
		return currentonair;
	},
	syncAll : function() {

	},
	getRSS : function(_args) {
		var that = this;
		var CACHE = "CACHEDPLAN_" + _args.station;
		if (Ti.App.Properties.hasProperty(CACHE)) {
			/* first testing if cache contents an array and has a node with timestamp */
			var items = JSON.parse(Ti.App.Properties.getString(CACHE));
			if (!Array.isArray(items) || !items[0].guid || !items[0].guid.text) {
				Ti.App.Properties.removeProperty(CACHE);
				return;
			}
			/* test if in CACHE items with current date */
			var date = items[0].guid.text.replace('schema-', '').replace('-00:00+0100', '');
			if (date !== Moment().format('YYYY-MM-DD')) {
				Ti.App.Properties.removeProperty(CACHE);
				console.log('Warning: CACHE invalide');
				console.log('Warning: we kill old ' + CACHE);
			//	
			} 
		}
		/*if (Ti.App.Properties.hasProperty(CACHE)) {
			_args.done && _args.done({
				ok : true,
				items : that._updateTimestamps({
					station : _args.station
				})
			});
			return;
		}*/
		if (!Ti.App.Properties.hasProperty(CACHE)) {
			var url = Model[_args.station].dayplan + '?YYYYMMDD=' + Moment().format('YYYYMMDD');
			if (Model[_args.station].dayplan) {
				var xhr = Ti.Network.createHTTPClient({
					onload : function() {
						var channel = new XMLTools(this.responseXML).toObject().channel;
						if (channel.item && !Array.isArray(channel.item)) {
							channel.item = [channel.item];
						}
						/* save dayplan in property */
						Ti.App.Properties.setString(CACHE, JSON.stringify(channel.item));
						/* save current daystamp */
						Ti.App.Properties.setString('CACHEDPLAN_DAYSTAMP_' + _args.station, Moment().format('YYYYMMDD'));
						/* build result */
						var result = {
							ok : true,
							items : that._updateTimestamps({
								station : _args.station
							})
						};
						//
						// back to caller
						_args.done && _args.done(result);
						// persist
						try {
							if (that.dayplan && that.dayplan.isIndexOf(url) == -1) {
								that.dayplan.push({
									url : url,
									current : null
								});
							}
						} catch(E) {
						}
					}
				});
				xhr.open('GET', url);
				xhr.send();
			}
		}
	}, // standard methods for event/observer pattern
	fireEvent : function(_event, _payload) {
		if (this.eventhandlers[_event]) {
			for (var i = 0; i < this.eventhandlers[_event].length; i++) {
				this.eventhandlers[_event][i].call(this, _payload);
			}
		}
	},
	addEventListener : function(_event, _callback) {
		if (!this.eventhandlers[_event])
			this.eventhandlers[_event] = [];
		this.eventhandlers[_event].push(_callback);
	},
	removeEventListener : function(_event, _callback) {
		if (!this.eventhandlers[_event])
			return;
		var newArray = this.eventhandlers[_event].filter(function(element) {
			return element != _callback;
		});
		this.eventhandlers[_event] = newArray;
	}
};

module.exports = Module;
