var Flip = require('de.manumaticx.androidflip'),
    Moment = require("vendor/moment"),
    lila = "#461C9C",
    DLF24controler = require("controls/dlf24konsole"),
    createDetailPage = require("ui/dlf24/detail.page");

module.exports = function(_e) {
	var  АктйонБар = require('com.alcoapps.actionbarextras');
	var currentPageIndex = 0;
	var numberOfPages;
	var $ = Ti.UI.createWindow({
		fullscreen : false,
		backgroundColor : lila
	});
	function getSubtitle() {
		return "Meldungen vom " + Moment().format("LL") + "   (" + (currentPageIndex + 1) + "/" + numberOfPages + ")";
	}

	function setSubtitle() {
		АктйонБар.subtitle = getSubtitle();
	}


	$.addEventListener('open', function(_event) {
		АктйонБар.title = "DLF24";

		АктйонБар.titleFont = "ScalaSansBold";
		АктйонБар.setBackgroundColor("#333");
		АктйонБар.subtitleColor = "#ccc";
		АктйонБар.setStatusbarColor(lila);
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
	var oldtime = (new Date()).getTime();
	DLF24controler.getNewsList(null, function(_res) {
		console.log((new Date()).getTime() - oldtime);
		numberOfPages = _res.items.length;
		setSubtitle();
		console.log((new Date()).getTime() - oldtime);
		function fillContent(ndx) {
			[-1, 0, +1, +2].forEach(function(Δ) {
				// unfilled and in range:
				var i = ndx + Δ;
				if (i >= 0 && i < views.length && views[i].children.length == 0)
					views[i].add(createDetailPage(_res.items[i]));
			});
		}

		for (var i = 0; i < _res.items.length; i++) {
			_res.items[i].rendered = false;
			if (_res.items[i].link == _e.itemId)
				currentPageIndex = i;
		}
		var len = _res.items.lenght;
		var views = [];
		for (var i = 0; i < _res.items.length; i++) {
			views[i] = Ti.UI.createView();
		}
		console.log((new Date()).getTime() - oldtime);
		$.flipView = Flip.createFlipView({
			top : 0,
			currentPage : currentPageIndex,
			orientation : "horizontal",
			overFlipMode : Flip.OVERFLIPMODE_GLOW,
			views : views//_res.items.map(require("ui/dlf24/detail.page"))
		});
		$.add($.flipView);
		fillContent(currentPageIndex);
		$.flipView.peakNext(true);
		$.flipView.addEventListener("flipped", function(event) {
			currentPageIndex = $.flipView.currentPage;
			setSubtitle();
			fillContent(currentPageIndex);
		});
		console.log((new Date()).getTime() - oldtime);
	});
	$.open({
		activityEnterAnimation : Ti.Android.R.anim.slide_in_right,
		activityExitAnimation : Ti.Android.R.anim.slide_out_left
	});
};
