var АктйонБар = require('com.alcoapps.actionbarextras');
const PAGES = 5;

var EarlyBirdAdapter = require('controls/earlybird.adapter');

module.exports = function(_args) {
	function getPayload(_section, ndx) {
		EarlyBirdAdapter($, ndx, function(_itemsList) {
			_section.items = _itemsList.map(function(bird) {
				return {
					properties : {
						itemId : JSON.stringify(bird)
					},
					image : {
						image : encodeURI(bird.image)
					},
					description : {
						text : bird.title
					}
				};
			});
		});
	}

	var $ = Ti.UI.createWindow({
		fullscreen : false,
		backgroundColor : require('model/stations').drw.color
	});
	setTimeout(function() {
		var sections = [];
		for (var i = 0; i < PAGES; i++) {
			sections[i] = Ti.UI.createListSection({});
		}
		$.listView = Ti.UI.createListView({
			templates : {
				'template' : require('TEMPLATES').earlybird,
			},
			defaultItemTemplate : 'template',
			sections : sections,
			top : 79
		});
		$.listView.addEventListener('itemclick', function(_e) {
			var data = JSON.parse(_e.itemId);
/*			Ti.UI.createNotification({
				message : 'Bildquelle:\n' + (data.copy || 'k.A.'),
				top : '50%'
			}).show();*/
			console.log(data);
			require('ui/audioplayer.window').createAndStartPlayer({
				color : '#000',
				url : data.mp3,
				duration : data.duration,
				title : 'Earlybird',
				subtitle : data.title,
				station : 'drw',
				image : data.image,
				pubdate : data.pubdate || 'unbekannt'
			});
		});
		$.add($.listView);

	}, 10);
	$.addEventListener('open', function(_event) {
		Ti.UI.createNotification({
			message : 'Hole Liste der Earlybirds vom RadioServer'
		}).show();
		АктйонБар.title = 'DRadio Wissen';
		АктйонБар.subtitle = 'Earlybird';
		АктйонБар.titleFont = "ScalaSansBold";
		АктйонБар.setStatusbarColor('#FF01953C');
		АктйонБар.setBackgroundColor('#444444');
		АктйонБар.subtitleColor = "#ccc";
		var activity = _event.source.getActivity();
		if (activity) {
			activity.actionBar.logo = '/images/drw.png';
			activity.onCreateOptionsMenu = function(_menuevent) {
				activity.actionBar.displayHomeAsUp = true;
			};
			activity.actionBar.onHomeIconItemSelected = function() {
				$.close();
			};
			activity.invalidateOptionsMenu();
		}
		$.listView.getSections().forEach(getPayload);

	});
	return $;
};
