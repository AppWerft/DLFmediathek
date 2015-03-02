var Model = require('model/stations'),
    RSS = new (require('controls/rss.adapter'))(),
    Moment = require('vendor/moment'),
    FlipModule = require('de.manumaticx.androidflip');

module.exports = function(station) {
    if (!station)
        station = 'dlf';

    var model = require('model/stations')[station];

    var self = Ti.UI.createWindow({
        theme : 'Theme.NoActionBar',
        fullscreen : true,
        backgroundColor : 'white',
        orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
    });
    self.head = Ti.UI.createView({
        left : 0,
        top : 0,
        height : 50,
        width : Ti.UI.FILL,
        backgroundColor : '#6B6A6A'
    });
    self.headstation = Ti.UI.createImageView({
        width : 36,
        height : 36,
        left : 10,
        image : '/images/' + station + '.png'
    });

    self.head.add(Ti.UI.createImageView({
        image : '/images/kopf.png',
        height : 50,
        width : 280,
        left : 0
    }));
    self.head.add(self.headstation);
    //  self.add(self.head);
    var pages = [];
    ['dlf', 'drk'].forEach(function(station) {
        pages.push(require('ui/dayplan.page')(station));
    });
    self.FlipViewCollection = FlipModule.createFlipView({
        orientation : FlipModule.ORIENTATION_HORIZONTAL,
        overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
        views : pages,
        top : 0,
        currentPage : Ti.App.Properties.getInt('LAST_STATION_NDX', 0)%2,
        height : Ti.UI.FILL
    });
    self.add(self.FlipViewCollection);
    self.head.addEventListener('click', function() {
        self.close();
    });
    self.FlipViewCollection.addEventListener('flipped', function(_e) {
        Ti.App.Properties.setString('LAST_STATION', pages[_e.index].station);
        Ti.App.Properties.setInt('LAST_STATION_NDX', _e.index);
        Ti.App.fireEvent('app:station', {
            station : pages[_e.index].station
        });
        //    self.headstation.setImage('/images/' + pages[_e.index].station + '.png');
    });

    self.addEventListener('focus', function() {
        Ti.App.fireEvent('app:station', {
            station: pages[_e.index].station
        });

        self.FlipViewCollection.peakNext(true);
    });
    return self;
};

