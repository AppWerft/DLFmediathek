// find . -type f -name "*.png" -exec convert {} -strip {} \;

module.exports = function() {
	var $ = Ti.UI.createTabGroup({
		fullscreen : false,
		swipeable : false,
		backgroundColor : 'transparent',
		exitOnClose : true,
		smoothScrollOnTabClick : true

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
	var TiPermissions = require('ti.permissions');
	TiPermissions.requestPermissions(['android.permission.READ_PHONE_STATE', 'android.permission.WRITE_EXTERNAL_STORAGE'], function(e) {
		e.success && $.open();
		e.success || alert('Sie müssen den Berechtigungsanfragen zustimmen damit das Radio bei eingehenden Telefon stummschaltet und damit Beiträge auf der SD-Karte abgespeichert werden können.');
	});
	//require('vendor/versionsreminder')();
	//require('vendor/cronservice.trigger')();
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
};
