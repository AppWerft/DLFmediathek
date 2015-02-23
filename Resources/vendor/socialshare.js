/*
 SocialShare : Titanium Module for cross-platform sharing of text and images over social networks
 it is modified  version of original version of Ricardo

 Android:
 For Android it uses the Native Sharing Intent, which brings up a list of installed apps to choose from.

 Arguments:

 image               : Given as nativePath
 message              : The text status to share
 url                 : long version of URL, will shorten
 androidDialogTitle  : The title of the Andorid share window
 */
function share(_args) {
    require('vendor/url.shortener')({
        url : _args.url,
        done : function(_url) {
            var intent;
            switch (_args.type) {
            case 'Facebook':
                intent = Ti.Android.createIntent({
                    action : Ti.Android.ACTION_SEND,
                    packageName : "com.facebook.katana",

                    // className :'com.facebook.katana.activity.composer.ImplicitShareIntentHandler',
                    type : "text/plain",
                  //  className : "ShareLinkActivity",
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
            case 'Google+':
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
            }

            Ti.Android.currentActivity.startActivity(intent);
        }
    });

}

module.exports = share;

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