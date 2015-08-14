! function() {
	var Moment = require('vendor/moment');
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
		}), Ti.UI.createTab({
			ndx : 2,
			title : 'Tagesplan',
		})]
	});
	self.addEventListener('open', require('ui/main.menu'));

	['podcasttiles', 'dayplan'].forEach(function(win, ndx) {
		setTimeout(function() {
			self.tabs[ndx + 1].setWindow(require('ui/'+ win+ '.window')());
		}, ndx * 700);
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
}();
