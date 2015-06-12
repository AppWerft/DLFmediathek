var Moment = require('vendor/moment'),
    XMLTools = require('vendor/XMLTools');
    Model = require('model/stations');

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

var url = 'http://srv.deutschlandradio.de/aodlistaudio.1706.de.rpc?drau:searchterm=NEEDLE&drau:page=1&drau:limit=300';

var stations = {
    4 : 'dlf',
    3 : 'drk',
    1 : 'drw'
};

module.exports = function() {
    var args = arguments[0] || {};
    var xhr = Ti.Network.createHTTPClient({
        onload : function() {
            var payload = new XMLTools(this.responseXML).toObject();
            var items = payload.item;
            if (items && toType(items) != 'array') {
                items = [items];
            }
            console.log(items);
            if (items == undefined) {
                args.done([]);
                return;
            }
            args.done(items.map(function(item) {
                return {
                    pubdate : Moment(item.datetime).format('DD.MM.YYYY HH:mm'),
                    title : item.title,
                    author : item.author,
                    sendung : item.sendung.text,
                    url : item.url,
                    image :  '/images/' + stations[item.station] + '.png',
                    station : stations[item.station],
                    duration : item.duration,
                    color :  Model[stations[item.station]].color    
                };
            }));
        }
    });
    console.log(url.replace('NEEDLE', encodeURIComponent(args.needle)));
    xhr.open('GET', url.replace('NEEDLE', encodeURIComponent(args.needle)));
    xhr.send();
};
