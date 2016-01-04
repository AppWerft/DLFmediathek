var АктйонБар = require('com.alcoapps.actionbarextras');

module.exports = function(_args) {
	var self = Ti.UI.createWindow({
		fullscreen : false,
		backgroundColor : require('model/stations').drw.color
	});
	var sections = [];
	for (var i = 0; i < 10; i++) {
		sections[i] = Ti.UI.createListSection({});
	}
	self.list = Ti.UI.createListView({
		templates : {
			'template' : require('TEMPLATES').earlybird,
		},
		defaultItemTemplate : 'template',
		sections : sections
	});
	self.list.addEventListener('itemclick', function(_e) {
		var data = JSON.parse(_e.itemId);
		Ti.UI.createNotification({
			message : 'Bildquelle:\n' + (data.copy || 'k.A.'),
			top : '50%'
		}).show();
		require('ui/audioplayer.window').createAndStartPlayer({
			color : '#000',
			url : data.mp3,
			duration : data.duration,
			title : 'Earlybird',
			subtitle : data.title,
			station : 'drw',
			image : data.image,
			pubdate : data.pubdate
		});
	});
	self.add(self.list);
	self.addEventListener('open', function(_event) {
		Ti.UI.createNotification({
			message : 'Hole Liste der Earlybirds vom Server'
		}).show();

		АктйонБар.title = 'DRadio Wissen';
		АктйонБар.subtitle = 'Earlybird';
		АктйонБар.titleFont = "ScalaSansBold";
		АктйонБар.setBackgroundColor('#444444');
		АктйонБар.subtitleColor = "#ccc";
		var activity = _event.source.getActivity();
		if (activity) {
			activity.actionBar.logo = '/images/drw.png';
			activity.onCreateOptionsMenu = function(_menuevent) {
				activity.actionBar.displayHomeAsUp = true;
			};
			activity.actionBar.onHomeIconItemSelected = function() {
				self.close();
			};
			activity.invalidateOptionsMenu();
		}
		require('controls/earlybird.adapter')(function(_i, _res) {
			self.list.sections[_i].items = _res.map(function(bird) {
				return {
					properties : {
						itemId : JSON.stringify(bird)
					},
					image : {
						image : bird.image
					},
					description : {
						text : bird.title
					}
				};
			});

		});
	});
	return self;
};
