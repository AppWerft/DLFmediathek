'use strict';
// find . -type f -name "*.png" -exec convert {} -strip {} \;

module.exports = function() {

	if (Ti.Network.online) {
		var $ = Ti.UI.createTabGroup({
			fullscreen : false,
			swipeable : false,
			backgroundColor : 'transparent',
			exitOnClose : true,
			smoothScrollOnTabClick : true,
			theme : 'Theme:Dlrmediathek'
		});
		$.addTab(Ti.UI.createTab({
			title : 'Mediathek',
			ndx : 0,
			window : require('ui/mediathek.window')()
		}));
		$.addTab(Ti.UI.createTab({
			title : 'Podcasts',
			window : require('ui/podcastcardviews.window')(),
			ndx : 1,
		}));
		$.addEventListener('open', require('ui/tab.menu'));
	} else {
		var $ = require('ui/recents.window')({
			exitOnClose : true
		});
	}
	var TiPermissions = require('vendor/permissions');
	TiPermissions.requestPermissions(['READ_PHONE_STATE', 'WRITE_EXTERNAL_STORAGE'], function(success) {
		success && $.open();
		success || alert('Sie müssen den Berechtigungen zustimmen damit das Radio bei eingehenden Telefon stummschaltet und damit Beiträge auf der SD-Karte abgespeichert werden können.');
	});
	
	/*$.addEventListener("android:back", function(_e) {
	 _e.cancelBubble = true;
	 var intent = Ti.Android.createIntent({
	 action : Ti.Android.ACTION_MAIN,
	 flags : Ti.Android.FLAG_ACTIVITY_NEW_TASK
	 });
	 intent.addCategory(Ti.Android.CATEGORY_HOME);
	 Ti.Android.currentActivity.startActivity(intent);
	 return false;
	 });*/

};
