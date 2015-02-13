var Moment = require('vendor/moment');
var XMLTools = require('vendor/XMLTools');
const DB = 'DB1';

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

var Module = function() {
    var link = Ti.Database.open(DB);
    link.execute('CREATE TABLE IF NOT EXISTS "feeds" ("md5" TEXT, "station" TEXT, "title" TEXT, "logo" TEXT,"lastupdate" DATETIME,"lastentry" DATETIME, "url" VARCHAR, "count" INTEGER);');
    link.close();
    return this;
};

Module.prototype = {
    getAllFeeds : function() {
    },
    toggleState : function() {
    },
    addFeed : function() {
    },
    getFeed : function(_args) {
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
    }
};

module.exports = Module;
