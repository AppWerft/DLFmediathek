'use strict';

var Moment = require('vendor/moment'),
    Podcast = require('de.appwerft.podcast'),
    DB = Ti.App.Properties.getString('DATABASE'),
    Cache = require('controls/cache.adapter');

var $ = function() {
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

$.prototype = {
	cacheAll : function(channelurl, station) {
		var link = Ti.Database.open(DB);
		var res = link.execute('SELECT items.enclosure_url AS url,feeds.station AS station FROM items,feeds WHERE items.channelurl=? AND items.channelurl=feeds.url', channelurl);
		while (res.isValidRow()) {
			Cache.getURL({
				url : res.getFieldByName('url'),
				station : res.getFieldByName('station') || station,
			});
			res.next();
		}
		res.close();
		link.close();
	},
	mirrorAllFeeds : function(_args) {
		var that = this;
		var total = 0;
		// collecting all feeds in queue;
		var queue = [];
		['dlf', 'drk', 'drw'].forEach(function(station) {
			require('model/' + station).forEach(function(feed) {
				if (Array.isArray(feed.href)) {
					feed.href.forEach(function(url) {
						queue.push({
							station : station,
							url : url
						});
					});
				} else
					queue.push({
						station : station,
						url : feed.href
					});
			});
		});

		function loadfeeds() {
			function loadfeed() {
				var feed = queue.shift();
				if (feed) {
					total++;
					that.loadFeed({
						url : feed.url,
						station : feed.station,
						done : loadfeed
					});
				}
				_args.done && _args.done({
					total : total
				});

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
				station : res.getFieldByName('station'),
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
		console.log("toggleFaved " + _url);
		var link = Ti.Database.open(DB);
		link.execute('UPDATE feeds SET faved=? where url=?', (this.isFaved(_url)) ? 0 : 1, _url);
		link.close();
	},
	isFaved : function(_url) {
		if (_url) {
			if (Array.isArray(_url))
				_url = _url[0];
			var link = Ti.Database.open(DB);
			var faved;
			var res = link.execute('SELECT faved FROM feeds WHERE url=?', _url);
			if (res.isValidRow()) {
				faved = (res.fieldByName('faved')) ? 1 : 0;
			}
			res.close();
			link.close();
			return faved;
		} else
			console.log("_url must be!= null");
	},
	// get feed with all items from locale db
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
				var parts = rows.getFieldByName('duration').split(':'),
				    url = rows.getFieldByName('enclosure_url'),
				    station = rows.getFieldByName('station') || 'dlf';
				var item = {
					pubDate : rows.getFieldByName('pubdate'),
					title : rows.getFieldByName('title').replace(/\(podcast\)/gi, '').replace(/(\d\d\.\d\d\.\d\d\d\d)/gi, ''),
					description : rows.getFieldByName('description'),
					url : url,
					podcast : rows.getFieldByName('podcast'),
					author : rows.getFieldByName('author'),
					duration : parseInt(parts[0] * 60) + parseInt(parts[1]),
					station : station,
					faved : this.isFaved(_args.url),
					channelimage : rows.getFieldByName('channelimage'),
					cached : Cache.isCached({
						station : station,
						url : url
					}) ? true : false
				};
				items.push(item);
				rows.next();
			}
			rows.close();
			link.close();
			items.length && _args.done({
				ok : true,
				items : items
			});
		} else {
			console.log("Warning: no podcasts found");
		}
		this.loadFeed(_args);
	},
	loadFeed : function(_args) {
		console.log(_args);
		var faved = this.isFaved(_args.url) || 0;
		// getting from URL
		Podcast.loadPodcast({
			url : _args.url,
			timeout : 5000
		}, function(channel) {
			var link = Ti.Database.open(DB);
			link.execute('INSERT OR REPLACE INTO feeds VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', //
			_args.url, //
			"", //this.getResponseHeader('Expires'), //
			"", //this.getResponseHeader('Last-modified'), //
			"", //this.getResponseHeader('ETag') || '', //
			"", //this.getResponseHeader('Content-Length'), //
			channel.title, //
			channel.description, //
			channel.category, //
			_args.station, channel.pubDate, //
			channel.lastBuildDate, //
			"", //channel.image.url, //
			faved);
			for (var i = 0; i < channel.items.length; i++) {
				channel.items[i].duration = parseInt(channel.items[i].duration.split(':')[0]) * 60 + parseInt(channel.items[i].duration.split(':')[1]);
				channel.items[i].pubDate = Moment(channel.items[i].pubDate).toISOString();
			}
			channel.items.forEach(function(item) {
				link.execute('INSERT OR REPLACE INTO items VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', //
				_args.url, item.title, item.link, item.description, item.guid, //
				item.enclosure.url, item.enclosure.length, item.enclosure.type, item.author, item.duration, item.pubDate, 0);
			});
			link.close();
			var result = {
				ok : true,
				items : channel.items
			};
			_args.done(result);
		});
	}
};

module.exports = $;
