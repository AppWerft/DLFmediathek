'use strict';
var Moment = require('vendor/moment'),
    Favs = new (require('controls/favorites.adapter'))(),
    CacheAdapter = require('controls/cache.adapter');

if (!Ti.App.Properties.hasProperty('LAST_STATION'))
	Ti.App.Properties.setString('LAST_STATION', 'dlf');

module.exports = function(_args) {
	if (_args.station != Ti.App.Properties.getString('LAST_STATION')) {
		_args.onload(null);
		return;
	}
	var start = new Date().getTime();
	var DEPOTKEY = 'MEDIATHEK_' + _args.station + '_' + _args.date;
	var onloadFunc = function(_e) {
		if (_args.date && _e.success) {
			var entries = _e.items;
			// sorting by sendung.name
			var mediathek = [],
			    lastsendung = '',
			    sectionndx = -1;
			for (var i = 0; i < entries.length; i++) {
				var item = entries[i];
				item.station = _args.station;
				item.datetime = item.datetime.trim();
				item.author = item.author.trim();
				item.sendung.author = item.sendung.trim();
				var sub = {
					author : ( typeof item.author == 'string') ? item.author : null,
					start : item.datetime ? item.datetime.split(' ')[1].substr(0, 5) : '',
					subtitle : item.title.replace(/"([^"]+)"/gm, '„$1“'),
					station : item.station,
					url : item.url,
					datetime : item.datetime,
					cached : CacheAdapter.isCached({
						url : item.url,
						station : item.station
					}),
					killtime : item.killtime,
					pubdate : item.datetime,
					duration : item.duration,
					title : item.title.replace(/"([^"]+)"/gm, '„$1“')
				};
				sub.isfav = Favs.isFav(sub) ? true : false;
				if (item.sendung != lastsendung) {
					sectionndx++;
					mediathek[sectionndx] = {
						name : item.sendung,
						subs : [sub]
					};
					lastsendung = item.sendung;
				} else {
					mediathek[sectionndx] && mediathek[sectionndx].subs.push(sub);
				}
			}
		}
		if (mediathek) {
			var result = {
				mediathek : mediathek,
				hash : Ti.Utils.md5HexDigest(JSON.stringify(mediathek))
			};
			entries = null;
			Ti.App.Properties.setString(DEPOTKEY, JSON.stringify(result));
			_args.onload(result);
		}
	};

	if (!_args.url)
		return;
	var url = (_args.date) ? _args.url.replace(/_DATE_/gm, _args.date) : _args.url;
	require('de.appwerft.scraper').createScraper({
		url : url + '&_____=' + Math.random(),
		rootXpath : "//entries",
		useragent : "Das DRadio/6 CFNetwork/711.1.16 Darwin/14.0.0",
		subXpaths : {
			url : "//item/@url",
			author : "//item/author/text()",
			title : "//item/title/text()".replace(/"([^"]+)"/gm, '„$1“').replace(/Erdogan/gm, "Erdoğan").replace(/Isik/gm, "Işık"),
			id : "//item/@id",
			sendung : "//item/sendung/text()",
			sendungid : "//item/sendung/@id",
			duration : "//item/@duration",
			killtime : "//item/@killtime",
			deliveryMode : "//item/@deliveryMode",
			datetime : "//item/datetime/text()"
		}
	}, onloadFunc);
};
