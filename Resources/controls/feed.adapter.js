var Moment = require('vendor/moment'),
    XMLTools = require('vendor/XMLTools');

const DB = Ti.App.Properties.getString('DATABASE');

var toType = function(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

var Module = function() {
	this.eventhandlers = {};
	var link = Ti.Database.open(DB);
	if (link) {
		link.execute('CREATE TABLE IF NOT EXISTS "feeds" ("url" TEXT UNIQUE, "http_expires" DATETIME, "http_lastmodified" DATETIME, "http_etag" TEXT, "http_contentlength" INTEGER, "title" TEXT, "description" TEXT, "category" TEXT,"station" TEXT, "pubDate" DATETIME, "lastBuildDate" DATETIME, "image" TEXT,"faved" INTEGER);');
		link.execute('CREATE TABLE IF NOT EXISTS "items" ("channelurl" TEXT, "title" TEXT NOT NULL , "link" TEXT, "description" TEXT, "guid" TEXT UNIQUE , "enclosure_url" TEXT, "enclosure_length" TEXT, "enclosure_type" TEXT, "author" TEXT, "duration" TEXT, "pubDate" DATETIME, "watched" INTEGER);');
		link.execute('CREATE INDEX IF NOT EXISTS "feedurlindex" ON "feeds" (url)');
		link.execute('CREATE INDEX IF NOT EXISTS "itemsurlindex" ON "items" (channelurl)');
		link.close();
	}
	return this;
};

Module.prototype = {
	/* will called from UI and calls background service */
	triggerPodcastDownload : function(_args) {
		require('bencoding.alarmmanager').createAlarmManager().addAlarmService({
			service : 'de.appwerft.dlrmediathek.DownloaderService',
			second : 10,
			parameter : {
				url : _args.url
			}
		});
	},
	mirrorAllFeeds : function(_args) {
		var that = this;
		var total = 0;
		var stations = ['dlf', 'drk', 'drw'];
		var ndx = 0;
		function loadfeeds() {
			var station = stations[ndx];
			var feeds = require('model/' + station);
			function loadfeed() {
				var feed = feeds.shift();
				if (feed) {
					total++;
					that.loadFeed({
						url : feed.href,
						station : station,
						done : loadfeed
					});
				} else {
					ndx++;
					if (ndx < stations.length) {
						loadfeeds();
					} else {
						_args.done && _args.done({
							total : total
						});
					}
				}
			}

			loadfeed();
		}

		loadfeeds();
	},

	getAllFavedFeeds : function() {
		var link = Ti.Database.open(DB);
		var res = link.execute('SELECT feeds.*, (SELECT MAX(DATE(pubDate)) FROM items WHERE feeds.url=items.channelurl) AS lastpubdate, (SELECT COUNT(*) FROM items WHERE feeds.url=items.channelurl) AS total FROM feeds WHERE feeds.faved=1 ORDER BY lastpubdate DESC');
		var feeds = [];
		while (res.isValidRow()) {
			feeds.push({
				description : res.getFieldByName('description'),
				title : res.getFieldByName('title'),
				image : res.getFieldByName('image'),
				lastpubdate : res.getFieldByName('lastpubdate'),
				total : res.getFieldByName('total'),
				url : res.getFieldByName('url')
			});
			res.next();
		}
		res.close();
		link.close();
		return feeds;
	},
	toggleFaved : function(_url) {
		var link = Ti.Database.open(DB);
		link.execute('UPDATE feeds SET faved=? where url=?', (this.isFaved(_url)) ? 0 : 1, _url);
		link.close();
	},
	addFeed : function() {
	},
	isFaved : function(_url) {
		var link = Ti.Database.open(DB);
		var faved;
		var res = link.execute('SELECT faved FROM feeds WHERE url=?', _url);
		if (res.isValidRow()) {
			faved = (res.fieldByName('faved')) ? true : false;
		}
		res.close();
		link.close();
		return faved;
	},
	// get feed with all items
	getFeed : function(_args) {
		var link = Ti.Database.open(DB);
		var rows = link.execute('SELECT items.* ,'//
		+ '(SELECT title FROM feeds WHERE feeds.url=items.channelurl) AS podcast,'//
		+ '(SELECT image FROM feeds WHERE feeds.url=items.channelurl) AS channelimage,'//
		+ '(SELECT station FROM feeds WHERE feeds.url=items.channelurl) AS station FROM items '//
		+ ' WHERE items.channelurl=? ORDER BY items.pubDate DESC', _args.url);
		var items = [];
		if (rows.getRowCount() > 0) {
			while (rows.isValidRow()) {
				var parts = rows.getFieldByName('duration').split(':');
				var item = {
					pubdate : rows.getFieldByName('pubdate'),
					title : rows.getFieldByName('title').replace(/\(podcast\)/gi, '').replace(/(\d\d\.\d\d\.\d\d\d\d)/gi, ''),
					description : rows.getFieldByName('description'),
					url : rows.getFieldByName('enclosure_url'),
					podcast : rows.getFieldByName('podcast'),
					author : rows.getFieldByName('author'),
					duration : parseInt(parts[0] * 60) + parseInt(parts[1]),
					station : rows.getFieldByName('station'),
					channelimage : rows.getFieldByName('channelimage'),
				};
				items.push(item);
				rows.next();
			}
			rows.close();
			link.close();
			items.sort(function(a, b) {
				return Moment(b.pubDate).unix() - Moment(a.pubDate).unix();
			});
			_args.done({
				ok : true,
				items : items
			});
			return;
		}
		/* fallback if first time and not yet feed in database */
		//this.loadFeed(_args);
		var faved = 0;
		var that = this;
		var xhr = Ti.Network.createHTTPClient({
			onload : function() {
				var channel = new XMLTools(this.responseXML).toObject().channel;
				if (channel.item && toType(channel.item) != 'array') {
					channel.item = [channel.item];
				}
				var link = Ti.Database.open(DB);
				link.execute('INSERT OR REPLACE INTO feeds VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', //
				_args.url, //
				this.getResponseHeader('Expires'), //
				this.getResponseHeader('Last-modified'), //
				this.getResponseHeader('ETag') || '', //
				this.getResponseHeader('Content-Length'), //
				channel.title, //
				channel.description, //
				channel.category, //
				_args.station, channel.pubDate, //
				channel.lastBuildDate, //
				channel.image.url, //
				faved);
				channel.item.forEach(function(item) {
					link.execute('INSERT OR REPLACE INTO items VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', //
					_args.url, item.title, item.link, item.description, item.guid, //
					item.enclosure.url, item.enclosure.length, item.enclosure.type, item['itunes:author'], item['itunes:duration'], Moment(item.pubDate).toISOString, 0);
				});

				link.close();
				channel.item.faved = that.isFaved(_args.url);
				var result = {
					ok : true,
					items : channel.item
				};
				_args.done(result);
			}
		});
		xhr.open('GET', _args.url);
		xhr.send();
	},
	loadFeed : function(_args) {
		var faved = 0;
		var that = this;
		var xhr = Ti.Network.createHTTPClient({
			onload : function() {
				var channel = new XMLTools(this.responseXML).toObject().channel;
				if (channel.item && toType(channel.item) != 'array') {
					channel.item = [channel.item];
				}
				var link = Ti.Database.open(DB);
				// test if faved:
				var faved = 0;
				var res = link.execute('SELECT faved FROM feeds WHERE url=?', _args.url);
				if (res.isValidRow()) {
					faved = res.fieldByName('faved');
				}
				res.close();
				link.execute('INSERT OR REPLACE INTO feeds VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', //
				_args.url, //
				this.getResponseHeader('Expires'), //
				this.getResponseHeader('Last-modified'), //
				this.getResponseHeader('ETag') || '', //
				this.getResponseHeader('Content-Length'), //
				channel.title, //
				channel.description, //
				channel.category, //
				_args.station, //
				Moment(channel.pubDate).toISOString(), //
				Moment(channel.lastBuildDate).toISOString(), //
				channel.image.url, //
				faved);
				channel.item.sort(function(a, b) {
					return parseInt(a.timestamp) > parseInt(b.timestamp);
				});
				channel.item.forEach(function(item) {
					link.execute('INSERT OR REPLACE INTO items VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', //
					_args.url, //
					item.title, //
					item.link, //
					item.description, //
					item.guid, //
					item.enclosure.url, //
					item.enclosure.length, //
					item.enclosure.type, //
					item['itunes:author'], //
					item['itunes:duration'], //
					Moment(item.pubDate).toISOString(), //
					0 //watched
					);
				});
				//	console.log(Moment(channel.item.pubDate).toISOString());
				link.close();
				channel.item.faved = that.isFaved(_args.url);
				var result = {
					ok : true,
					items : channel.item
				};
				_args.done(result);
			}
		});
		xhr.open('GET', _args.url);
		xhr.send();
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
