var urlshortener = function(_args) {
	var self = Ti.Network.createHTTPClient({
		onload : function(_e) {
			_args.done(JSON.parse(this.responseText).id);
		},
		onerror : function(_e) {
			console.log(_e);
		}
	});
	self.open('POST', 'https://www.googleapis.com/urlshortener/v1/url?key='+ Ti.App.Properties.getString('GOOGLE_API_KEY_SHORTER'));
	self.setRequestHeader('Content-Type', 'application/json');
	var payload = {
		longUrl : _args.url
	};
	self.send(JSON.stringify(payload));
};
// http://stackoverflow.com/questions/2789462/find-package-name-for-android-apps-to-use-intent-to-launch-market-app-from-web
module.exports = function(_args) {
	Ti.UI.createNotification({
			message : 'Verkürze URL des Beirags.\nEinen Augenblick …'
	}).show();
	urlshortener({
		url : _args.url,
		done : function(_url) {
			var intent;
			switch (_args.type) {
			case 'XING':
				intent = Ti.Android.createIntent({
					action : Ti.Android.ACTION_SEND,
					packageName : "com.xing.android",
					flags : Ti.Android.FLAG_ACTIVITY_NEW_TASK,
					type : "text/plain"
				});
				intent.putExtra(Ti.Android.EXTRA_TEXT, _args.message + ' ' + _url);
				break;
			case 'Facebook':
				intent = Ti.Android.createIntent({
					action : Ti.Android.ACTION_SEND,
					packageName : "com.facebook.katana",
					type : "text/plain",
					flags : 0x30000000,
				});
				//intent.addCategory( Ti.Android.CATEGORY_LAUNCHER );
				intent.addCategory(Ti.Android.CATEGORY_DEFAULT);
				intent.putExtra(Ti.Android.EXTRA_TEXT, _args.url);
				//facebook only supports LINKS(!!!)
				break;
			case 'Twitter':
				intent = Ti.Android.createIntent({
					action : Ti.Android.ACTION_SEND,
					packageName : "com.twitter.android",
					flags : Ti.Android.FLAG_ACTIVITY_NEW_TASK,
					type : "text/plain"
				});
				intent.putExtra(Ti.Android.EXTRA_TEXT, _args.message + ' ' + _url);
				break;
			case 'Meetup':
				intent = Ti.Android.createIntent({
					action : Ti.Android.ACTION_SEND,
					packageName : "com.meetup",
					flags : Ti.Android.FLAG_ACTIVITY_NEW_TASK,
					type : "text/plain"
				});
				intent.putExtra(Ti.Android.EXTRA_TEXT, _args.message + ' ' + _url);
				break;
			case 'Google':
				intent = Ti.Android.createIntent({
					action : Ti.Android.ACTION_SEND,
					packageName : "com.google.android.apps.plus",
					flags : Ti.Android.FLAG_ACTIVITY_NEW_TASK,
					type : "text/plain"
				});
				intent.putExtra(Ti.Android.EXTRA_TEXT, _args.message + ' ' + _url);
				break;
			case 'Download':
				intent = Ti.Android.createIntent({
					action : Ti.Android.ACTION_VIEW,
					type : "audio/*",
					data : encodeURI(_url)
				});
				break;
			default:
				var intent = Ti.Android.createIntent({
					action : Ti.Android.ACTION_SEND,
					type : "text/plain"
				});
				intent.putExtra(Ti.Android.EXTRA_TEXT, _args.message + ' ' + _url);
				intent.addCategory(Ti.Android.CATEGORY_DEFAULT);
			}
			console.log("start intent for SHARING " + _args.message + ' ' + _url);
			Ti.Android.currentActivity.startActivity(intent);
		}
	});
};
