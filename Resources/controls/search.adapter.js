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
	if (args.where == 'mediathek') { // remote search
		var xhr = Ti.Network.createHTTPClient({
			validatesSecureCertificate : false,
			timeout : 30000,
			onload : function() {
				var payload = new XMLTools(this.responseXML).toObject();
				var items = payload.item;
				if (items && toType(items) != 'array') {
					items = [items];
				}
				if (items == undefined) {
					args.done({
						items : [],
						section : args.section
					});
					return;
				}
				args.done({
					section : args.section,
					where: args.where,
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
					})
				});
			}
		});
		xhr.open('GET', url.replace('NEEDLE', encodeURIComponent(args.needle)));
		xhr.send();
	} else { // searching in podcasts (local search):
		var link = Ti.Database.open(DB);
		var sql = 'SELECT *,'//
		+ '(SELECT title FROM feeds WHERE feeds.url=items.channelurl) AS podcast,'//
		+ '(SELECT image FROM feeds WHERE feeds.url=items.channelurl) AS channelimage,'//
		+ '(SELECT station FROM feeds WHERE feeds.url=items.channelurl) AS station '//
		+ ' FROM items WHERE title LIKE "%' + args.needle + '%" OR description LIKE "%' + args.needle + '%" ORDER BY pubdate DESC LIMIT 500';
		var res = link.execute(sql);
		var items = [];
		while (res.isValidRow()) {
			var parts = res.getFieldByName('duration').split(':');
			var station =  res.getFieldByName('station') || 'dlf';
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
				station : station,
				color : Model[station].color,
				image : res.getFieldByName('channelimage')
			};
			var match = /<img src="(.*?)"\s.*?title="(.*?)".*?\/>(.*?)</gmi.exec(item.description);
			if (match) {
				item.image = match[1];
				item.desription = match[3];
				item.copyright = match[2];
			} else
				description = undefined;
			items.push(item);
			res.next();
		}
		res.close();
		link.close();
		args.done({
			items : items,
			where: args.where,
			section : args.section
		});
	}
};
