var Flip = require('de.manumaticx.androidflip');
var АктйонБар = require('com.alcoapps.actionbarextras');
var Moment = require("vendor/moment");

module.exports = function(_e) {
	var $ = Ti.UI.createWindow({
       fullscreen : false
    });
	$.addEventListener('open', function(_event) {
		АктйонБар.title = "DLF24";
		АктйонБар.subtitle = "Archiv-Meldungen";
		АктйонБар.titleFont = "ScalaSansBold";
		АктйонБар.setBackgroundColor("#444	");
		АктйонБар.subtitleColor = "#ccc";
		АктйонБар.setStatusbarColor("#461C9C");
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
	
	require("controls/dlf24").getNewsItem(_e.itemId,function(_res) {
		$.add(require("ui/dlf24/detail.page")(_res));
	});
	$.open();
};
