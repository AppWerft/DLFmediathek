var АктйонБар = require('com.alcoapps.actionbarextras');
var Moment = require("vendor/moment");
var DLF24_URL = "http://www.deutschlandfunk.de/die-nachrichten.353.de.rss?_=";
var lastNews = null;

module.exports = function() {
	var $ = Ti.UI.createWindow({
		fullscreen : false,
		top : 0,
		backgroundColor : require('model/stations').dlf.color
	});
	$.listView = Ti.UI.createListView({
		templates : {
			'template' : require('TEMPLATES').dlf24,
		},
		defaultItemTemplate : 'template',
		sections : [Ti.UI.createListSection()],
		top : 125
	});
	$.container = require('com.rkam.swiperefreshlayout').createSwipeRefresh({
		view : $.listView,
		top : 128
	});
	$.container.addEventListener('refreshing', updateList);
	$.add($.container);

	function updateList() {
		getLastURL(function(_item) {
			if (_item) {
				lastNews = _item;
				Ti.UI.createNotification({
					message : "Letzte Sendung: " + Moment(_item.pubDate).format("HH:mm") + " Uhr"
				}).show();
			} else
				lastNews = null;
		});
		$.container.setRefreshing(true);
		require("de.appwerft.podcast").loadPodcast({
			url : DLF24_URL + Math.random(),
			timeout : 10000
		}, function(_e) {
			$.container.setRefreshing(false);
			if (_e.items) {
				var todos = [];
				var dataitems= _e.items.map(function(_item, _ndx) {
					var item = require("controls/dlf24").getNewsItem(_item.link);
					if (item != null) {
						return {
							properties : {
								accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE,
								itemId : _item.link
							},
							title : {
								text : item.title || _item.title
							},
							overline : {
								text : item.overline
							},
							shorttext : {
								text : item.shorttext || _item.description.replace(/<a.*?\/a>/,"")
							},
							aufmacher : {
								image : item.aufmacher ||  "/images/dlf24.jpeg"
							}
						};
					} else {
						item = _item;
						todos.push({
							ndx : _ndx,
							url : _item.link
						});
						return {
							properties : {
								accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_NONE,
								itemId : _item.link
							},
							overline : {
								text : item.overline
							},
							title : {
								text : item.title
							},
							shorttext : {
								text : item.description.replace(/<a.*?\/a>/,"")
							},
							
							aufmacher : {
								image : "/images/dlf24.jpeg"
							}
						};
					}
				});
				$.listView.sections[0].setItems(dataitems);
				console.log(todos);
				_e.items.forEach(function(_item, ndx) {
					return;
					var section = $.listView.sections[0];
					var item = section.getItemAt(ndx);
					if (item.properties.accessoryType == Ti.UI.LIST_ACCESSORY_TYPE_NONE) {
						var url = item.properties.itemId;
						require("controls/dlf24").getNewsItem(url, function(e) {
							item.aufmacher.image = e.aufmacher;
							item.shorttext.shorttext = e.shorttext;
							item.shorttext.title = e.title;
							item.properties.accessoryType == Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE;
							section.updateItemAt(ndx, item);
						});
					}
				});
			} else
				console.log("ERROR: no items in feed");
		});
	}


	$.listView.addEventListener("itemclick", require("ui/dlf24detail.window"));
	var floatView = Ti.UI.createView({
		width : 60,
		height : 60,
		borderRadius : 30,
		backgroundColor : require('model/stations').dlf.color,
		bottom : 30,
		right : 30,
		backgroundImage : "/images/playiconframe.png"
	});
	$.addEventListener('open', function(_event) {
		updateList();
		АктйонБар.setStatusbarColor(require('model/stations').dlf.color);
		$.add(floatView);
	});

	$.listView.addEventListener("scrollend", function() {
		floatView && floatView.animate({
			duration : 200,
			transform : Ti.UI.create2DMatrix({
				scale : 1
			})
		});
	});
	$.listView.addEventListener("scrollstart", function() {
		floatView.transform = Ti.UI.create2DMatrix({
			scale : 0.01
		});
	});
	floatView.addEventListener("click", function() {
		var parts = lastNews.duration.split(":");
		var duration = parseInt(parts[0]) * 60 + parseInt(parts[1]);
		require('ui/audioplayer.window').createAndStartPlayer({
			color : require('model/stations').dlf.color,
			url : lastNews.link,
			storage : 'cache',
			duration : duration,
			title : lastNews.title,
			subtitle : "Neueste Nachrichten aus der Redaktion\n" + Moment(lastNews.pubDate).format("HH:mm") + " Uhr",
			author : lastNews.author,
			station : "dlf",
			pubdate : lastNews.pubDate
		});
	});
	return $;
};

function getLastURL(_cb) {
	require("de.appwerft.podcast").loadPodcast({
		url : "http://www.deutschlandfunk.de/podcast-nachrichten.1257.de.podcast.xml?_=" + Math.random(),
		timeout : 10000,
		userAgent : "Mozilla/5.0 (Macintosh; Intel Mac OS X 20.10; rv:46.0) Gecko/20100101 Firefox/46.0"
	}, function(_e) {
		_cb(_e.items[0]);
	});
}
