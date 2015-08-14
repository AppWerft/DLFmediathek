var FlipModule = require('de.manumaticx.androidflip'),
    stations = ['dlf', 'drk', 'drw'],
    Model = require('model/stations');

module.exports = function() {
    //http://jgilfelt.github.io/android-actionbarstylegenerator/#name=dlrmediathek&compat=appcompat&theme=dark&actionbarstyle=solid&texture=0&hairline=0&neutralPressed=1&backColor=6b6a6a%2C100&secondaryColor=6b6a6a%2C100&tabColor=949393%2C100&tertiaryColor=b6b6b6%2C100&accentColor=33B5E5%2C100&cabBackColor=d6d6d6%2C100&cabHighlightColor=949393%2C100
    Ti.Media.createSound();
    var self = Ti.UI.createWindow();
//    var Player = require('ui/audioplayer.widget').createPlayer();
    var pages = [];
    for (var station in Model) {
        pages.push(require('ui/mediathek.page')({
            station : station,
            color : Model[station].color,
            podcasts : Model[station].podcasts,
            live : Model[station].live,
            stream : Model[station].stream,
        }));
    };
    self.FlipViewCollection = FlipModule.createFlipView({
        orientation : FlipModule.ORIENTATION_HORIZONTAL,
        overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
        views : pages,
        currentPage : Ti.App.Properties.getInt('LAST_STATION_NDX', 0),
        height : Ti.UI.FILL
    });
    self.FlipViewCollection.addEventListener('flipped', function(_e) {
        Ti.App.Properties.setString('LAST_STATION', pages[_e.index].station);
        Ti.App.Properties.setInt('LAST_STATION_NDX', _e.index);

        Ti.App.fireEvent('app:station', {
            station : pages[_e.index].station
        });
        pages.forEach(function(page, ndx) {
            if (ndx == _e.index)
                setTimeout(function() {
                    page.updateCurrentinTopBox(true);
                }, 200);
            else
                page.hideCurrent([_e.index]);
        });
    });
    self.add(self.FlipViewCollection);
    self.addEventListener('focus', function() {
        self.FlipViewCollection.peakNext(true);
        Ti.App.fireEvent('app:state', {
            state : true
        });
        Ti.App.fireEvent('app:tab', {
            subtitle : 'Mediathek',
            title : Ti.App.Properties.getString('LAST_STATION'),
            icon : 'drk'
        });
    });
    self.addEventListener('blur', function() {
        Ti.App.fireEvent('app:state', {
            state : false
        });
    });
    /*
     *
     var notification = Ti.Android.createNotification({
     contentIntent : Ti.Android.createPendingIntent(Ti.Android.currentActivity.getIntent()),
     contentTitle : "Test",
     contentText : "Test",
     tickerText : "Test"
     });
     var intent = Titanium.Android.createServiceIntent({
     url : 'downloader.js'
     });
     // Service should run its code every 2 seconds.
     intent.putExtra('interval', 2000);
     // A message that the service should 'echo'
     intent.putExtra('url', 'Titanium rocks!');

     var service = Ti.Android.createService(intent);
     service.addEventListener('resume', function(e) {
     Titanium.API.info('Service code resumes, iteration ' + e.iteration);
     });
     service.addEventListener('pause', function(e) {
     Titanium.API.info('Service code pauses, iteration ' + e.iteration);
     if (e.iteration === 1) {
     Titanium.API.info('Service code has run 1 times, will now stop it.');
     service.stop();
     }
     });
     service.start();
     */

    return self;
};
