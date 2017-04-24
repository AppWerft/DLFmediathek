var DLF24_FEED_URL = "http://www.deutschlandfunk.de/die-nachrichten.353.de.rss?_=";
var PodcastListGrabber = require("de.appwerft.podcast");
var Moment = require("vendor/moment");
var KEY = "DLF#13";
var lasttime = new Date().getTime();
var lastHash = "";
var TTL = 1000*60; // cache time
function l(t) {
	var diff = (new Date().getTime()) - lasttime;
	console.log(diff + " DLF: " + t);
	lasttime = new Date().getTime();
};
l("START=======================");
var $ = {
	getNewsList : function(_callback, _forced, _offset, _limit) {
		if (_callback == undefined || typeof _callback != "function") {
			return;
		}
		var forced = (_forced == undefined) ? true : false;	
		var offset = (_offset == undefined) ? 0 : _offset;
		var limit = (_limit == undefined) ? 3 : _limit;
		l(">>>>>>>>>>>>>>>>> " +forced + "   offset=" + offset + "   limit=" + limit);
		if (Ti.App.Properties.hasProperty("DLF24") && !forced) {
			// first callback from cache:
			var items = Ti.App.Properties.getObject("DLF24");
			_callback && _callback({
				items : items,
				state : 0,
				changed : testChanges(items)
			});
		}
		var unresolvedItems = [];
		PodcastListGrabber.loadPodcast({
			url : DLF24_FEED_URL + Math.random(),
			timeout : 10000
		}, function(_e) {
			l("Answer from server " + _e.items.length);
			// in list details try to resolve (synchronly)
			// iterating thru all items:
			var items = _e.items.map(function(_item, _ndx) {
				var item = $.getNewsItem(_item.link); // getter
				if (item) {
					return item; // directly to result list
				} else {
					if (_ndx >= offset && _ndx <= offset+limit)
						unresolvedItems.push(_item);
					item = _item;
					item.ndx = _ndx;
					item.shorttext = clean(_item.description).replace(/\. mehr/, ".");
					item.title = clean(_item.title);
					return item;
				}
			});
			
			// result save in properties for caching
			_e.items && Ti.App.Properties.setList("DLF24", _e.items);
			//		
			l("first resolving ready");
			_callback && _callback({
				items : items,
				state : 1,
				changed : testChanges(items),
				unresolved : unresolvedItems.length
			});
            // now we go into net and resolve partly the details depending offset/limit
			var count = 0;
			l("UI (listview) updated => start second (async) run");
			var getDetailsForItemfromServer = function(item) {
				count++;
				l("items resolved " + count);
				if (count == 5) {
					l("3 items resolved");
					_callback && _callback({
						items : items,
						unresolved : 0
					});
				}
				function doNextStep(_item) {
					l("donextStep");
					items[item.ndx] = _item;
					var uitem = unresolvedItems.pop();
					if (uitem) {
						getDetailsForItemfromServer(uitem);
					} else {// end of loop
						l("item " + count + " resolved");
						Ti.App.Properties.setList("DLF24", items);
						_callback && _callback({
							items : items,
							state : 2,
							unresolved : 0
						});
						l("end doNextsteploop");
					}
				}


				$.getNewsItem(item.link, doNextStep, false);
			};
			var uitem = unresolvedItems.pop();
			uitem && getDetailsForItemfromServer(uitem);
			l("end/start loop");
		});
	},

	getNewsItem : function(_url, _callback, _forced) {
		var key = KEY + _url;
		if (Ti.App.Properties.hasProperty(key) && !_forced) {
			var res = Ti.App.Properties.getObject(key);
			_callback && _callback(res);
			return res;
		}
		if (!_callback) return;
		l("start scraper of " + _url);
		var Document = require("de.appwerft.soup").createDocument({
			url : _url,timeout: 30000,
			onload : function(e) {
				if (!Document) {
					l("no Document from " + _url);
					return;
				}
				var result = {
					"link" : _url,
					"aufmacher" : Document.selectFirst("dt img").getAttribute("src"),
					"bu" : clean(Document.selectFirst("dt img").getAttribute("title")),
					"shorttext" : clean(Document.selectFirst(".articlemain .kicker").getText()),
					"overline" : clean(Document.selectFirst("h1 span").getText()),
					"title" : clean(Document.selectFirst("#content header h1").getOwnText().replace(/<a.*<\/a>?/gm, ""))
				};
				var bu = Document.selectFirst("dt img").getAttribute("title").match(/\(.*?\)/);
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
	getArchive : function(_cb) {
		var URL = "http://www.deutschlandfunk.de/dlf24-nachrichten-wochenueberblick.1724.de.html?" + Moment().format("YYYYMMDD");
		var Document = require("de.appwerft.soup").createDocument({
			url : URL,
			onload : function(_e) {
				var items = Document.select(".dlfn-article-list h3 a").map(function(item) {
					console.log(item);
					return {
						title : clean(item.getOwnText()),
						link : "http://www.deutschlandfunk.de/" + item.getAttribute("href"),
						overline : item.getChild(0).getText()
					};
				});
				if (_cb)
					_cb(items);
				else
					console.log("no callback for archive");
			}
		});
		console.log(URL);
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
