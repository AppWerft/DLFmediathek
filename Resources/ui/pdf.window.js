var АктйонБар = require('com.alcoapps.actionbarextras');

module.exports = function(_args) {
	var self = Ti.UI.createWindow({
		fullscreen : false,
		backgroundColor : '#444',
	});
	self.list = Ti.UI.createTableView();
	self.list.addEventListener('click', function(_e) {
		Ti.UI.createNotification({
			message : 'Hole Programmplan vom Server'
		}).show();
		var httpclient = Ti.Network.createHTTPClient({
			onload : function() {
				var pdf = Ti.Filesystem.createTempFile();
				pdf.write(this.responseData);
				require('de.manumaticx.printmanager').print({
					url : pdf.nativePath
				});
			}
		});
		httpclient.open('GET', _e.row.itemId);
		httpclient.send();

	});
	self.add(self.list);
	self.addEventListener('open', function(_event) {
		Ti.UI.createNotification({
			message : 'Hole Liste der Programmpläne vom Server'
		}).show();
		require('controls/pdf.adapter')(function(_res) {
			self.list.setData(_res.map(require('ui/pdf.row')));
		});
		АктйонБар.title = 'Wochenprogrammübersichten';
		АктйонБар.subtitle = 'PDF zum Ausdrucken';
		АктйонБар.titleFont = "ScalaSansBold";
		АктйонБар.setBackgroundColor('#444444');
		АктйонБар.setStatusbarColor('#444444');
		АктйонБар.subtitleColor = "#ccc";
		var activity = _event.source.getActivity();
		if (activity) {
			activity.onCreateOptionsMenu = function(_menuevent) {
				activity.actionBar.displayHomeAsUp = true;
			};
			activity.actionBar.onHomeIconItemSelected = function() {
				self.close();
			};
			activity.invalidateOptionsMenu();
		}
	});
	return self;
};
