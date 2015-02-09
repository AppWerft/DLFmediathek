var Moment = require('vendor/moment');
var XMLTools = require('vendor/XMLTools');

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

module.exports = function(_args) {
    var url = (_args.date) ? _args.url.replace(/_DATE_/gm, _args.date) : _args.url;
    console.log(_args);
    if (!_args.nocache && Ti.App.Properties.hasProperty(url)) {
        _args.onload(JSON.parse(Ti.App.Properties.getString(url)));
        console.log('delivering of cached infos');
        return;
    }
    var xhr = Ti.Network.createHTTPClient({
        onload : function() {
            var json = new XMLTools(this.responseXML).toObject();
            if (json.item && toType(json.item) != 'array') {
                json.item = [json.item];
            }
            var payload = {
                payload : json,
                hash : Ti.Utils.md5HexDigest(this.responseText)
            };
            Ti.App.Properties.setString(url, JSON.stringify(payload));
            _args.onload(payload);
        }
    });
    xhr.open('GET', url);
    xhr.send();
};
