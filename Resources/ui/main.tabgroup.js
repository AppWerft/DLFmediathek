'use strict';
// find . -type f -name "*.png" -exec convert {} -strip {} \;

var TiPermissions = require('vendor/permissions');

module.exports = function() {

	var tabs = [Ti.UI.createTab({
		title : 'Mediathek',
		ndx : 0,
		window : require('ui/mediathek.window')()
	}), Ti.UI.createTab({
		title : 'Podcasts',
		window : require('ui/podcast/main.window')(),
		ndx : 1,
	}), Ti.UI.createTab({
		title : 'DLF24',
		window : require('ui/dlf24/index.window')(),
		ndx : 2,
	})];
	tabs.forEach(function(tab) {
		tab.addEventListener("selected", function() {
			Ti.App.Properties.setInt("seltab", tab.ndx);
		});
	});

	var $ = Ti.UI.createTabGroup({
		fullscreen : false,
		swipeable : false,
		backgroundColor : 'transparent',
		exitOnClose : true,
		tabs : tabs,
		activeTab : tabs[Ti.App.Properties.getInt("seltab", 2)],
		smoothScrollOnTabClick : true,
		theme : 'Theme:Dlrmediathek'
	});
	$.addEventListener('open', require('ui/tab.menu'));

	setTimeout(function() {
		TiPermissions.requestPermissions(['READ_PHONE_STATE', 'WRITE_EXTERNAL_STORAGE'], function(success) {
			success && $.open();
			success || alert('Sie müssen den Berechtigungen zustimmen damit das Radio bei eingehenden Telefon stummschaltet und damit Beiträge auf der SD-Karte abgespeichert werden können.');
		});
	}, 2000);
	/*
	 $.addEventListener("android:back", function(_e) {
	 _e.cancelBubble = true;
	 var intent = Ti.Android.createIntent({
	 action : Ti.Android.ACTION_MAIN,
	 flags : Ti.Android.FLAG_ACTIVITY_NEW_TASK
	 });
	 intent.addCategory(Ti.Android.CATEGORY_HOME);
	 Ti.Android.currentActivity.startActivity(intent);
	 return false;
	 });
	 */
};
