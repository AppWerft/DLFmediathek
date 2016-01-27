var alarmManager = require('bencoding.alarmmanager').createAlarmManager();
const FOLDER = 'RadioCache';

var service = Titanium.Android.currentService;
var id = service.serviceInstanceId;
var intent = service.intent;

var options = JSON.parse(intent.getStringExtra("options"));
var start = new Date().getTime();
if (Ti.Filesystem.isExternalStoragePresent())
	var DEPOT = Ti.Filesystem.externalStorageDirectory;
else
	var DEPOT = Ti.Filesystem.applicationDataDirectory;
var $ = Ti.Network.createHTTPClient({
	onload : function() {
		Ti.Filesystem.getFile(DEPOT, FOLDER, options.station, options.filename).write(this.responseData);
		console.log('Info: media saved !!!!!!!!!' + options.url);
		var duration = Math.round((new Date().getTime() - start) / 1000);
		var mb = (this.responseData.length / 1000000).toFixed(1);
		var speed = this.responseData.length / (new Date().getTime() - start);
		alarmManager.addAlarmNotification({
			requestCode : 3,
			second : 1,
			contentTitle : 'DLR Mediathek',
			contentText : 'Beitrag synchronisiert (' + mb + ' MB / ' + duration + ' sec.)',
			playSound : true,
			icon : Ti.App.Android.R.drawable.appicon,
			sound : Ti.Filesystem.getResRawDirectory() + 'kkj',
		});
		service.close();
	}
});

$.open('GET', options.url);
$.send();

