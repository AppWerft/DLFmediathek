
var    Moment = require("vendor/moment");
var DAYS = 2;
var Adapter = require("controls/dlf24konsole");

module.exports = function() {
	var АктйонБар = require('com.alcoapps.actionbarextras');
	var lastSubtitle;
	var $ = Ti.UI.createWindow({
		fullscreen : false,
		top : 0,
		backgroundColor : "#461C9C"
	});
	var sections = [];
	Ti.Media.vibrate([30, 30]);
	for (var i = 1; i < DAYS; i++)
		sections.push(Ti.UI.createListSection({
			date : Moment().subtract(i, "days").format("YYYY-MM-DD"),
			datum : Moment().subtract(i, "days").format("LL"),

		}));
	$.listView = Ti.UI.createListView({
		templates : {
			'template' : require('TEMPLATES').dlf24,
		},
		defaultItemTemplate : 'template',
		sections : sections,
		top : 80
	});
	function scrollEndFn(event) {
		var currentSectionsLength = $.listView.getSections().length;
		АктйонБар.subtitle = "Archiv vom " + event.firstVisibleSection.datum;
		console.log(event.firstVisibleSectionIndex + "     "+ (currentSectionsLength - 1));
		if (event.firstVisibleSectionIndex == currentSectionsLength - 1) {
			АктйонБар.subtitle = "Archiv (nachladend …)";
			var lastoldestdate = $.listView.sections[$.listView.sections.length - 1].date;
			var nextday = Moment(lastoldestdate).add(-1, "days");
			Adapter.getNewsList(nextday.format("YYYY-MM-DD"), function(result) {
				$.listView.appendSection(Ti.UI.createListSection({
					date : nextday.format("YYYY-MM-DD"),
					datum : nextday.format("LL"),
					items : require("ui/dlf24/item")(result.items)
				}));
				АктйонБар.subtitle = "Archiv vom "+ nextday.format("LL");
			});
		}
	}

	function scrollStartFn(event) {
		
	}


	$.listView.addEventListener("scrollend", scrollEndFn);
	$.listView.addEventListener("scrollstart", scrollStartFn);
	$.add($.listView);

	function initContentOfList() {
		sections.forEach(function(section) {
			Adapter.getNewsList(section.date, function(result) {
				section.items = require("ui/dlf24/item")(result.items);
			});
		});
	}


	$.listView.addEventListener("itemclick", require("ui/dlf24/archivdetail.window"));
	$.addEventListener('close', function(_event) {
		АктйонБар.subtitle = "Letzte Meldungen";
	});	
	$.addEventListener('open', function(_event) {
		lastSubtitle = АктйонБар.subtitle;
		АктйонБар.title = "DLF24";
		АктйонБар.subtitle = "Archiv vom " + Moment().add(-1, "days").format("LL");
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
		initContentOfList();
	});
	$.open({
		activityEnterAnimation : Ti.Android.R.anim.slide_in_left,
		activityExitAnimation : Ti.Android.R.anim.slide_out_right
	});

};

