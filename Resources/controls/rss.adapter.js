var Moment = require('vendor/moment'),
    XMLTools = require('vendor/XMLTools'),
    Model = require('model/stations');
Moment.locale('de   ');

var schema = {
	"dlf" : null,
	"drk" : null,

};
var downloadlocked = false;

/* function for testing if cache is valide and from today: */
function getValidSchemaByStation(station) {
	const KEY = 'SCHEMA_' + station;
	if (!Ti.App.Properties.hasProperty(KEY)) {
		console.log('Warning: no schema in cache ' + station);
		return null;
	}
	var items = schema[station] ? schema[station] : JSON.parse(Ti.App.Properties.getString(KEY));
	/* valides JSON ?*/
	if (!Array.isArray(items) || !items[0].guid || !items[0].guid.text) {
		console.log('Warning: we kill old DAYPLAN because has not array');
		// remove to save time for next step
		schema[station] = null;
		Ti.App.Properties.removeProperty(KEY);
		return null;
	}
	//  <guid isPermaLink="false">schema-2016-02-17-05:00+0100</guid>
	if (items[0].guid.text.replace('schema-', '').substr(0, 10) !== Moment().format('YYYY-MM-DD')) {
		// force new:
		console.log('Warning: we kill old ' + KEY + ' because wrong date');
		schema[station] = null;
		Ti.App.Properties.removeProperty(KEY);
		return null;
	}
	schema[station] = items;
	Ti.App.Properties.setString(KEY, JSON.stringify(items));
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
	var items = getValidSchemaByStation(_args.station);
	//	var url = Model[_args.station].dayplan + '?YYYYMMDD=' + Moment().format('YYYYMMDD');
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
	var KEY = "SCHEMA_" + _args.station;
	var items = getValidSchemaByStation(_args.station);
	if (items != null) {
		_args.done && _args.done({
			ok : true,
			items : _updateTimestamps({// adding time infos
				station : _args.station
			})
		});
	}
	/* else we retrieve a new one :*/
	else {
		console.log('Info: valid schema did found => retieve new one ');
		var url = Model[_args.station].dayplan;
		if (Model[_args.station].dayplan) {
			if (Ti.Network.online == false)
				return;
			if (downloadlocked == true) {
				console.log('Warning: HTTPclient is locked, network status =' + Ti.Network.online);
				return;
			}
			downloadlocked = true;
			var xhr = Ti.Network.createHTTPClient({
				validatesSecureCertificate : false,
				onerror : function() {
					console.log("Warning: http error with " + url);
					downloadlocked = false;
				},
				onload : function() {
					console.log(this.responseText.substring(0,1256));
					if (!this.responseXML) {
						console.log("Warning: RSS is not valid XML");
						return;
					}	
					var channel = new XMLTools(this.responseXML).toObject().channel;
					if (!channel) {
						console.log("Warning: RSS doesn't contain channel");
						return;
					}	
					if (channel.item && !Array.isArray(channel.item)) {
						channel.item = [channel.item];
					}
					Ti.App.Properties.setString(KEY, JSON.stringify(channel.item));
					Ti.App.fireEvent('app:message', {
						message : 'Tagesübersicht synchronisiert ' + Model[_args.station].name
					});
					console.log('Info: new schema  found => saved to locale storage _________ ' + KEY);
					downloadlocked = false;
					var result = {
						ok : true,
						items : _updateTimestamps({
							station : _args.station
						})
					};
					Ti.App.Properties.setString(KEY, Moment().format('YYYYMMDD'));
					// back to caller
					_args.done && _args.done(result);
					// persist

				}
			});
			console.log('RSS='+url);
			xhr.open('GET', url);
			xhr.send();
		}
	}
};
// standard methods for event/observer pattern

