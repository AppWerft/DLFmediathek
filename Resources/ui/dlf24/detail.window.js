var Flip = require('de.manumaticx.androidflip');
var АктйонБар = require('com.alcoapps.actionbarextras');
var Moment = require("vendor/moment");
var lila="#461C9C";
module.exports = function(_e) {
	var $ = Ti.UI.createWindow({
       fullscreen : false
    });
	$.addEventListener('open', function(_event) {
		АктйонБар.title = "DLF24";
		АктйонБар.subtitle = "Meldungen vom " + Moment().format("LL");
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
	
	require("controls/dlf24").getNewsList(function(_res) {
		var currentPage = 0;
		for (var i = 0; i < _res.items.length; i++) {
			if (_res.items[i].link == _e.itemId)
				currentPage = i;
		}
		$.add(Flip.createFlipView({
			top : 74,
			currentPage : currentPage,
			orientation : "horizontal",
			overFlipMode : Flip.OVERFLIPMODE_GLOW,
			views : _res.items.map(require("ui/dlf24/detail.page"))
		}));
		$.children[0].peakNext(true);
	});
	$.open();
};
