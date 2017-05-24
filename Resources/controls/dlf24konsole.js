var FEED = "https://dlf24.konsole-labs.com/backend/get/?typ=news&subtyp=__SUBTYP__&ver={ver}";
var TTL = 1000 * 60;

var Moment = require("vendor/moment");
Moment.locale("de");
var DLF24 = "DLF24";

function l(t) {
	var diff = (new Date().getTime()) - lasttime;
	console.log(diff + " DLF: " + t);
	lasttime = new Date().getTime();
};
var DATE_FORMAT = "YYYY-MM-DD";

var $ = {
	getNewsList : function(date, cb) {
		console.log(date +"      "+Moment().format(DATE_FORMAT)); 
		if (Ti.App.Properties.hasProperty(DLF24) && date == Moment().format(DATE_FORMAT))
			cb({
				cached : true,
				items : Ti.App.Properties.getList(DLF24)
			});
		var url = FEED.replace("__SUBTYP__", date ? date : Moment().format(DATE_FORMAT));
		var xhr = Ti.Network.createHTTPClient({
			timeout : 10000,
			oneror : function() {
				console.log("TIMEOUT ===========================" + url);
				cb({
					error : true,
					items : []
				});
			},
			onload : function() {
				var response = this.responseText;
				if (response[0] == "{") {
					var result = JSON.parse(response).data.map(function(data) {
						var ctime = Math.round(data.k1.split("-")[3] / 1000);
						return {
							ctime : ctime,
							aufmacher : data.d.img,
							link : data.d.url,
							fulltext : clean(data.d.h),
							shorttext : clean(data.d.d),
							title : clean(data.d.t),
							overline : data.d.head,
							bu : data.d.imgt,
							timestamp : data.v,
							cTime : Moment.unix(ctime).format("dddd, HH:mm") + " Uhr"
						};
					});
					result.sort(function(a, b) {
						return b.ctime - a.ctime;
					});
					Ti.App.Properties.setList(DLF24, result);
					cb({
						changed : true,
						items : result
					});
				} else
					console.log("ERROR wrong answer:");
			}
		});
		xhr.open("GET", url);
		xhr.send();
	}
};
module.exports = $;

function testChanges(items) {
	var newHash = Ti.Utils.md5HexDigest(JSON.stringify(items));
	console.log(newHash);
	console.log(lastHash);
	if (newHash != lastHash) {
		lastHash = newHash;
		return true;
	}
	return false;
}
