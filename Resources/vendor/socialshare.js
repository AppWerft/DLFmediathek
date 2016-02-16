var urlshortener = function(_args) {
	var self = Ti.Network.createHTTPClient({
		onload : function(_e) {
			console.log(_e);
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
				// http url

				break;
			default:
				var intent = Ti.Android.createIntent({
					action : Ti.Android.ACTION_SEND,
					type : "text/plain"
				});

				intent.putExtra(Ti.Android.EXTRA_TEXT, _args.message + ' ' + _url);
				intent.addCategory(Ti.Android.CATEGORY_DEFAULT);

			}

			Ti.Android.currentActivity.startActivity(intent);
		}
	});
};

/* Testing of app:
 * try {
 Ti.API.info('Trying to Launch via Intent');
 var intent = Ti.Android.createIntent({
 action: Ti.Android.ACTION_VIEW,
 data: url

 });
 Ti.Android.currentActivity.startActivity(intent);
 } catch (e){
 Ti.API.info('Caught Error launching intent: '+e);
 exports.Install();
 }
 *
 */

/*
 * FROM: http://stackoverflow.com/questions/28090842/titanium-android-intent-share-on-social-media
 * AND http://stackoverflow.com/questions/28090842/titanium-android-intent-share-on-social-media
 *
 * var intFB = Ti.Android.createIntent({
 action : Ti.Android.ACTION_SEND,
 packageName : "com.facebook.katana",
 type : "text/plain"
 });

 intFB.putExtra(Ti.Android.EXTRA_TEXT, yourLink);
 //facebook only supports LINKS(!!!)
 Ti.Android.currentActivity.startActivity(intFB);

 var intTwitter = Ti.Android.createIntent({
 action: Ti.Android.ACTION_SEND,
 packageName: "com.twitter.android",
 flags: Ti.Android.FLAG_ACTIVITY_NEW_TASK,
 type: "text/plain"
 });

 intTwitter.putExtra( Ti.Android.EXTRA_TEXT, yourMessage);
 //twitter supports any kind of string content (link, text, etc)
 Ti.Android.currentActivity.startActivity( intTwitter );
 */