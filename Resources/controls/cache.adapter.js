"use strict";
var FOLDER = 'RadioCache';
var MIN = 1000000;

if (Ti.Filesystem.isExternalStoragePresent())
	var DEPOT = Ti.Filesystem.externalStorageDirectory;
else
	var DEPOT = Ti.Filesystem.applicationDataDirectory;
var folder = Ti.Filesystem.getFile(DEPOT, FOLDER);
if (!folder.exists()) {
	folder.createDirectory();
}

exports.getTree = function() {

};

exports.isCached = function(options) {
	if (!options || !options.station) {
		console.log("Warning: no options for cache manager");
		return false;
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

exports.deleteURL = function(options) {
	var folder = Ti.Filesystem.getFile(DEPOT, FOLDER, options.station);
	if (!folder.exists()) {
		folder.createDirectory();
	}
	var parts = options.url.match(/\/([0-9_a-zA-Z]+\.mp3)$/);
	var filename = parts ? parts[1] : Ti.Utils.md5HexDigest(options.url);
	var file = Ti.Filesystem.getFile(DEPOT, FOLDER, options.station, filename);
	if (file.exists()) {
		file.deleteFile();
	}

};

exports.cacheURL = function(options) {
	var folder = Ti.Filesystem.getFile(DEPOT, FOLDER, options.station);
	if (!folder.exists()) {
		folder.createDirectory();
	}
	var parts = options.url.match(/\/([0-9_a-zA-Z]+\.mp3)$/);
	var filename = parts ? parts[1] : Ti.Utils.md5HexDigest(options.url);
	var file = Ti.Filesystem.getFile(DEPOT, FOLDER, options.station, filename);
	if (file.getSize() < MIN) {// zombie
		console.log("Warning: file deleted because of to short, was " + file.getSize());
		//file.deleteFile();
	}
	if (file.exists()) {
		return {
			url : file.nativePath,
			cached : true
		};
	} else {
		var intent = Ti.Android.createServiceIntent({
			url : 'downloader.js'
		});
		intent.putExtra('options', JSON.stringify({
			url : options.url,
			station : options.station,
			title : options.title.length > options.subtitle.length ? options.subtitle : options.title,
			subtitle : options.title.length < options.subtitle.length ? options.subtitle : options.title,
			filename : filename
		}));
		Ti.Android.createService(intent).start();
		return {
			url : options.url,
			cached : false
		};
	}

};

exports.getURL = function(options) {
	var folder = Ti.Filesystem.getFile(DEPOT, FOLDER, options.station);
	if (!folder.exists()) {
		folder.createDirectory();
	}
	var parts = options.url.match(/\/([0-9_a-zA-Z]+\.mp3)$/);
	var filename = parts ? parts[1] : Ti.Utils.md5HexDigest(options.url);
	var file = Ti.Filesystem.getFile(DEPOT, FOLDER, options.station, filename);
	if (file.getSize() < 512) {// zombie
		console.log("Warning: file deleted because of to short, was " + file.getSize());
		//file.deleteFile();
		return {
			url : options.url,
			cached : false
		};
	}
	if (file.exists()) {
		return {
			url : file.nativePath,
			cached : true
		};
	} else {
		return {
			url : options.url,
			cached : false
		};
	}
};
