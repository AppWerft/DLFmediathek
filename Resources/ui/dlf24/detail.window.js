var Flip = require('de.manumaticx.androidflip'),
    АктйонБар = require('com.alcoapps.actionbarextras'),
    Moment = require("vendor/moment"),
    lila = "#461C9C",
    DLF24controler = require("controls/dlf24konsole");

module.exports = function(_e) {
	var currentPage = 0;
	var numberOfPages;
	var $ = Ti.UI.createWindow({
		fullscreen : false
	});
	function getSubtitle() {
		return "Meldungen vom " + Moment().format("LL") + "   (" + (currentPage+1) + "/"+ numberOfPages+ ")";
	}
	function setSubtitle() {
		АктйонБар.subtitle= getSubtitle();
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
	
	DLF24controler.getNewsList(null, function(_res) {
		numberOfPages = _res.items.length;
		setSubtitle();
		for (var i = 0; i < _res.items.length; i++) {
			if (_res.items[i].link == _e.itemId)
				currentPage = i;
		}
		$.flipView = Flip.createFlipView({
			top : 80,
			currentPage : currentPage,
			orientation : "horizontal",
			overFlipMode : Flip.OVERFLIPMODE_GLOW,
			views : _res.items.map(require("ui/dlf24/detail.page"))
		});
		$.add($.flipView);
		$.flipView.peakNext(true);
		$.flipView.addEventListener("flipped",function(event){
			currentPage = $.flipView.currentPage;
			setSubtitle();
		});
	});
	$.open();
};
