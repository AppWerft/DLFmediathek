var Moment = require('vendor/moment');
var XMLTools = require('vendor/XMLTools');

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

var Module = function() {
    return this;
};

Module.prototype = {
    getRSS : function(_args) {
        var url = _args.url + '?YYYYMMDD=' + Moment().format('YYYYMMDD');
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
    }
};

module.exports = Module;
