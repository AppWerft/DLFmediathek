/*
 SocialShare : Titanium Module for cross-platform sharing of text and images over social networks

 This module requires dl.napp.social for iOS which you can get from https://github.com/viezel/TiSocial.Framework

 iOS:
 The native sharing Action Sheet is displayed and offers options for sharing with Facebook and Twitter (if the native apps are installed),
 plus AirDrop, Text Message, Email and other built-in iOS mechanisms.

 Android:
 For Android it uses the Native Sharing Intent, which brings up a list of installed apps to choose from.

 Arguments:

 image               : Given as nativePath
 status              : The text status to share
 androidDialogTitle  : The title of the Andorid share window
 */
function share(_args) {
    require('vendor/url.shortener')({
        url : _args.url,
        done : function(_url) {
            var intent = null;
            var intentType = null;
            intent = Ti.Android.createIntent({
                action : Ti.Android.ACTION_SEND
            });
            if (_args.message) {
                 console.log( _args.message + ' ' + _url);
                intent.putExtra(Ti.Android.EXTRA_TEXT, _args.message + ' ' + _url);
            }
            if (_args.image) {
                intent.type = "image/*";
                intent.putExtraUri(Ti.Android.EXTRA_STREAM, _args.image);
            } else {
                intent.type = "text/plain";
                intent.addCategory(Ti.Android.CATEGORY_DEFAULT);
            }
            Ti.Android.currentActivity.startActivity(Ti.Android.createIntentChooser(intent, _args.androidDialogTitle));
        }
    });

}

module.exports = share;

