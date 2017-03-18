module.exports = {
	getNewsItem : function(_url, _callback, _forced) {
		var key = "DLF24#" + _url;
		if (Ti.App.Properties.hasProperty(key) && !_forced) {
			var res = Ti.App.Properties.getObject(key);
			_callback && _callback(res);
			return res;
		}
		var HTMLSoup = require("de.appwerft.soup").createHTMLSoup({
			url : _url,
			onload : function(e) {
				var result = {
					"aufmacher" : HTMLSoup.select("dt img")[0].getAttribute("src"),
					"bu" : HTMLSoup.select("dt img")[0].getAttribute("title"),
					"shorttext" : HTMLSoup.select(".articlemain .kicker")[0].getText(),
					"overline" : HTMLSoup.select("h1 span")[0].getText(),
					"title" : HTMLSoup.select("#content header h1")[0].getOwnText()
				};
				var fulltextE = HTMLSoup.select(".articlemain p")[1];
				if (fulltextE)
					result.fulltext = fulltextE.getText().replace(/<br>/, "\n");
				Ti.App.Properties.setObject(key, result);
				_callback && _callback(result);
			},
			onerror : function(e) {
				console.log(e);
			}
		});
		return null;
	}
};
