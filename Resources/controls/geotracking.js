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
                // that.savePosition();
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
    savePosition : function(_station) {
        if (Ti.Geolocation.locationServicesEnabled) {
            Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_NEAREST_TEN_METERS;
            Ti.Geolocation.purpose = 'Track your performance in this bike race';
            Ti.Geolocation.distanceFilter = 500;
            Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
            Ti.Geolocation.getCurrentPosition(function(_e) {
                var coords = _e.coords;
                coords.station = _station;
                savePosition(coords);

            });
        } else {
            var xhr = Ti.Network.createHTTPClient({
                onload : function() {
                    var coords = JSON.parse(this.responseText);
                    coords.station = _station;
                    savePosition(coords);
                }
            });
            xhr.open('GET', 'https://freegeoip.net/json/');
            xhr.send();
        }

    },
    getAll : function(_args) {
        Cloud.Objects.query({
            classname : 'radiolistener',
            skip : 0,
            limit : 1000,
            where : {
                station : {
                    "$ne" : ''
                }/*,
                 updated_at : {
                 "$gt" : Moment().add(-120, 'sec')
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
                    console.log(Moment(item['updated_at']));
                    //if (Moment(item['updated_at']).add(300, 'sec').isAfter(Moment()))
                    listener[e.radiolistener[i].station].push({
                        lat : item.latitude,
                        lng : item.longitude
                    });
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
        first_name : Titanium.Platform.model,
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
                    station : ''
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


function savePosition(_coords) {
    if (!Ti.App.Properties.hasProperty('RADIOLISTENERproduction')) {
        console.log('INSERT');
        Cloud.Objects.create({
            classname : 'radiolistener',
            acl_id : ACL_ID,
            fields : {
                station : _coords.station,
                latitude : _coords.latitude,
                longitude : _coords.longitude
            }
        }, function(_e) {
            if (_e.success) {
                Ti.App.Properties.setString('RADIOLISTENERproduction', _e.radiolistener[0].id);
            } else {
                console.log(ACL_ID);
                console.log(_e);
            }
        });
    } else {
        console.log('UPDATE');
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
}

Cloud.ACLs.create({
    name : 'public',
    public_read : "true",
    public_write : "false"
}, function(e) {
    if (e.success) {

    } else {

    }
});
