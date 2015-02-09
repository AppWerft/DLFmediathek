var Moment = require('vendor/moment');
var XMLTools = require('vendor/XMLTools');

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

module.exports = function(_args) {
    var xhr = Ti.Network.createHTTPClient({
        onload : function() {
            var obj = new XMLTools(this.responseXML).toObject();
            console.log(obj.item);
            if (obj.item && toType(obj.item) != 'array') {
                obj.item = [obj.item];
            }
            var result = {
                payload : obj
            };
        //    _args.onload(result);
        }
    });
    xhr.open('GET', _args.url);
    xhr.send();
};
