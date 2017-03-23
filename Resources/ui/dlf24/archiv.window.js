var АктйонБар = require('com.alcoapps.actionbarextras'),
    Moment = require("vendor/moment"),
    Lottie = require("ti.animation"),
    lastNews = null;

var LottieView = Ti.UI.createView({
	backgroundColor : "#6000",
	touchEnabled : false,
	pubbleParent : false,
	zIndex : 998
});
LottieView.add(Lottie.createLottieView({
	file : '/images/gears.json',
	loop : true,
	width : 320,
	height : 320,
	zIndex : 999,
	touchEnabled : false,
	autoStart : true
}));

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
		console.log("DLF >>>>>>>>>>START>>>>>>>>>>>>>>>>>>>>>");
		require("controls/dlf24").getNewsList(function(_res) {

			console.log("DLF >>>>>>>state=" + _res.state + "  rest=" + _res.unresolved);
			if (_res.unresolved > 0 && _res.state == 1) {
				console.log("DLF we need patience ………");
				locked = true;
				$.add(LottieView);
			} else {
				console.log("DLF ende ………");
				$.remove(LottieView);
				locked = false;
			}
			$.container.setRefreshing(false);
			if (_res.items) {
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
								text : _item.shorttext.replace(/<a.*?>/gm, "").replace(/<\/a>/gm, "")
							},
							aufmacher : {
								image : _item.aufmacher || undefined
							}
						};
					})
				})]);
			} else
				console.log("DLF ERROR: no items in feed");
		}, true);
	}


	$.listView.addEventListener("itemclick", require("ui/dlf24/detail.window"));
	var floatView = Ti.UI.createView({
		width : 60,
		height : 60,
		borderRadius : 30,
		backgroundColor : require('model/stations').dlf.color,
		bottom : 30,
		right : 30,
		backgroundImage : "/images/playiconframe.png"
	});
	var archiveButton = Ti.UI.createButton({
		width : 60,
		height : 60,
		borderRadius : 30,
		backgroundColor : require('model/stations').dlf.color,
		bottom : 30,
		width : 200,
		opacity : 1,
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
				opacity : 1
			});
		}
	});
	$.listView.addEventListener("scrollstart", function() {
		floatView.transform = Ti.UI.create2DMatrix({
			scale : 0.01
		});
		archiveButton.animate({
			opacity : 0
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
