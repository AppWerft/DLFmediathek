var Moment = require('vendor/moment');
var XMLTools = require('vendor/XMLTools');

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

module.exports = function(_args) {
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
             _args.done(result);
        }
    });
    xhr.open('GET', _args.url);
    xhr.send();
};
