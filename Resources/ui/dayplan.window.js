var Model = require('model/stations'),
    RSS = new (require('controls/rss.adapter'))(),
    Moment = require('vendor/moment'),
    FlipModule = require('de.manumaticx.androidflip');

module.exports = function() {
    var self = Ti.UI.createWindow({
    });
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
            station: Ti.App.Properties.getString('LAST_STATION')
        });
        Ti.App.fireEvent('app:tab', {
            subtitle : 'Tagesübersicht',
            title:(Ti.App.Properties.getString('LAST_STATION')!='drk')?'Deutschlandfunk':'DeutschlandRadio Kultur',
            icon : 'drk'
        });
    });
    return self;
};

