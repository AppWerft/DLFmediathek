! function() {
	var self = Ti.UI.createTabGroup({
		fullscreen : false,
		swipeable : false,
		backgroundColor:'transparent',
		exitOnClose : true,
		smoothScrollOnTabClick : true,
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
	self.open();
	
	['podcasttiles'].forEach(function(win, ndx) {
		setTimeout(function() {
			self.tabs[ndx + 1].setWindow(require('ui/'+ win+ '.window')());
		}, ndx * 5000);
	});
	/*setInterval(function() {
		Ti.App.fireEvent('daychanged');
	}, 1000 * 6);*/
	
	self.setActiveTab(0);
	/* start background service: */
	//require('vendor/cronservice.trigger')();
	//listen for the back-button-tap event
	self.addEventListener("android:back", function(_e) {
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
