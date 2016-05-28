var Moment = require('vendor/moment'),
    XMLTools = require('vendor/XMLTools'),
    Model = require('model/stations');
Moment.locale('de   ');

var schema = {
	"dlf" : null,
	"drk" : null,

};

/* function for testing if cache is valide and from today: */
function getValidSchemaByStation(station) {
	const KEY = 'SCHEMA–' + station;
	if (!Ti.App.Properties.hasProperty(KEY)) {
		console.log('Warning: no schema in cache ' + station);
		return null;
	}
	var items = schema[station] ? schema[station] : Ti.App.Properties.getList(KEY);
	/* valides JSON ?*/
	if (!Array.isArray(items) || !items[0].schema) {
		console.log('Warning: we kill old DAYPLAN because has not array');
		// remove to save time for next step
		schema[station] = null;
		Ti.App.Properties.removeProperty(KEY);
		return null;
	}

	if (items[0].schema !== Moment().format('YYYY-MM-DD')) {
		// force new:
		console.log('Warning: we kill old ' + KEY + ' because wrong date');
		schema[station] = null;
		Ti.App.Properties.removeProperty(KEY);
		return null;
	}
	schema[station] = items;
	Ti.App.Properties.setList(KEY, items);
	return items;
}

var _sanitizeHTML = function(foo) {
	var bar = ( typeof foo == 'string')//
	? foo.replace(/[\s]+<p>[\s]+/gm, '').replace(/[\s]+<\/p>[\s]+/gm, '').replace(/[\n]+/gm, '<br/>⊃ ') : undefined;
	if (bar != undefined) {
		bar = bar.replace('⊃ Moderation', 'Moderation');
		bar = bar.replace('⊃ Von', 'von ');
		bar = bar.replace('⊃ Am Mikrofon', 'am Mikrofon');
	}
	return bar;
};
var _updateTimestamps = function(_args) {
	console.log("_updateTimestamps");
	var items = getValidSchemaByStation(_args.station);
	if (items) {
		var length = items.length;
		var ndx = 0;
		for ( i = 0; i < length; i++) {
			var item = items[i];
			if (i == 0) {
				item.endtime = Moment(items[1].pubDate);
				item.duration = items[0].endtime.diff(Moment().startOf('day')) / 1000;
			} else if (i != length - 1) {
				item.endtime = Moment(items[i + 1].pubDate);
				item.duration = item.endtime.diff(Moment(item.pubDate)) / 1000;
			} else {
				item.endtime = Moment().startOf('day').add(1, 'day');
				item.duration = item.endtime.diff(Moment(item.pubDate)) / 1000;
			}
			item.progress = Moment().diff(Moment(item.pubDate)) / item.duration / 1000;
			item.duration_mmss = (item.duration > 3600)//
			? Moment.unix(item.duration).format('H:mm:ss')//
			: Moment.unix(item.duration).format('m:ss');
			item.description = _sanitizeHTML(item.description);
			item.isonair = (Moment().isBetween(item.pubDate, item.endtime)) ? true : false;
			item.ispast = (Moment().isBefore(item.endtime)) ? false : true;
			if (!item.endtime.isAfter(Moment()))
				ndx++;
		}
		return items;
	} else
		return [];

};

/* I N T E R F A C E */
exports.getCurrentOnAir = function(_args) {
	_updateTimestamps(_args);
	var items = getValidSchemaByStation(_args.station);
	if (items != null) {
		// test if new one (daychange)
		var currentonair = null;
		var items = getValidSchemaByStation(_args.station);
		items.forEach(function(item) {
			if (item.isonair == true)
				currentonair = item;
		});
		// test if right day:
		return currentonair;
	} else {
		// try to get new
		console.log('Warning: items in currentOnAir was null');
		exports.getRSS(_args);
		return {};
	}
};

exports.getRSS = function(_args) {
	console.log('getRSS*' + _args.station);
	var KEY = "SCHEMA–" + _args.station;
	var items = getValidSchemaByStation(_args.station);
	if (items != null) {
		_args.done && _args.done({
			ok : true,
			items : _updateTimestamps({// adding time infos
				station : _args.station
			})
		});
	} else {
		console.log('>>>>>>>>>>>>>>>Info: valid schema did found => retrieve new one ');
		var url = Model[_args.station].dayplan + '?_=' + Math.random();
		if (Model[_args.station].dayplan) {
			if (Ti.Network.online == false)
				return;
			require('de.appwerft.scraper').createScraper({
				url : url,
				useragent : "Das DRadio/6 CFNetwork/711.1.16 Darwin/14.0.0",
				subXpaths : {
					"title" : "//item/title/text()",
					"description" : "//item/description/text()",
					"pubDate" : "//item/pubDate/text()",
					"schema" : "//item/guid/text()",
					"link" : "//item/link/text()",
				}
			}, function(channel) {
				if (channel.success && channel.items) {
					var items = channel.items;
					for (var i = 0; i < items.length; i++) {
						var item = items[i];
						item.pubDate = item.pubDate.trim();
						item.schema = item.schema.trim().replace('schema-', '').substr(0, 10);
						item.link = item.link.replace(/\.html$/, '.mhtml');
						var m = item.link.match(/\.([\d]+)\.de\.html$/);
						if (m)
							item.id = m[1];
					}
					Ti.App.Properties.setList(KEY, items);
					Ti.App.fireEvent('app:message', {
						message : 'Tagesübersicht synchronisiert ' + Model[_args.station].name
					});
					var result = {
						ok : true,
						items : _updateTimestamps({
							station : _args.station
						})
					};
					_args.done && _args.done(result);
				}
					
			});
		}
	}
};

