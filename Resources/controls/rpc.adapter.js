var Moment = require('vendor/moment'),
    XMLTools = require('vendor/XMLTools'),
    Favs = new (require('controls/favorites.adapter'))();

var toType = function(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

module.exports = function(_args) {
	var url = (_args.date) ? _args.url.replace(/_DATE_/gm, _args.date) : _args.url;
	if (!_args.nocache && Ti.App.Properties.hasProperty(url)) {
		_args.onload(JSON.parse(Ti.App.Properties.getString(url)));
		return;
	}
	var xhr = Ti.Network.createHTTPClient({
		timeout : 30000,
		onerror : function(e) {
			console.log('ServerantwortCode: '+e.status);
		},
		onload : function() {
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
						start : item.datetime ? item.datetime.split(' ')[1].substr(0, 5)  :'',
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
		}
	});
	xhr.open('GET', url);
	xhr.setRequestHeader('User-Agent', 'Das%20DRadio/6 CFNetwork/711.1.16 Darwin/14.0.0');
	xhr.send();

};
