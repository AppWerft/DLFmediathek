var Moment = require('vendor/moment'),
    Favs = new (require('controls/favorites.adapter'))();
    
if (!Ti.App.Properties.hasProperty('LAST_STATION'))
	Ti.App.Properties.setString('LAST_STATION', 'dlf');

module.exports = function(_args) {
	if (_args.station != Ti.App.Properties.getString('LAST_STATION')) {
			console.log('Warning: no same station');
			_args.onload(null);
			return;
	}
	var onloadFunc = function() {
		var start = new Date().getTime();
		var entries = require('controls/aodlistaudio.rpc').parseXMLDoc(this.responseXML.documentElement);
		console.log('Info: time for mediathekparsing= ' + (new Date().getTime() - start) + '  ' + entries.length + ' Beiträge');
		var result = {
			hash : Ti.Utils.md5HexDigest(this.responseText),
			live : entries
		};
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
					pubdate : item.datetime,
					duration : item.duration,
					//	id : item.sendung.id,
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
			result.mediathek = mediathek;
		}
		Ti.App.Properties.setString(url, JSON.stringify(result));
		_args.onload(result);
	};

	var url = (_args.date) ? _args.url.replace(/_DATE_/gm, _args.date) : _args.url;
	if (!_args.nocache && Ti.App.Properties.hasProperty(url)) {
		_args.onload(JSON.parse(Ti.App.Properties.getString(url)));
		return null;
	}
	var xhr = Ti.Network.createHTTPClient({
		timeout : 30000,
		onerror : function(e) {
			console.log('ServerantwortCode: ' + e.status);
		},
		onload : onloadFunc
	});
	xhr.open('GET', url);
	console.log(url);
	xhr.setRequestHeader('User-Agent', 'Das%20DRadio/6 CFNetwork/711.1.16 Darwin/14.0.0');
	xhr.send();
};
