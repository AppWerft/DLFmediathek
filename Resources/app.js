(function() {
    //http://jgilfelt.github.io/android-actionbarstylegenerator/#name=dlrmediathek&compat=appcompat&theme=dark&actionbarstyle=solid&texture=0&hairline=0&neutralPressed=1&backColor=6b6a6a%2C100&secondaryColor=6b6a6a%2C100&tabColor=949393%2C100&tertiaryColor=b6b6b6%2C100&accentColor=33B5E5%2C100&cabBackColor=d6d6d6%2C100&cabHighlightColor=949393%2C100
    var window = Titanium.UI.createWindow({
        backgroundColor : '#fff',
        fullscreen : true,
        exitOnClose : true,
        orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
    });
    window.addEventListener('open', require('ui/main.menu'));

    var Model = require('model/stations');
    var pages = [];
    for (var station in Model) {
        pages.push(require('station.page')({
            name : station,
            color : Model[station].color,
            podcasts : Model[station].podcasts,
            live : Model[station].live,
            stream : Model[station].stream,

        }));
    };
    var FlipModule = require('de.manumaticx.androidflip');
    window.FlipViewCollection = FlipModule.createFlipView({
        orientation : FlipModule.ORIENTATION_HORIZONTAL,
        overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
        views : pages,
        currentPage : Ti.App.Properties.getInt('LAST_STATION_NDX',0),
        height : Ti.UI.FILL
    });
    window.addEventListener('focus', function() {
        window.FlipViewCollection.peakNext(true);
    });
    window.add(window.FlipViewCollection);
    window.open();
   
})();
