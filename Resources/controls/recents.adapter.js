var Moment = require('vendor/moment');
var Model = require('model/stations');

const DB = Ti.App.Properties.getString('DATABASE');
var link = Ti.Database.open(DB);

//link.execute('DROP  TABLE IF EXISTS "recents"');
link.execute('CREATE TABLE IF NOT EXISTS "recents" ("url" TEXT UNIQUE, "image" TEXT,"station" TEXT, "title" TEXT,"sendung" TEXT, "duration" NUMBER, "progress" NUMBER, "lastaccess" DATETIME,"pubdate" DATETIME, "author" TEXT)');
link.execute('CREATE INDEX IF NOT EXISTS urlindex ON recents (url)');

link.close();

var $ = function() {
	var args = arguments[0] || {};
	if (args.url && args.pubdate) {
		this.url = args.url;
		args.progress = this.getProgress(this.url);
		var link = Ti.Database.open(DB);
		link.execute('INSERT OR REPLACE INTO recents VALUES (?,?,?,?,?,?,?,?,?,?)', //
		this.url, //
		args.image, //
		args.station, //
		args.subtitle, //
		args.title, //
		args.duration, //
		args.progress || 0, //
		Moment().toISOString(), // lastaccess
		Moment(args.pubdate).toISOString(), // pubdate
		args.author);
		link.close();
	}
	return this;
};

$.prototype = {
	setProgress : function(_args) {
		var link = Ti.Database.open(DB);
		link.execute('UPDATE recents SET progress=?,lastaccess=? WHERE url=?', //
		Math.floor(_args.progress), //
		Moment().toISOString(), //
		_args.url || this.url);
		link.close();
	},
	setComplete : function(_progress) {
		var link = Ti.Database.open(DB);
		//link.execute('UPDATE recents SET progress=duration,lastaccess=? WHERE url =?', Moment().toISOString(), this.url);
		link.close();
	},

	removeRecent : function(url) {
		var link = Ti.Database.open(DB);
		link.execute('DELETE FROM recents WHERE url=?', url);
		link.close();
	},
	getAllRecents : function() {
		var link = Ti.Database.open(DB);
		var recents = [];
		var sql = 'SELECT * FROM recents WHERE progress <= duration ORDER BY DATETIME(lastaccess) DESC LIMIT 100';
		var res = link.execute(sql);
		while (res.isValidRow()) {
			var station = res.getFieldByName('station');
			var item = {
				url : res.getFieldByName('url'),
				image : '/images/' + station + '.png',
				station : station,
				title : res.getFieldByName('sendung'),
				subtitle : res.getFieldByName('title'),
				duration : res.getFieldByName('duration'),
				progress : res.getFieldByName('progress') / res.getFieldByName('duration'),
				lastaccess : res.getFieldByName('lastaccess'),
				pubdate : res.getFieldByName('pubdate'),
				author : res.getFieldByName('author'),
				color : (station ) ? Model[station].color : 'gray'
			};
			recents.push(item);
			res.next();
		}

		res.close();
		link.close();
		return recents;
	},
	isComplete : function(_url) {
		var link = Ti.Database.open(DB);
		var res = link.execute('SELECT progress/duration AS ratio FROM recents  WHERE url=?', this.url || _url);
		var ratio = 0.0;
		if (res.isValidRow()) {
			ratio = res.getFieldByName('ratio');
			res.close();
		}
		link.close();
		return ratio > 0.99 ? true : false;
	},
	getProgress : function(_url) {
		if (_url) {
			var link = Ti.Database.open(DB);
			var res = link.execute('SELECT progress FROM recents  WHERE url=?', this.url || _url);
			var progress = 0;
			if (res.isValidRow()) {
				progress = res.getFieldByName('progress');
				res.close();
			}
			link.close();
			return progress;
		}
		return 0;
	},
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

module.exports = $;
