! function() {
	
	
	//require('controls/earlybird.adapter')();
	var Moment = require('vendor/moment');
	//require('controls/wurfsendung.import')(240);
	var self = Ti.UI.createTabGroup({
		fullscreen : true,
		swipeable : false,
		exitOnClose : true,
		smoothScrollOnTabClick : true,
		orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT],
		tabs : [Ti.UI.createTab({
			title : 'Mediathek',
			ndx : 0,
			window : require('ui/mediathek.window')()
		}), Ti.UI.createTab({
			title : 'Podcasts',
			ndx : 1,
		})]
	});
	self.addEventListener('open', require('ui/streamer.menu'));

	['podcasttiles'].forEach(function(win, ndx) {
		setTimeout(function() {
			self.tabs[ndx + 1].setWindow(require('ui/'+ win+ '.window')());
		}, ndx * 5000);
	});
	setInterval(function() {
		var today = Moment().format('YYYYMMDD');
		var lastday = Ti.App.Properties.getString('LASTDAY', '');
		if (lastday != today) {
			Ti.App.Properties.setString('LASTDAY', today);
			Ti.App.fireEvent('daychanged');
		}
	}, 1000 * 60);
	self.open();
	self.setActiveTab(0);
	var tools = require('bencoding.android.tools');
	require('vendor/cronservice.trigger')();
	self.addEventListener("android:back", function(_e) {//listen for the back-button-tap event
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
