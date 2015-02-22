var Moment = require('vendor/moment'),
    XMLTools = require('vendor/XMLTools'),
    Favs = new (require('controls/favorites.adapter'))();

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
                    hash : Ti.Utils.md5HexDigest(this.responseText),
                    live : obj
                };
                // litlle dirty cleaning process:
                if (_args.date) {
                    for (var i = 0; i < obj.item.length; i++) {
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
                    // sorting bei sendung.name
                    var mediathek = [],
                        lastsendung = '',
                        sectionndx = -1;
                    for (var i = 0; i < obj.item.length; i++) {
                        var item = obj.item[i];
                        var sub = {
                            author : ( typeof item.author == 'string') ? item.author : null,
                            start : item.datetime.split(' ')[1].substr(0, 5),
                            subtitle : item.title,
                            station : item.station,
                            url : item.url,
                            datetime: item.datetime,
                            pubdate : item.datetime,
                            duration : item.duration,
                            id : item.sendung.id,
                            title : item.sendung.text,

                        };
                        sub.isfav = Favs.isFav(sub) ? true : false;
                        if (item.sendung.text != lastsendung) {
                            sectionndx++;
                            mediathek[sectionndx] = {
                                name : item.sendung.text,
                                subs : [sub]
                            };
                            lastsendung = item.sendung.text;
                        } else {
                            mediathek[sectionndx].subs.push(sub);
                        }
                    }
                    result.mediathek = mediathek;
                }
                Ti.App.Properties.setString(url, JSON.stringify(result));
                _args.onload(result);

            }
        });
        xhr.open('GET', url);
        console.log(url);
        xhr.send();
    }, 100 + 1000 * Math.random());
};
