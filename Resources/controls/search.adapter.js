var Moment = require('vendor/moment'),
    XMLTools = require('vendor/XMLTools');
Model = require('model/stations');
const DB = Ti.App.Properties.getString('DATABASE');

var toType = function(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

var url = 'http://srv.deutschlandradio.de/aodlistaudio.1706.de.rpc?drau:searchterm=NEEDLE&drau:page=1&drau:limit=300';

var stations = {
	4 : 'dlf',
	3 : 'drk',
	1 : 'drw'
};

module.exports = function() {
	var args = arguments[0] || {};
	if (args.where == 'mediathek') {
		var xhr = Ti.Network.createHTTPClient({
			timeout : 30000,
			onload : function() {
				var payload = new XMLTools(this.responseXML).toObject();
				var items = payload.item;
				if (items && toType(items) != 'array') {
					items = [items];
				}
				console.log(items);
				if (items == undefined) {
					args.done({
						items : [],
						section : args.section
					});
					return;
				}
				args.done({
					items : items.map(function(item) {
						return {
							pubdate : Moment(item.datetime).format('DD.MM.YYYY HH:mm'),
							title : item.title,
							author : item.author,
							sendung : item.sendung.text,
							url : item.url,
							image : '/images/' + stations[item.station] + '.png',
							station : stations[item.station],
							duration : item.duration,
							color : Model[stations[item.station]].color
						};
					}),
					section : args.section
				});
			}
		});
		xhr.open('GET', url.replace('NEEDLE', encodeURIComponent(args.needle)));
		xhr.send();
	} else {
		var link = Ti.Database.open(DB);
		var res = link.execute('SELECT *,'//
		+ '(SELECT title FROM feeds WHERE feeds.url=items.channelurl) AS podcast,'//
		+ '(SELECT image FROM feeds WHERE feeds.url=items.channelurl) AS channelimage,'//
		+ '(SELECT station FROM feeds WHERE feeds.url=items.channelurl) AS station '//
		+ ' FROM items WHERE title LIKE "%' + args.needle + '%" OR description LIKE "%' + args.needle + '%" ORDER BY pubdate DESC LIMIT 500');
		var items = [];
		while (res.isValidRow()) {
			var parts = res.getFieldByName('duration').split(':');
			var item = {
				title : res.getFieldByName('title'),
				pubdate : Moment(res.getFieldByName('pubdate')).format('DD. MM. YYYY  HH:ii'),
				author : res.getFieldByName('author'),
				sendung : res.getFieldByName('podcast'),
				url : res.getFieldByName('enclosure_url'),
				description : res.getFieldByName('description'),
				podcast : res.getFieldByName('podcast'),
				author : res.getFieldByName('author'),
				duration : parseInt(parts[0] * 60) + parseInt(parts[1]),
				station : res.getFieldByName('station'),
				color : Model[res.getFieldByName('station')].color,
				channelimage : res.getFieldByName('channelimage')
			};
			items.push(item);
			res.next();
		}
		res.close();
		link.close();
		args.done({
			items : items,
			section : args.section
		});
	}
};
