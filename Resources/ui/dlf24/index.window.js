var АктйонБар = require('com.alcoapps.actionbarextras'),
    Moment = require("vendor/moment"),
    DLF24controler = require("controls/dlf24");
lastNews = null,
ROWS_IN_VIEWPORT = 2;

module.exports = function() {
	var locked = false;
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

	function updateList(forced, offset, limit) {
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
		var LottieView = require("ui/lottie.widget")();
		$.add(LottieView);
		DLF24controler.getNewsList(function(_res) {
			$.container.setRefreshing(false);
			$.remove(LottieView);
			if (true == _res.changed && _res.items) {
				$.listView.setSections([Ti.UI.createListSection({
					headerTitle : "Heutige Nachrichten (" + Moment().format("LL") + ")",
					items : _res.items.map(function(_item, _ndx) {
						return {
							properties : {
								accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_NONE,
								itemId : _item.link
							},
							title : {
								text : _item.title
							},
							shorttext : {
								text : _item.shorttext
							},
							aufmacher : {
								image : _item.aufmacher || undefined
							}
						};
					})
				})]);
			} else
				console.log("DLF ERROR: no items in feed");
		}, forced, offset, limit);
	}


	$.listView.addEventListener("itemclick", require("ui/dlf24/detail.window"));
	var floatView = Ti.UI.createView({
		width : 60,
		height : 60,
		borderRadius : 30,
		backgroundColor : require('model/stations').dlf.color,
		bottom : 30,
		right : 20,
		backgroundImage : "/images/playiconframe.png"
	});
	var archiveButton = Ti.UI.createButton({
		width : 60,
		height : 60,
		borderRadius : 30,
		backgroundColor : require('model/stations').dlf.color,
		bottom : 30,
		width : 180,
		color : "white",
		font : {
			fontSize : 20,
			fontWeight : "bold"
		},
		title : "Archiv"
	});
	$.addEventListener('open', function(_event) {
		АктйонБар.setStatusbarColor(require('model/stations').dlf.color);
		$.add(floatView);
		$.add(archiveButton);
	});

	$.listView.addEventListener("scrollend", function(e) {
		floatView && floatView.animate({
			duration : 200,
			transform : Ti.UI.create2DMatrix({
				scale : 1
			})
		});
		if (e.visibleItemCount + e.firstVisibleItemIndex >= e.source.sections[0].items.length) {
			archiveButton.animate({
				bottom : 30
			});
		}
		// all rows in viewport:
		var ndxList = [];
		for (var i = e.firstVisibleItemIndex; i < e.firstVisibleItemIndex + e.visibleItemCount; i++) {
			ndxList.push(i);
		}
		ndxList.forEach(function(ndx) {
			// getting the item
			var item = $.listView.sections[0].getItemAt(ndx);
			if (item) {
				var url = item.properties.itemId;
				DLF24controler.getNewsItem(url, function(res) {
					item.aufmacher.image = res.aufmacher || undefined;
					$.listView.sections[0].updateItemAt(ndx, item);
				}, /*forced*/false);
			}
		});
		//	updateList(false, e.firstVisibleItemIndex, e.visibleItemCount);
	});
	$.listView.addEventListener("scrollstart", function() {
		floatView.transform = Ti.UI.create2DMatrix({
			scale : 0.01
		});
		archiveButton.animate({
			bottom : -100
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
	archiveButton.addEventListener("click", require("ui/dlf24/archiv.window"));

	$.addEventListener("focus", updateList);
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
