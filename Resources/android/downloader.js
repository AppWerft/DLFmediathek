var alarmManager = require('bencoding.alarmmanager').createAlarmManager();
var DownloadManager = require('dk.napp.downloadmanager');

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

DownloadManager.permittedNetworkTypes = DownloadManager.NETWORK_TYPE_ANY;
DownloadManager.maximumSimultaneousDownloads = 4;
DownloadManager.deleteItem(options.url);
DownloadManager.addDownload({
	name : 'RadioBeitrag',
	url : options.url,
	filePath : Ti.Filesystem.getFile(DEPOT, FOLDER, options.station, options.filename).nativePath,
	priority : DownloadManager.DOWNLOAD_PRIORITY_LOW
});
DownloadManager.addEventListener('completed', handleEvent);

function handleEvent(e) {
	alarmManager.addAlarmNotification({
		requestCode : Math.round(Math.random() * 256),
		second : 1,
		contentTitle : options.title,
		contentText : '„' + options.subtitle + '“ runtergeholt (' + (e.bps / 1000000).toFixed(1) + ' Mbit/s)',
		playSound : true,
		icon :  Ti.App.Android.R.drawable.appicon,
		largeIcon :  Ti.App.Android.R.drawable.appicon,
		sound : Ti.Filesystem.getResRawDirectory() + 'kkj',
	});
}

