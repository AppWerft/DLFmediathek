var DLF24_FEED_URL = "http://www.deutschlandfunk.de/die-nachrichten.353.de.rss?_=";

var KEY = "DLF#";
var lasttime = new Date().getTime();

function l(t) {
	var diff = (new Date().getTime()) - lasttime;
	console.log(diff + " DLF: " + t);
	lasttime = new Date().getTime();
};
l("START=======================");
var $ = {
	getNewsList : function(_callback, _forced) {
		$.getArchive();
		if (Ti.App.Properties.hasProperty("DLF24") && !_forced) {
			var res = Ti.App.Properties.getObject("DLF24");
			_callback && _callback({
				items : res,
				state : 0
			});
			return res;
		}
		var unresolvedItems = [];
		l("----------- start refresh");
		require("de.appwerft.podcast").loadPodcast({
			url : DLF24_FEED_URL + Math.random(),
			timeout : 10000
		}, function(_e) {
			l("Answer from server " + _e.items.length);
			_e.items && Ti.App.Properties.setList("DLF24", _e.items);
			var items = _e.items.map(function(_item, _ndx) {
				if (!_item)
					return null;
				//_item.ndx = _ndx;
				//_item.url = _item.link;
				var item = $.getNewsItem(_item.link);
				if (item) {
					return item;
				} else {
					unresolvedItems.push(_item);
					// copy from xml list
					item = _item;
					item.ndx = _ndx;
					item.shorttext = clean(_item.description);
					item.title = clean(_item.title);
					return item;
				}
			});
			l("first resolving ready");
			_callback && _callback({
				items : items,
				state : 1,
				unresolved : unresolvedItems.length
			});
			var count = 0;
			l("UI (listview) updated => start second (async) run");
			var getDetailsForItemfromNet = function(item) {
				count++;
				$.getNewsItem(item.link, function(_item) {
					items[item.ndx] = _item;
					var uitem = unresolvedItems.pop();
					if (uitem) {
						getDetailsForItemfromNet(uitem);
					} else {
						l("item " + count + " resolved");
						Ti.App.Properties.setList("DLF24", items);
						_callback && _callback({
							items : items,
							state : 2,
							unresolved : 0
						});
					}
				}, false);
			};
			var uitem = unresolvedItems.pop();
			uitem && getDetailsForItemfromNet(uitem);
		});
	},

	getNewsItem : function(_url, _callback, _forced) {
		var key = KEY + _url;
		if (Ti.App.Properties.hasProperty(key) && !_forced) {
			var res = Ti.App.Properties.getObject(key);
			_callback && _callback(res);
			return res;
		}
		var Document = require("de.appwerft.soup").createDocument({
			url : _url,
			onload : function(e) {
				var result = {
					"link" : _url,
					"aufmacher" : Document.select("dt img")[0].getAttribute("src"),
					"bu" : clean(Document.select("dt img")[0].getAttribute("title")),
					"shorttext" : clean(Document.select(".articlemain .kicker")[0].getText()),
					"overline" : clean(Document.select("h1 span")[0].getText()),
					"title" : clean(Document.select("#content header h1")[0].getOwnText().replace(/<a.*<\/a>?/gm, ""))
				};
				var bu = Document.select("dt img")[0].getAttribute("title").match(/\(.*?\)/);
				if (bu && bu.length > 0) {
					result.copyright = bu[bu.length - 1].replace("(", "").replace(")", "");
				}
				var fulltextE = Document.select(".articlemain p")[1];
				if (fulltextE)
					result.fulltext = clean(fulltextE.getHtml());
				Ti.App.Properties.setObject(key, result);
				_callback && _callback(result);
			},
			onerror : function(e) {
				console.log(e);
			}
		});
		return null;
	},
	getArchive : function() {
		console.log("========XXX===========");
		var Document = require("de.appwerft.soup").createDocument({
			url : "http://www.deutschlandfunk.de/dlf24-nachrichten-wochenueberblick.1724.de.html",
			onload : function(_e) {
				var items = Document.select(".dlfn-article-list h3 a");
				var archive = items.map(function(item) {
					return {
						title : item.getOwnText(),
						link : "http://www.deutschlandfunk.de/" + item.getAttribute("href"),
						overline : item.getChild(0).getText()
					};

				});
				console.log(archive.length);
			}
		});

	}
};
module.exports = $;

function clean(foo) {
	if (foo)
		return foo.replace(/<a.*?>/gim, "").replace(/<\/a>/gim, "")//
		.replace(/&nbsp;/gm, " ")//
		.replace(/<br>\s*<br>\s*/gm, "\n\n")//
		.replace(/<br>/gm, "")//
		.replace(/Erdogan/gm, "Erdoğan")//
		.replace(/Isik/gm, "Işık")//
		.replace(/"([^"]+)"/gm, '„$1“');
	else
		return "";
}
