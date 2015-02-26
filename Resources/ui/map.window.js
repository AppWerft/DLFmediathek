var Geo = new (require('controls/geotracking'))(),
    Map = require('ti.map'),
    region = Ti.App.Properties.getObject('REGION', {
    latitude : 50.4,
    longitude : 11,
    latitudeDelta : 20,
    longitudeDelta : 20
});
console.log(region);
module.exports = function(args) {
    var self = require('ui/generic.window')({
        title : 'Deutschlandradio',
        subtitle : 'Hörerkarte',
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
                        title : 'DLF',
                        pincolor : Map.ANNOTATION_BLUE,
                    }));
                });
                _list.drk.forEach(function(_pos) {
                    pins.push(Map.createAnnotation({
                        latitude : _pos.lat,
                        longitude : _pos.lng,
                        title : 'DKultur',
                        pincolor : Map.ANNOTATION_ORANGE,
                    }));
                });
                _list.drw.forEach(function(_pos) {
                    pins.push(Map.createAnnotation({
                        latitude : _pos.lat,
                        longitude : _pos.lng,
                        title : 'DRWissen',
                        pincolor : Map.ANNOTATION_GREEN,
                    }));
                });
                mapview.removeAllAnnotations();
                mapview.addAnnotations(pins);
            }
        });
    }
    Ti.UI.createNotification({
        message : 'Das ist noch im Experimentalstadium …'
    }).show();
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
    return self;
};
