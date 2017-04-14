var АктйонБар = require('com.alcoapps.actionbarextras'),
    Moment = require("vendor/moment");

module.exports = function() {
	var $ = Ti.UI.createWindow({
		fullscreen : false,
		top : 0,
		backgroundColor : require('model/stations').dlf.color
	});
	Ti.Media.vibrate([30, 30]);
	$.listView = Ti.UI.createListView({
		templates : {
			'template' : require('TEMPLATES').dlf24,
		},
		defaultItemTemplate : 'template',
		sections : [Ti.UI.createListSection()],
		top : 80
	});
	$.add($.listView);
	function updateList() {
		require("controls/dlf24").getArchive(function(_items) {
			$.listView.setSections([Ti.UI.createListSection({
				headerTitle : "Archiv der letzten Woche",
				items : _items.map(function(_item, _ndx) {
					return {
						properties : {
							accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_NONE,
							itemId : _item.link
						},
						title : {
							text : _item.overline
						},
						shorttext : {
							text : _item.title
						},
						aufmacher : {
							height : 0
						}
					};
				})
			})]);

		}, true);
	}


	$.listView.addEventListener("itemclick", require("ui/dlf24/archivdetail.window"));
	$.addEventListener('open', function(_event) {
		АктйонБар.setStatusbarColor(require('model/stations').dlf.color);
	});
	$.addEventListener('open', function(_event) {
		АктйонБар.title = "DLF24";
		АктйонБар.subtitle = "Archiv  " + Moment().subtract(1, 'weeks').format("LL") + " –  " + Moment().format("LL");
		АктйонБар.titleFont = "ScalaSansBold";
		АктйонБар.setBackgroundColor("#444	");
		АктйонБар.subtitleColor = "#ccc";
		АктйонБар.setStatusbarColor(require('model/stations').dlf.color);
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
		updateList();
	});
	$.open({
		activityEnterAnimation : Ti.Android.R.anim.slide_in_left,
		activityExitAnimation : Ti.Android.R.anim.slide_out_right
	});

};

