var Moment = require('vendor/moment'),
    XMLTools = require('vendor/XMLTools'),
    Model = require('model/stations');

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

var Module = function() {
    this.eventhandlers = {};
    var that = this;
    this.cron = setInterval(that._updateTimestamps, 30000);
    return this;
};

Module.prototype = {
    _updateTimestamps : function() {
        
    },
    getCurrent : function(_station) {

    },
    getRSS : function(_args) {
        
       
        var url = Model[_args.station].rss + '?YYYYMMDD=' + Moment().format('YYYYMMDD');
        if (Ti.App.Properties.hasProperty(url) && _args.done) {
            _args.done({
                ok : true,
                items : JSON.parse(Ti.App.Properties.getString(url))
            });
            return;
        }
        var xhr = Ti.Network.createHTTPClient({
            onload : function() {
                var channel = new XMLTools(this.responseXML).toObject().channel;
                if (channel.item && toType(channel.item) != 'array') {
                    channel.item = [channel.item];
                }
                var result = {
                    ok : true,
                    items : channel.item
                };
                _args.done && _args.done(result);
                Ti.App.Properties.setString(url, JSON.stringify(channel.item));
            }
        });
        xhr.open('GET', url);
        xhr.send();
    }, // standard methods for event/observer pattern
    fireEvent : function(_event, _payload) {
        if (this.eventhandlers[_event]) {
            for (var i = 0; i < this.eventhandlers[_event].length; i++) {
                this.eventhandlers[_event][i].call(this, _payload);
            }
        }
    },
    addEventListener : function(_event, _callback) {
        if (!this.eventhandlers[_event])
            this.eventhandlers[_event] = [];
        this.eventhandlers[_event].push(_callback);
    },
    removeEventListener : function(_event, _callback) {
        if (!this.eventhandlers[_event])
            return;
        var newArray = this.eventhandlers[_event].filter(function(element) {
            return element != _callback;
        });
        this.eventhandlers[_event] = newArray;
    }
};

module.exports = Module;
