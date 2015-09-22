var Model = require('model/stations'),
    RSS = new (require('controls/rss.adapter'))(),
    Moment = require('vendor/moment'),
    FlipModule = require('de.manumaticx.androidflip'),
    АктйонБар = require('com.alcoapps.actionbarextras');
;

module.exports = function() {
	var self = Ti.UI.createWindow({
		backgroundColor : 'gray',
		fullscreen : true
	});
	self.addEventListener('open', function(_event) {
		

		АктйонБар.title = 'DeutschlandRadio';
		АктйонБар.subtitle = 'Tagesübersicht';
		АктйонБар.titleFont = "Aller Bold";
		АктйонБар.subtitleColor = "#ccc";
		АктйонБар.setBackgroundColor('#444444');

		var activity = _event.source.getActivity();
		if (activity) {
			console.log('activity');
			activity.onCreateOptionsMenu = function(_menuevent) {
				activity.actionBar.displayHomeAsUp = true;

				activity.actionBar.onHomeIconItemSelected = function() {
					self.close();
				};
			};
			activity.invalidateOptionsMenu();
		}
		var pages = [];
		['dlf', 'drk'].forEach(function(station) {
			pages.push(require('ui/dayplan.page')(station));
		});

		self.FlipViewCollection = FlipModule.createFlipView({
			orientation : FlipModule.ORIENTATION_HORIZONTAL,
			overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
			views : pages,
			top : 0,
			currentPage : Ti.App.Properties.getInt('LAST_STATION_NDX', 0) % 2,
			height : Ti.UI.FILL
		});
		self.add(self.FlipViewCollection);
	});
	return self;
};

