! function() {
	
	var $ = Ti.UI.createTabGroup({
		fullscreen : false,
		swipeable : false,
		backgroundColor : 'transparent',
		exitOnClose : true,
		smoothScrollOnTabClick : true,
		tabs : [Ti.UI.createTab({
			title : 'Mediathek',
			ndx : 0,
			window : require('ui/mediathek.window')()
		}), Ti.UI.createTab({
			title : 'Podcasts',
			window : require('ui/podcasttiles.window')(),
			ndx : 1,
		})]
	});
	$.addEventListener('open', require('ui/tab.menu'));
	$.open();
	require('vendor/versionsreminder')();
	//require('vendor/mod')();

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
}(); 