var Geo = new (require('controls/geotracking'))(),
    Map = require('ti.map'),
    region = Ti.App.Properties.getObject('REGION', {
    latitude : 50.4,
    longitude : 11,
    latitudeDelta : 20,
    longitudeDelta : 20
});
const DRAWER = 160;
var stations = ['dlf', 'drk', 'drw'];
var TiDrawerLayout = require('com.tripvi.drawerlayout');
Ti.App.Properties.setObject('REGION', region);
var myAccounts = require('org.bcbhh').getAccounts();
var twitter = null;
for (var i = 0; i < myAccounts.length; i++) {
    if (myAccounts[i].accountType == 'Twitter')
        twitter = myAccounts[i].name;
}

module.exports = function(args) {
    var self = require('ui/generic.window')({
        title : 'Deutschlandradio',
    });
    self.darker = Ti.UI.createView({
        backgroundColor : 'black',
        opacity : 0,
        zIndex : 99
    });
    self.drawer = Ti.UI.createView({
        width : DRAWER + 'dp',
        left : (-DRAWER + 5) + 'dp',
        layout : 'vertical',
        zIndex : 9999,
        backgroundColor : 'white'
    });
    self.drawer.add(Ti.UI.createLabel({
        top : 5,
        left : 5,
        right : 5,
        text : 'Hier ist es möglich, den Karteneintrag um einen Selfie zu erweitern.'
    }));
    self.avatar = Ti.UI.createImageView({
        image : '/images/avatar.png',
        top : 5,
        opacity : 0.5,
        width : DRAWER,
        height : DRAWER * 1.4
    });
    Geo.loadOwnPhoto(function(_res) {
        console.log(_res);
        //      return;
        self.twitterSwitch && self.twitterSwitch.setValue((_res.twitter) ? true : false);
        self.avatar.setImage(_res.image.original);
        self.avatar.opacity = 1;
    });
    self.avatar.addEventListener('click', function() {
        Ti.Media.showCamera({
            camera : Ti.Media.CAMERA_FRONT,
            mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
            allowEditing : true,
            success : function(_e) {
                self.avatar.image = _e.media;
                self.avatar.opacity = 1;
                Geo.savePhoto(_e.media);
            }
        });
    });
    self.drawer.add(self.avatar);
    if (twitter) {
        self.drawer.add(Ti.UI.createLabel({
            top : 15,
            left : 5,
            right : 5,
            text : 'Zusätzlich eigenen Twitterhandle (' + twitter + ') veröffentlichen:'
        }));
        self.twitterSwitch = Ti.UI.createSwitch({
            style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
            value : false,
            title : 'Öffentlich',
            width : DRAWER,
            height : 80
        });
        self.twitterSwitch.addEventListener('change', function(_e) {
            Geo.saveTwitter(twitter, _e.source.value);
        });
        self.drawer.add(self.twitterSwitch);
    }
    // self.container4self.mapView = Ti.UI.createView();
    self.mapView = Map.createView({
        mapType : Map.TERRAIN_TYPE,
        region : region,
        animate : true,
        regionFit : true,
        userLocation : false,
        enableZoomControls : false,
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
                            title : (_pos.twitter) ? '@'+_pos.twitter : undefined,
                            leftView : (_pos.photo) ? Ti.UI.createImageView({
                                image : _pos.photo,
                                width : 50,
                                height : 70
                            }) : undefined,
                            image : '/images/' + station + Ti.Platform.displayCaps.density + '.png'
                        }));
                    });

                });
                self.mapView.removeAllAnnotations();
                self.mapView.addAnnotations(pins);
            }
        });
    }

    updatePins();
    setInterval(updatePins, 300000);
    self.mapView.addEventListener('regionchanged', function(_e) {
        if (_e.latitudeDelta < 0.6 || _e.longitudeDelta < 0.6) {
            self.mapView.setRegion(Ti.App.Properties.getObject('REGION'));
        } else
            Ti.App.Properties.setObject('REGION', _e);
    });
    self.add(self.mapView);
    self.add(self.drawer);
    self.addEventListener('focus', function() {
        Ti.App.fireEvent('app:tab', {
            subtitle : 'Hörerkarte',
            title : 'DeutschlandRadio',
            icon : 'commonicon',
            leftmenu : true
        });
    });
    self.addEventListener('blur', function() {
    });
    self.mapView.addEventListener('click', function(_e) {
        if (_e.annotation.title) {
            var twitterhandle = _e.annotation.title.replace('@', '');
            try {
                var intent = Ti.Android.createIntent({
                    action : Ti.Android.ACTION_VIEW,
                    packageName : "com.twitter.android",
                    flags : Ti.Android.FLAG_ACTIVITY_NEW_TASK,
                    type : "text/plain"
                });
                intent.putExtraUri("twitter://user?user_id=" + twitterhandle);
                Ti.Android.currentActivity.startActivity(intent);
            } catch(E) {
                console.log(E);
                var win = require('ui/generic.window')({
                    title : 'Hörerkarte',
                    subtitle : 'Twitterprofil @' + twitterhandle,
                    singlewindow : true
                });
                win.add(Ti.UI.createWebView({
                    url : 'https://mobile.twitter.com/' + twitterhandle,
                    borderRadius : 1
                }));
                win.open();
            }
        }
    });
    self.drawer.addEventListener('swipe', toggleDrawer);
    Ti.App.addEventListener('app:togglemapmenu', toggleDrawer);
    function toggleDrawer() {
        // rausschieben:
        if (self.drawer.getLeft() == 0) {
            self.darker.animate({
                opacity : 0
            });
            self.drawer.animate({
                left : (-DRAWER + 5) + 'dp'
            }, function() {
                self.remove(self.darker);
            });
        } else {
            // reinschieben
            self.add(self.darker);
            self.darker.animate({
                opacity : 0.7
            });
            self.drawer.animate({
                left : 0
            });
        }
    };
    return self;
};
