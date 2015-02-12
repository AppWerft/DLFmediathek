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
                // litlle dirty cleaning process:
                if (_args.date) for (var i = 0; i < obj.item.length; i++) {
                    delete obj.item[i].timestamp;
                    delete obj.item[i]['file_id'];
                    delete obj.item[i].article;
                    if (obj.item[i].station == '1')
                        obj.item[i].station = 'drw';
                    if (obj.item[i].station == '4')
                        obj.item[i].station = 'dlf';
                    if (obj.item[i].station == '3')
                        obj.item[i].station = 'drk';
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
