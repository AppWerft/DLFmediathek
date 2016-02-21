module.exports = function() {
	if (!Ti.App.Properties.	hasProperty('MOD1')) {
		var dialog = Ti.UI.createAlertDialog({
			message : 'Seit der letzten Marshmellow-Version ist das Problem aufgetreten, dass nach einer gewissen Zeit des LiveRadios die Oberfläche einfriert.\n\nWir arbeiten intensiv dran und werden alsbaldigst eine neue bereinigte Version vom Stapel lassen.',
			ok : 'Ok',
			title : 'Abbitte'
		});
		dialog.show();
		Ti.App.Properties.setString('MOD1','1');
	}
};
