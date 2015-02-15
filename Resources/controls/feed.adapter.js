var Moment = require('vendor/moment');
var XMLTools = require('vendor/XMLTools');
const DB = Ti.App.Properties.getString('DATABASE');

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

var Module = function() {
    var link = Ti.Database.open(DB);
    if (link) {
        link.execute('CREATE TABLE IF NOT EXISTS "feeds" ("url" TEXT UNIQUE, "http_expires" DATETIME, "http_lastmodified" DATETIME, "http_etag" TEXT, "http_contentlength" INTEGER, "title" TEXT, "description" TEXT,  "category" TEXT,"station" TEXT, "pubDate" DATETIME, "lastBuildDate" DATETIME, "image" TEXT,"faved" INTEGER);');
        link.execute('CREATE TABLE IF NOT EXISTS "items" ("channelurl" TEXT, "title" TEXT NOT NULL , "link" TEXT, "description" TEXT, "guid" TEXT UNIQUE , "enclosure_url" TEXT, "enclosure_length" TEXT, "enclosure_type" TEXT, "author" TEXT, "duration" INTEGER, "pubDate" DATETIME, "watched" INTEGER);');
        link.execute('CREATE INDEX IF NOT EXISTS "feedurlindex" ON "feeds" (url)');
        link.execute('CREATE INDEX IF NOT EXISTS "itemsurlindex" ON "items" (channelurl)');
        link.close();
    }
    return this;
};

Module.prototype = {
    getAllFavedFeeds : function() {
        var link = Ti.Database.open(DB);
        var res = link.execute('SELECT * FROM feeds WHERE faved=1');
        var feeds = [];
        while (res.isValidRow()) {
            var count = res.getFieldCount();
            var feed = {};
            for (var i = 0; i < count; i++) {
                feed[res.getFieldName(i)] = res.field(i);
            }
            feeds.push(feed);
            res.next();
        }
        res.close();
        link.close();
        return feeds;
    },
    toggleFaved : function(_url) {
        var link = Ti.Database.open(DB);
        link.execute('UPDATE feeds SET faved=? where url=?', (this.isFaved(_url)) ? 0 : 1, _url);
        link.close();
    },
    addFeed : function() {
    },
    isFaved : function(_url) {
        var link = Ti.Database.open(DB);
        var faved;
        var res = link.execute('SELECT faved FROM feeds WHERE url=?', _url);
        if (res.isValidRow()) {
            faved = (res.fieldByName('faved')) ? true : false;
            console.log('Faved=' + faved);
        }
        res.close();
        link.close();
        return faved;
    },
    getFeed : function(_args) {
        var faved = 0;
        var that = this;
        var xhr = Ti.Network.createHTTPClient({
            onload : function() {
                var channel = new XMLTools(this.responseXML).toObject().channel;
                if (channel.item && toType(channel.item) != 'array') {
                    channel.item = [channel.item];
                }
                var link = Ti.Database.open(DB);
                var sql = 'INSERT OR REPLACE INTO feeds VALUES ("' + _args.url + '","' + this.getResponseHeader('Expires') + '","' + this.getResponseHeader('Last-modified') + '","' + (this.getResponseHeader('ETag') || '') + '","' + this.getResponseHeader('Content-Length') + '","' + channel.title + '","' + channel.description + '","' + channel.category + '","' + '' + '","' + channel.pubDate + '","' + channel.lastBuildDate + '","' + channel.image.url + '","' + faved + '")';
                link.execute(sql);
                channel.item.forEach(function(item) {
                    link.execute('INSERT OR REPLACE INTO items VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', _args.url, item.title, item.link, item.description, item.guid, item.enclosure.url, item.enclosure.length, item.enclosure.type, item.author, item.duration, item.pubDate, 0);
                });
                link.close();
                channel.item.faved = that.isFaved(_args.url);
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
