var Model = require('model/stations'),
   
    Moment = require('vendor/moment'),
    FlipModule = require('de.manumaticx.androidflip'),
    АктйонБар = require('com.alcoapps.actionbarextras');
stations = ['dlf', 'drk'];

module.exports = function(_args) {
	var self = Ti.UI.createWindow({
		fullscreen : false
	});
	self.addEventListener('open', function(_event) {
		АктйонБар.title = Model[_args.station].name;
		АктйонБар.subtitle = 'Tagesübersicht';
		АктйонБар.titleFont = "Aller Bold";
		АктйонБар.subtitleColor = "#ccc";
		АктйонБар.setBackgroundColor('#444444');
		АктйонБар.setStatusbarColor(Model[_args.station].color);
		var activity = _event.source.getActivity();
		if (activity) {

			activity.onCreateOptionsMenu = function(_menuevent) {
				activity.actionBar.displayHomeAsUp = true;

				activity.actionBar.onHomeIconItemSelected = function() {
					self.close();
				};
			};
			activity.invalidateOptionsMenu();
		}
		var pages = [];
		stations.forEach(function(station) {
			pages.push(require('ui/dayplan.page')(station));
		});

		self.FlipViewCollection = FlipModule.createFlipView({
			orientation : FlipModule.ORIENTATION_HORIZONTAL,
			overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
			views : pages,
			top : 80,
			currentPage : _args && _args.station == 'dlf' ? 0 : 1,
			height : Ti.UI.FILL
		});
		self.add(self.FlipViewCollection);
		self.FlipViewCollection.addEventListener('flipped', function(_e) {
			АктйонБар.setStatusbarColor(Model[stations[_e.index]].color);
			АктйонБар.setTitle(Model[stations[_e.index]].name);
		});
	});
	return self;
};

