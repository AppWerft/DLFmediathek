'use strict';
var Moment = require('vendor/moment'),
    Favs = new (require('controls/favorites.adapter'))(),
    Soup = require("de.appwerft.soup"),
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
				console.log(item);
				item.station = _args.station;
				item.datetime = item.datetime.trim();
				item.author = item.author.trim();
				item.sendung.author = item.sendung.trim();
				var sub = {
					author : ( typeof item.author == 'string') ? item.author : null,
					start : item.datetime ? item.datetime.split(' ')[1].substr(0, 5) : '',
					subtitle : clean(item.title),
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
					title : clean(item.title)
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
	Soup.createDocument({
		url : url,
		onload : function(res) {
			if (res && res.document) {
				var elems = res.document.select("item");
				if (elems) {
					onloadFunc({
						success : true,
						items : elems.map(function(item) {
							return {
								author : item.selectFirst("author").getText(),
								title : item.selectFirst("title").getText(),
								sendung : item.selectFirst("sendung").getText(),
								id : item.getAttribute("id"),
								sendungid : item.getAttribute("sendungid"),
								duration : item.getAttribute("duration"),
								killtime : item.getAttribute("killtime"),
								deliveryMode : item.getAttribute("deliveryMode"),
								datetime : item.selectFirst("datetime").getText(),
								url : item.getAttribute("url"),
								station : item.getAttribute("station")
							};
						})
					});
				}
			}
		}
	});
};
