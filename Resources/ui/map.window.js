var Geo = new (require('controls/cloud.adapter'))(),
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
    var self = Ti.UI.createWindow();
    self.darker = Ti.UI.createView({
        backgroundColor : 'black',
        opacity : 0,
        zIndex : 99
    });
    self.drawer = Ti.UI.createScrollView({
        scrollType : 'vertical',
        width : (DRAWER + 5) + 'dp',
        left : -DRAWER + 'dp',
        layout : 'vertical',
        zIndex : 9999,
        backgroundColor : 'white'
    });
    self.drawer.add(Ti.UI.createLabel({
        top : 5,
        left : 5,
        right : 5,
        font : {
            fontSize : 14,
            fontFamily : 'ScalaSans'
        },
        text : 'Hier ist es möglich, den Karteneintrag um einen Selfie und einen Spruch zu erweitern.'
    }));
    self.avatar = Ti.UI.createImageView({
        image : '/images/avatar.png',
        top : 5,
        left : 0,
        opacity : 0.5,
        width : DRAWER + 5,
        height : DRAWER * 1.3
    });

    self.avatar.addEventListener('click', function() {
        Ti.Media.showCamera({
            camera : Ti.Media.CAMERA_FRONT,
            mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
            allowEditing : true,
            success : function(_e) {
                self.avatar.image = _e.media;
                self.avatar.opacity = 1;
                Geo.savePhoto({
                    photo : _e.media,
                    done : function() {
                        updatePins();
                    }
                });
            }
        });
    });
    self.drawer.add(self.avatar);
    self.drawer.add(Ti.UI.createLabel({
        top : 15,
        left : 5,
        right : 2,
        font : {
            fontSize : 14,
            fontFamily : 'ScalaSans'
        },
        text : 'Warum höre ich Radio?'
    }));
    self.slogan = Ti.UI.createTextField({
        borderStyle : Ti.UI.INPUT_BORDERSTYLE_BEZEL,
        hintText : '',
        top : 0,
        width : '90%',
        height : 35
    });
    self.drawer.add(self.slogan);
    self.slogan.addEventListener('change', function() {
        self.save.show();
    });
    if (twitter) {
        self.drawer.add(Ti.UI.createLabel({
            top : 15,
            left : 5,
            right : 2,
            font : {
                fontSize : 14,
                fontFamily : 'ScalaSans'
            },
            text : 'Zusätzlich Twitterhandle (@' + twitter + ') veröffentlichen:'
        }));
        self.twitterSwitch = Ti.UI.createSwitch({
            style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
            value : false,
            title : 'Öffentlich',
            width : DRAWER,
            height : 40
        });
        self.drawer.add(self.twitterSwitch);

        self.twitterSwitch.addEventListener('change', function(_e) {
            Geo.saveTwitter(twitter, _e.source.value);
        });
        self.save = Ti.UI.createButton({
            title : 'Speichern',
            top : 0,
            visible : false,
            width : '90%'
        });
        self.drawer.add(self.save);
        self.save.addEventListener('click', function() {
            self.save.hide();
            Geo.saveSlogan({
                message : self.slogan.getValue(),
                done : function() {
                    updatePins();
                    toggleDrawer();
                }
            });
        });
    }
    Geo.loadOwnPhoto(function(_res) {
        self.twitterSwitch && self.twitterSwitch.setValue((_res.twitter) ? true : false);
        self.avatar.setImage(_res.image.original);
        self.avatar.opacity = 1;
        self.slogan.value = _res.slogan || '';
    });
    // self.container4self.mapView = Ti.UI.createView();
    self.mapView = Map.createView({
        mapType : Map.TERRAIN_TYPE,
        region : region,
        animate : true,
        regionFit : true,
        compassEnabled : false,
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
                            subtitle : (_pos.twitter) ? '@' + _pos.twitter : undefined,
                            title : _pos.slogan || null,
                            leftView : (_pos.photo) ? Ti.UI.createImageView({
                                image : _pos.photo,
                                width : 30,
                                height : 50
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
        if (_e.latitudeDelta < 0.4 || _e.longitudeDelta < 0.4) {
            _e.source.setLocation(Ti.App.Properties.getObject('REGION'));
        } else {
            Ti.App.Properties.setObject('REGION', {
                latitude : _e.latitude,
                longitude : _e.longitude,
                latitudeDelta : _e.latitudeDelta,
                longitudeDelta : _e.longitudeDelta
            });
        }
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

    self.mapView.addEventListener('click', function(_e) {
        if (_e.annotation.subtitle && _e.clicksource != 'pin') {
            var twitterhandle = _e.annotation.subtitle.replace('@', '');
            try {
                Ti.Android.currentActivity.startActivity(Ti.Android.createIntent({
                    action : Ti.Android.ACTION_VIEW,
                    data : "twitter://user?screen_name=" + twitterhandle,
                    packageName : "com.twitter.android",
                }));
            } catch(E) {
                var win = require('ui/generic.window')({
                    title : 'Hörerkarte',
                    subtitle : 'Twitterprofil @' + twitterhandle,
                    singlewindow : true
                });
                win.open();
                setTimeout(function() {
                    win.add(Ti.UI.createWebView({
                        url : 'https://mobile.twitter.com/' + twitterhandle,
                        borderRadius : 1
                    }));
                }, 100);

            }
        }
    });
    self.drawer.addEventListener('swipe', toggleDrawer);
    Ti.App.addEventListener('app:togglemapmenu', toggleDrawer);
    function toggleDrawer(_e) {
        if (_e && _e.direction && (_e.direction == 'up' || _e.direction == 'down'))
            return;
        // rausschieben:
        if (self.drawer.getLeft() == 0) {
            self.darker.animate({
                opacity : 0
            });
            self.drawer.animate({
                left : (-DRAWER) + 'dp'
            }, function() {
                self.remove(self.darker);
            });
        } else {
            // reinschieben
            self.add(self.darker);
            self.darker.animate({
                opacity : 0.8,
                duration : 50
            });
            self.drawer.animate({
                left : 10,
                duration : 100,
            }, function() {
                self.drawer.animate({
                    left : 0,
                    duration : 50,
                });
            });

        }
    };
    self.darker.addEventListener('click', toggleDrawer);
    return self;
};
