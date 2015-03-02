var Geo = new (require('controls/geotracking'))(),
    Map = require('ti.map'),
    region = Ti.App.Properties.getObject('REGION', {
    latitude : 50.4,
    longitude : 11,
    latitudeDelta : 20,
    longitudeDelta : 20
});

Ti.API.info('Ti.Platform.displayCaps.density: ' + Ti.Platform.displayCaps.density);
Ti.API.info('Ti.Platform.displayCaps.dpi: ' + Ti.Platform.displayCaps.dpi);
Ti.API.info('Ti.Platform.displayCaps.platformHeight: ' + Ti.Platform.displayCaps.platformHeight);
Ti.API.info('Ti.Platform.displayCaps.platformWidth: ' + Ti.Platform.displayCaps.platformWidth);
if ((Ti.Platform.osname === 'iphone') || (Ti.Platform.osname === 'ipad') || (Ti.Platform.osname === 'android')) {
    Ti.API.info('Ti.Platform.displayCaps.logicalDensityFactor: ' + Ti.Platform.displayCaps.logicalDensityFactor);
}
if (Ti.Platform.osname === 'android') {
    Ti.API.info('Ti.Platform.displayCaps.xdpi: ' + Ti.Platform.displayCaps.xdpi);
    Ti.API.info('Ti.Platform.displayCaps.ydpi: ' + Ti.Platform.displayCaps.ydpi);
}
module.exports = function(args) {
    var self = require('ui/generic.window')({
        title : 'Deutschlandradio',
        subtitle : 'anonymisierte Hörerkarte',
        orientationModes : []
    });
    Ti.App.Properties.setObject('REGION', region);
    self.container = Ti.UI.createView();
    self.add(self.container);
    function updatePins() {

        Geo.getAll({
            done : function(_list) {
                var pins = [];
                _list.dlf.forEach(function(_pos) {
                    pins.push(Map.createAnnotation({
                        latitude : _pos.lat,
                        longitude : _pos.lng,
                        image : '/images/dlf' + Ti.Platform.displayCaps.density + '.png',
                        pincolor : Map.ANNOTATION_BLUE,
                    }));
                });
                _list.drk.forEach(function(_pos) {
                    pins.push(Map.createAnnotation({
                        latitude : _pos.lat,
                        longitude : _pos.lng,

                        image : '/images/drk' + Ti.Platform.displayCaps.density + '.png',
                        pincolor : Map.ANNOTATION_ORANGE,
                    }));
                });
                _list.drw.forEach(function(_pos) {
                    pins.push(Map.createAnnotation({
                        latitude : _pos.lat,
                        longitude : _pos.lng,

                        image : '/images/drw' + Ti.Platform.displayCaps.density + '.png',
                        pincolor : Map.ANNOTATION_GREEN,
                    }));
                });
                mapview.removeAllAnnotations();
                mapview.addAnnotations(pins);
            }
        });
    }

    var mapview = Map.createView({
        mapType : Map.NORMAL_TYPE,
        region : region,
        animate : true,
        regionFit : true,
        userLocation : false,
        enableZoomControls : false,
    });
    self.container.add(mapview);
    updatePins();
    setInterval(updatePins, 30000);

    mapview.addEventListener('regionchanged', function(_e) {
        delete _e.source;
        delete _e.type;
        if (_e.latitudeDelta < 2 || _e.longitudeDelta < 2) {
            mapview.setRegion(Ti.App.Properties.getObject('REGION'));
        } else
            Ti.App.Properties.setObject('REGION', _e);

    });
    self.addEventListener('focus', function() {
        Ti.App.fireEvent('app:tab', {
            subtitle : 'Hörerkarte',
            title : 'DeutschlandRadio',
            icon : 'commonicon'
        });
    });

    return self;
};
