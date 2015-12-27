const FOLDER = 'RadioCache';

exports.isCached = function(options) {
	console.log(options);
	if (!options.station) return false;
	if (Ti.Filesystem.isExternalStoragePresent())
		var DEPOT = Ti.Filesystem.externalStorageDirectory;
	else
		var DEPOT = Ti.Filesystem.applicationDataDirectory;
	var folder = Ti.Filesystem.getFile(DEPOT, FOLDER);
	if (!folder.exists()) {
		folder.createDirectory();
	}
	var folder = Ti.Filesystem.getFile(DEPOT, FOLDER, options.station);
	if (!folder.exists()) {
		folder.createDirectory();
	}
	var parts = options.url.match(/\/([0-9_a-zA-Z]+\.mp3)$/);
	var filename = parts ? parts[1] : Ti.Utils.md5HexDigest(options.url);
	var file = Ti.Filesystem.getFile(DEPOT, FOLDER, options.station, filename);
	return file.exists() ? true : false;
};

exports.getURL = function(options) {
	if (Ti.Filesystem.isExternalStoragePresent())
		var DEPOT = Ti.Filesystem.externalStorageDirectory;
	else
		var DEPOT = Ti.Filesystem.applicationDataDirectory;
	var folder = Ti.Filesystem.getFile(DEPOT, FOLDER);
	if (!folder.exists()) {
		folder.createDirectory();
	}
	var folder = Ti.Filesystem.getFile(DEPOT, FOLDER, options.station);
	if (!folder.exists()) {
		folder.createDirectory();
	}
	var parts = options.url.match(/\/([0-9_a-zA-Z]+\.mp3)$/);
	var filename = parts ? parts[1] : Ti.Utils.md5HexDigest(options.url);
	var file = Ti.Filesystem.getFile(DEPOT, FOLDER, options.station, filename);
	if (file.exists()) {
		console.log('Info: file was in cache =========>' + file.nativePath);
		return {
			url : file.nativePath,
			cached : true
		};
	} else {
		console.log('Info: file was in not in cache ========>' + options.url);
		var intent = Ti.Android.createServiceIntent({
			url : 'downloader.js'
		});
		intent.putExtra('options', JSON.stringify({
			url : options.url,
			station : options.station,
			filename : filename
		}));
		Ti.Android.createService(intent).start();
		return {
			url : options.url,
			cached : false
		};
	}
};
