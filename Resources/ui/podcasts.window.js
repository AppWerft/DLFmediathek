var Model = require('model/stations'),
    Moment = require('vendor/moment'),
    FlipModule = require('de.manumaticx.androidflip'),
    Podcast = new (require('controls/feed.adapter'))(),
    stations = ['dlf', 'drk', 'drw'];

var screenheight = Ti.Platform.displayCaps.platformHeight,
    screenwidth = Ti.Platform.displayCaps.platformWidth;

if (Ti.Android) {
    screenheight *= (160 / Ti.Platform.displayCaps.ydpi);
    screenwidth *= (160 / Ti.Platform.displayCaps.xdpi);
}

module.exports = function() {
    var self = require('ui/generic.window')({
        title : 'Deutschlandradio',
        subtitle : 'Sendungen zum Nachhören',
    });
    var pages = [];
    for (var ndx = 0; ndx < stations.length; ndx++) {
        var podcasts = require('model/' + stations[ndx]);
        var color = podcasts.color;
        pages[ndx] = Ti.UI.createScrollView({
            scrollType : 'vertical',
            backgroundColor : 'white',
            layout : 'horizontal',
            name : stations[ndx],
            horizontalWrap : true,
            contentWidth : Ti.UI.FILL,
            width : Ti.UI.FILL,
            contentWidth : Ti.UI.FILL,
            height : Ti.UI.FILL,
        });
        pages[ndx].addEventListener('click', function(_e) {
            if (_e.source.itemId)
                require('ui/podcastlist.window')({
                    color : color,
                    url : _e.source.itemId.url,
                    title : _e.source.itemId.title,
                    station : stations[ndx]
                }).open();
        });

        podcasts.forEach(function(item) {
            pages[ndx].add(Ti.UI.createImageView({
                image : (item.a) ? item.a.img.src : item.img.src,
                width : (stations[ndx] == 'drw') ? '50%' : '33.3%',
                height : 'auto',
                top : 0,
                left : 0,
                itemId : {
                    title : (item.a) ? item.a.img.alt : item.img.alt,
                    url : (item.a) ? item.a.href : item.href,
                }
            }));

        });
    }
    self.FlipViewCollection = FlipModule.createFlipView({
        orientation : FlipModule.ORIENTATION_HORIZONTAL,
        overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
        views : pages,
        currentPage : Ti.App.Properties.getInt('LAST_STATION_NDX', 0),
        height : Ti.UI.FILL,
        width : Ti.UI.FILL
    });
    self.FlipViewCollection.addEventListener('flipped', function(_e) {
        Ti.App.fireEvent('app:station', {
            station : pages[_e.index].name
        });
        //Geo.savePosition(stations[_e.index]);
    });
    self.add(self.FlipViewCollection);
    return self;
};
