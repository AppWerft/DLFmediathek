var Geo = new (require('controls/geotracking'))(),
    Map = require('ti.map'),
    region = Ti.App.Properties.getObject('REGION', {
    latitude : 50.4,
    longitude : 11,
    latitudeDelta : 20,
    longitudeDelta : 20
});
var stations = ['dlf', 'drk', 'drw'];
var TiDrawerLayout = require('com.tripvi.drawerlayout');
Ti.App.Properties.setObject('REGION', region);

module.exports = function(args) {
    var self = require('ui/generic.window')({
        title : 'Deutschlandradio',
    });
    self.container4mapview = Ti.UI.createView();
    var mapView = Map.createView({
        mapType : Map.TERRAIN_TYPE,
        region : region,
        animate : true,
        regionFit : true,
        userLocation : false,
        enableZoomControls : false,
        width : Ti.UI.FILL,
        height : Ti.UI.FILL,
    });
    self.container4mapview.add(mapView);
    var leftView = Ti.UI.createTableView({
        backgroundColor : '#ccc'
    });
    var drawer = TiDrawerLayout.createDrawer({
        contentView : self.container4mapview,
        leftView : leftView,
        leftDrawerWidth : "50%",
        width : Ti.UI.FILL,
        height : Ti.UI.FILL,
    });

    function updatePins() {
        Geo.getAll({
            done : function(_list) {
                var pins = [];
                stations.forEach(function(station) {
                    _list[station].forEach(function(_pos) {
                        pins.push(Map.createAnnotation({
                            latitude : _pos.lat,
                            longitude : _pos.lng,
                            image : '/images/' + station + Ti.Platform.displayCaps.density + '.png'
                        }));
                    });

                });
                mapView.removeAllAnnotations();
                mapView.addAnnotations(pins);
            }
        });
    }

    updatePins();
    setInterval(updatePins, 60000);
    mapView.addEventListener('regionchanged', function(_e) {
        if (_e.latitudeDelta < 1 || _e.longitudeDelta < 1) {
            mapView.setRegion(Ti.App.Properties.getObject('REGION'));
        } else
            Ti.App.Properties.setObject('REGION', _e);
    });
    self.add(drawer);
    self.add(mapView);
    self.addEventListener('focus', function() {
        drawer.drawerIndicatorEnabled = true;
        Ti.App.fireEvent('app:tab', {
            subtitle : 'Hörerkarte',
            title : 'DeutschlandRadio',
            icon : 'commonicon',
            leftmenu : true
        });
    });
    self.addEventListener('blur', function() {
        drawer.drawerIndicatorEnabled = false;
    });
    return self;
};
