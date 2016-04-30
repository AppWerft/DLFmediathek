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
	console.log(DEPOTKEY);
	var onloadFunc = function() {
		console.log('Info: time for loading of mediathek: ' + (new Date().getTime() -start));
		var startparse = new Date().getTime();
		var entries = require('controls/mediathek.parser').parseXMLDoc(this.responseXML.documentElement);
		// little dirty cleaning process:
		if (_args.date) {
			// sorting bei sendung.name
			var mediathek = [],
			    lastsendung = '',
			    sectionndx = -1;
			for (var i = 0; i < entries.length; i++) {
				var item = entries[i];
				var sub = {
					author : ( typeof item.author == 'string') ? item.author : null,
					start : item.datetime ? item.datetime.split(' ')[1].substr(0, 5) : '',
					subtitle : item.title,
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
					title : item.title,
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
					mediathek[sectionndx].subs.push(sub);
				}
			}

		}
		console.log('Info: time for parsing mediathek: ' + (new Date().getTime() -startparse));
		var result = {
			mediathek : mediathek,
			hash :  Ti.Utils.md5HexDigest(JSON.stringify(mediathek))
		};
		entries = null;
		Ti.App.Properties.setString(DEPOTKEY, JSON.stringify(result));
		
		_args.onload(result);
	};
	var url = (_args.date) ? _args.url.replace(/_DATE_/gm, _args.date) : _args.url;
	console.log(_args);
	console.log(url);
	var xhr = Ti.Network.createHTTPClient({
		timeout : 3000,
		onerror : function(e) {
			Ti.UI.createNotification({
				message : 'Bitte Internetverbindung überprüfen.\nDerweil gibt es eine ältere Version der Mediathek.'
			}).show();
			_args.onload(JSON.parse(Ti.App.Properties.getString(DEPOTKEY)));
		},
		onload : onloadFunc
	});
	xhr.open('GET', url + '&_____=' + Math.random());
	xhr.setRequestHeader('User-Agent', 'Das%20DRadio/6 CFNetwork/711.1.16 Darwin/14.0.0');
	xhr.send();
};
