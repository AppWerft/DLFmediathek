var FlipModule = require('de.manumaticx.androidflip');
var stations = ['dlf', 'drk', 'drw'];
var Geo = new (require('controls/geotracking'))();

module.exports = function() {
    //http://jgilfelt.github.io/android-actionbarstylegenerator/#name=dlrmediathek&compat=appcompat&theme=dark&actionbarstyle=solid&texture=0&hairline=0&neutralPressed=1&backColor=6b6a6a%2C100&secondaryColor=6b6a6a%2C100&tabColor=949393%2C100&tertiaryColor=b6b6b6%2C100&accentColor=33B5E5%2C100&cabBackColor=d6d6d6%2C100&cabHighlightColor=949393%2C100
    Ti.Media.createSound();
    /*var notification = Ti.Android.createNotification({
     contentIntent : Ti.Android.createPendingIntent(Ti.Android.currentActivity.getIntent()),
     contentTitle : "Test",
     contentText : "Test",
     tickerText : "Test"
     });*/
    var window = Titanium.UI.createWindow({
        backgroundColor : '#fff',
        fullscreen : true,
        exitOnClose : true,
        orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
    });
    setTimeout(function() {
        // window.addEventListener('open', require('ui/main.menu'));
        var Model = require('model/stations');
        var pages = [];
        for (var station in Model) {
            pages.push(require('ui/station.page')({
                station : station,
                color : Model[station].color,
                podcasts : Model[station].podcasts,
                live : Model[station].live,
                stream : Model[station].stream,
            }));
        };
        window.FlipViewCollection = FlipModule.createFlipView({
            orientation : FlipModule.ORIENTATION_HORIZONTAL,
            overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
            views : pages,
            currentPage : Ti.App.Properties.getInt('LAST_STATION_NDX', 0),
            height : Ti.UI.FILL
        });
        setTimeout(function() {
            Ti.App.fireEvent('app:station', {
                station : Ti.App.Properties.getString('LAST_STATION', 'dlf')
            });
        }, 2000);
        window.FlipViewCollection.addEventListener('flipped', function(_e) {
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
            Geo.savePosition(stations[_e.index]);
        });

        window.add(window.FlipViewCollection);

        window.addEventListener('focus', function() {
            window.FlipViewCollection.peakNext(true);
            Ti.App.fireEvent('app:state', {
                state : true
            });
            Ti.App.fireEvent('app:tab', {
                subtitle : 'Mediathek',
                title : Ti.App.Properties.getString('LAST_STATION'),
                icon : 'drk'
            });
        });
        window.addEventListener('blur', function() {
            Ti.App.fireEvent('app:state', {
                state : false
            });
        });
        /*
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
         service.start();*/
    }, 10);
    return window;
};
