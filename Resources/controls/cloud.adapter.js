var Cloud = require("ti.cloud"),
    Moment = require('vendor/moment');
const TYPE = 'production';
//Ti.App.deployType;
const ACL_ID = (TYPE == 'test') ? '54e90cf608c91ec2766f3a2f' : '54e8ce37de9cf309836c958d';

var Module = function(_station) {
    this.station = _station;
    this.init(_station);
    return this;
};

Module.prototype = {
    init : function() {
        var that = this;
        loginUser({
            onsuccess : function(_e) {
                that.createRadioListener();
            },
            onerror : function(_e) {
                createUser({
                    onsuccess : function(_e) {

                    },
                    onerror : function(_e) {
                        console.log(_e);

                    }
                });
            }
        });
    },
    createRadioListener : function() {
        if (!Ti.App.Properties.hasProperty('RADIOLISTENERproduction')) {
            Cloud.Objects.create({
                classname : 'radiolistener',
                acl_id : ACL_ID,
                fields : {
                }
            }, function(_e) {
                if (_e.success) {
                    Ti.App.Properties.setString('RADIOLISTENERproduction', _e.radiolistener[0].id);
                } else {
                    console.log(_e);
                }
            });

        }
    },
    savePosition : function(_station) {
        if (Ti.Geolocation.locationServicesEnabled) {
            Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_THREE_KILOMETERS;
            Ti.Geolocation.purpose = 'Hörerposition festhalten';
            Ti.Geolocation.distanceFilter = 500;
            Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
            Ti.Geolocation.getCurrentPosition(function(_e) {
                var coords = _e.coords;
                coords.station = _station;
                savePosition(coords, _station);

            });
        } else {
            console.log('START GEO LOOKING');
            var xhr = Ti.Network.createHTTPClient({
                onload : function() {
                    var coords = JSON.parse(this.responseText);
                    coords.station = _station;
                    savePosition(coords, _station);
                }
            });
            xhr.open('GET', 'https://freegeoip.net/json/');
            xhr.send();
        }

    },
    loadOwnPhoto : function(_done) {
        Cloud.Objects.query({
            classname : 'radiolistener',
            where : {
                id : Ti.App.Properties.getString('RADIOLISTENERproduction'),
            }
        }, function(e) {
            if (e.success && e.radiolistener.length) {
                _done({
                    image : (e.radiolistener[0]['photo_urls']) ? e.radiolistener[0]['photo_urls'] : '',
                    twitter : e.radiolistener[0].twitter_enabled,
                    slogan : e.radiolistener[0].slogan
                });
            } else {
                console.log('NO PHOTO');
            }
        });

    },
    saveTwitter : function(_handle, _public) {
        Cloud.Objects.update({
            classname : 'radiolistener',
            id : Ti.App.Properties.getString('RADIOLISTENERproduction'),
            fields : {
                'twitter_handle' : _handle,
                'twitter_enabled' : (_public) ? 1 : 0
            }
        }, function(e) {
            if (e.success)
                Ti.Media.vibrate([0, 50]);
        });
    },
    saveSlogan : function(_args) {
        Cloud.Objects.update({
            classname : 'radiolistener',
            id : Ti.App.Properties.getString('RADIOLISTENERproduction'),
            fields : {
                'slogan' : _args.message,
            }
        }, function(e) {
            if (e.success) {
                Ti.Media.vibrate([0, 50]);
                _args.done(_e);
            } else
                console.log('Error:' + ((_e.error && _e.message) || JSON.stringify(_e)));
        });
    },
    savePhoto : function(_args) {
        Cloud.Photos.create({
            photo : _args.photo,
            acl_id : ACL_ID,
            'photo_sync_sizes[]' : 'square_75',
            'photo_sync_sizes[]' : 'small_240',
            'photo_sync_sizes[]' : 'medium_500'
        }, function(e) {
            Cloud.onsendstream = Cloud.ondatastream = null;
            if (e.success) {
                var photo = e.photos[0];
                Cloud.Objects.update({
                    classname : 'radiolistener',
                    id : Ti.App.Properties.getString('RADIOLISTENERproduction'),
                    fields : {
                        photo_id : photo.id,
                        photo_urls : (photo.urls) ? photo.urls : undefined
                    }
                }, function(_e) {
                    if (_e.success) {
                        _args.done();
                    } else {
                        console.log('Error:\n' + ((_e.error && _e.message) || JSON.stringify(_e)));
                    }
                });

            }
        });

    },
    getAll : function(_args) {
        Cloud.Objects.query({
            classname : 'radiolistener',
            skip : 0,
            limit : 1000,
            where : {
                station : {
                    "$ne" : '',

                }/*,
                 updated_at : {
                 "$gt" : Moment().add(-24, 'hour').toDate()
                 }*/
            },
            order : '-updated_at'

        }, function(e) {
            if (e.success) {
                var listener = {
                    dlf : [],
                    drk : [],
                    drw : []
                };
                for (var i = 0; i < e.radiolistener.length; i++) {
                    var item = e.radiolistener[i];
                    //if (Moment(item['updated_at']).add(300, 'sec').isAfter(Moment()))
                    if (item.latitude != '' && item.longitude != '') {
                        listener[e.radiolistener[i].station].push({
                            lat : item.latitude,
                            lng : item.longitude,
                            slogan : item.slogan,
                            twitter : (item.twitter_handle && item.twitter_handle != '' && item.twitter_enabled) ? item.twitter_handle.replace('@', '') : undefined,
                            photo : (item['photo_urls']) ? item['photo_urls']['medium_500'] : undefined
                        });
                    }
                    //  console.log(e.radiolistener[i]);
                }
                _args.done(listener);
            } else {
                console.log('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
            }
        });

    }
};
module.exports = Module;

function createUser(_args) {
    Cloud.Users.create({
        username : Ti.Platform.id,
        first_name : Ti.Platform.model,
        last_name : Ti.App.version,
        email : '',
        password : "pass",
        password_confirmation : "pass"
    }, function(_e) {
        if (_e.success) {
            Ti.App.Properties.setString('CLOUDUSER' + TYPE, JSON.stringify(_e.users[0]));
            Cloud.Objects.create({
                classname : 'radiolistener',
                acl_id : ACL_ID,
                fields : {
                    userid : _e.users[0].id,
                    latitude : '',
                    longitude : '',
                    station : 'dlf'
                }
            }, function(_e) {
                if (_e.success) {
                    Ti.App.Properties.setString('RADIOLISTENERproduction', _e.radiolistener[0].id);
                } else {
                    console.log(_e);
                }
            });

            _args.onsuccess(_e.users[0]);
        } else {
            _args.onerror(_e.code);
        }
    });
}

function loginUser(_args) {
    Cloud.Users.login({
        login : Ti.Platform.id,
        password : 'pass'
    }, function(_e) {
        if (_e.success) {
            _args.onsuccess(_e.users[0]);
        } else {
            _args.onerror(_e.code);
        }
    });
}

function savePosition(_coords, _station) {
    if (_coords && _station) {
        if (!Ti.App.Properties.hasProperty('RADIOLISTENERproduction')) {
            Cloud.Objects.create({
                classname : 'radiolistener',
                acl_id : ACL_ID,
                fields : {
                    station : _coords.station,
                    latitude : _coords.latitude,
                    longitude : _coords.longitude,
                    coordinates : [_coords.longitude, _coords.latitude]
                }
            }, function(_e) {
                if (_e.success) {
                    Ti.App.Properties.setString('RADIOLISTENERproduction', _e.radiolistener[0].id);
                } else {
                    console.log(_e);
                }
            });
        } else {
            Cloud.Objects.update({
                classname : 'radiolistener',
                id : Ti.App.Properties.getString('RADIOLISTENERproduction'),
                fields : {
                    latitude : _coords.latitude,
                    longitude : _coords.longitude,
                }
            }, function(_e) {
                if (_e.success) {
                    console.log(_e.radiolistener[0]);
                } else {
                    console.log('Error:\n' + ((_e.error && _e.message) || JSON.stringify(_e)));
                }
            });
        }
    }s
}

