var Flip = require('de.manumaticx.androidflip');
var АктйонБар = require('com.alcoapps.actionbarextras');
var Moment = require("vendor/moment");
var PAGES = 7;
var themen = require("model/nova");

module.exports = function(_thema) {
	var activityworking = false;
	var $ = Ti.UI.createWindow({
       fullscreen : false,
       layout : "vertical"
    });
    var image = "/images/podcasts/banner/" + _thema + ".jpg";
    console.log(image);
    $.add(Ti.UI.createImageView({
    	top:79,
    	image: image,
    	height:"auto"
    }));
	$.addEventListener('open', function(_event) {
		АктйонБар.title = "DLF nova";
		АктйонБар.subtitle = themen[_thema].title;
		АктйонБар.titleFont = "ScalaSansBold";
		АктйонБар.setBackgroundColor("#444	");
		АктйонБар.subtitleColor = "#ccc";
		АктйонБар.setStatusbarColor(themen[_thema].color);
		var activity = _event.source.getActivity();
		if (activity) {
			activity.onCreateOptionsMenu = function() {
				activity.actionBar.displayHomeAsUp = true;
			};
			activity.actionBar.onHomeIconItemSelected = function() {
				$.close();
			};
			activity.invalidateOptionsMenu();
		}
	});
	
	var activityworking = false;
	function onClickFn(_e) {
		var data = JSON.parse(_e.itemId);
				require('ui/audioplayer.window').createAndStartPlayer({
				color : '#000',
				url : data.link,
				duration : data.duration,
				title : data.sendung,
				subtitle : data.title,
				station : 'drw',
				image : data.image,
				pubdate : data.pubdate || 'unbekannt'
			});
	}

	$.hideCurrent = function() {

	};
	var sections = [];
	for (var i = 0; i < PAGES; i++)
		sections.push(Ti.UI.createListSection());
	$.mainlist = Ti.UI.createListView({
		top : 2,
		templates : {
			'novathema' : require('TEMPLATES').novathema,
		},
		defaultItemTemplate : 'novathema',
		sections : sections
	});

	$.refreshView = require('com.rkam.swiperefreshlayout').createSwipeRefresh({
		view : $.mainlist,
		top : 0,
		backgroundColor : themen[_thema].color
	});

	$.refreshView.addEventListener('refreshing', function() {
		setTimeout(function() {
			$.refreshView.setRefreshing(false);
		}, 20*1000);
		$.updateMediathekList();
	});
	$.add($.refreshView);
	var dataItems = [];
	var lastPubDate = null;
	var currentMediathekHash = null;
	/* hiding of todays display */
	$.updateMediathekList = function() {
		$.refreshView.setRefreshing(true);
		setTimeout(function() {
			$.refreshView.setRefreshing(false);
		}, 3000);
		for (var ndx = 0; ndx < PAGES; ndx++) {
			require('controls/nova/adapter')(ndx, _thema, function(_sendungen, _ndx) {
				$.refreshView.setRefreshing(false);
				$.mainlist.sections[_ndx].setItems(require("ui/nova/index.row")(_sendungen));
			});
		}
	};
	var locked = false;
	Ti.App.addEventListener('app:state', function(_payload) {
		activityworking = _payload.state;
	});
	$.updateMediathekList();
	
	$.mainlist.addEventListener("itemclick", onClickFn);
	$.addEventListener("close", function() {
		$.mainlist.removeEventListener("itemclick", onClickFn);
	});
	
	$.open();
};
