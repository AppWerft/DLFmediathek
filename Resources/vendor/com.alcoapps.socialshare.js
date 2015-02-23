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
            var intent = null;
            var intentType = null;
            intent = Ti.Android.createIntent({
                action : Ti.Android.ACTION_SEND
            });
            if (_args.message) {
                intent.putExtra(Ti.Android.EXTRA_TEXT, _args.message + ' ' + _url);
            }
            if (_args.image) {
                intent.type = "image/*";
                intent.putExtraUri(Ti.Android.EXTRA_STREAM, _args.image);
            } 
            Ti.Android.currentActivity.startActivity(Ti.Android.createIntentChooser(intent, _args.androidDialogTitle));
        }
    });

}

module.exports = share;

