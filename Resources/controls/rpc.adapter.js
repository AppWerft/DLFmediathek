var Moment = require('vendor/moment');
var XMLTools = require('vendor/XMLTools');

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

module.exports = function(_args) {
    var url = (_args.date) ? _args.url.replace(/_DATE_/gm, _args.date) : _args.url;
    if (!_args.nocache && Ti.App.Properties.hasProperty(url)) {
        _args.onload(JSON.parse(Ti.App.Properties.getString(url)));
        return;
    }
    setTimeout(function() {
        var xhr = Ti.Network.createHTTPClient({
            onload : function() {
                var obj = new XMLTools(this.responseXML).toObject();
                if (obj.item && toType(obj.item) != 'array') {
                    obj.item = [obj.item];
                }
                var result = {
                    payload : obj,
                    hash : Ti.Utils.md5HexDigest(this.responseText)
                };
                Ti.App.Properties.setString(url, JSON.stringify(result));
                _args.onload(result);
            }
        });
        xhr.open('GET', url);
        xhr.send();
    }, 100 + 1000 * Math.random());
};
