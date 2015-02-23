var Moment = require('vendor/moment'),
    XMLTools = require('vendor/XMLTools'),
    Model = require('model/stations');

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

var Module = function() {
    this.eventhandlers = {};
    this.rss = {};
    var that = this;
    //this.cron = setInterval(that._updateTimestamps, 30000);
    return this;
};

Module.prototype = {
    _updateTimestamps : function(_args) {
        console.log('Info: sort day data ' + _args.station);
        var url = Model[_args.station].rss + '?YYYYMMDD=' + Moment().format('YYYYMMDD');
        if (Ti.App.Properties.hasProperty(url)) {
            var items = JSON.parse(Ti.App.Properties.getString(url));
            var length = items.length;
            var laststart = Moment().startOf('day');
            var ndx = 0;
            for ( i = 0; i < length; i++) {
                var item = items[i];
                if (i == 1) {
                    items[0].duration = Moment(item.pubDate).diff(Moment().startOf('day'), 'seconds');
                    items[1].duration = Moment(item.pubDate).diff(laststart, 'seconds');
                    items[0].endtime = Moment(item.pubDate);
                    items[1].endtime = Moment(items[2].pubDate);
                } else if (i == length - 1) {
                    items[i].duration = Moment().startOf('day').add(1, 'day').diff(Moment(item.pubDate), 'seconds');
                    items[i].endtime = Moment().startOf('day').add(1, 'day');
                } else {
                    items[i].duration = Moment(item.pubDate).diff(laststart, 'seconds');
                    items[i].endtime = Moment(items[i + 1].pubDate);
                }
                laststart = Moment(item.pubDate);
                item.isonair = (Moment().isBetween(item.pubDate, item.endtime)) ? true : false;
                item.ispast = (Moment().isBefore(item.endtime)) ? false : true;
                if (!item.endtime.isAfter(Moment()))
                    ndx++;
            }
            return items;
        } else
            return [];
    },
    getCurrentOnAir : function(_args) {
        var currentonair = null;
        var items = this._updateTimestamps(_args);
        items.forEach(function(item) {
            if (item.isonair == true)
                currentonair = item;
        });
        return currentonair;
    },
    getRSS : function(_args) {
        var that = this;
        // still present?
        var url = Model[_args.station].rss + '?YYYYMMDD=' + Moment().format('YYYYMMDD');
        if (Ti.App.Properties.hasProperty(url) && _args.done) {
            _args.done({
                ok : true,
                items : JSON.parse(Ti.App.Properties.getString(url))
            });
            return;
        }
        // no => retreiving
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
                // back to caller
                _args.done && _args.done(result);
                // persist
                Ti.App.Properties.setString(url, JSON.stringify(channel.item));
                try {
                    if (that.rss && that.rss.isIndexOf(url) == -1) {
                        that.rss.push({
                            url : url,
                            current : null
                        });
                    }
                } catch(E) {
                }
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
