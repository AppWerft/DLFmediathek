var Moment = require('vendor/moment'),
    XMLTools = require('vendor/XMLTools'),
    alarmManager = require('bencoding.alarmmanager').createAlarmManager();

const DB = Ti.App.Properties.getString('DATABASE');

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

var Module = function() {
    this.eventhandlers = {};
    var link = Ti.Database.open(DB);
    if (link) {
        link.execute('CREATE TABLE IF NOT EXISTS "feeds" ("url" TEXT UNIQUE, "http_expires" DATETIME, "http_lastmodified" DATETIME, "http_etag" TEXT, "http_contentlength" INTEGER, "title" TEXT, "description" TEXT, "category" TEXT,"station" TEXT, "pubDate" DATETIME, "lastBuildDate" DATETIME, "image" TEXT,"faved" INTEGER);');
        link.execute('CREATE TABLE IF NOT EXISTS "items" ("channelurl" TEXT, "title" TEXT NOT NULL , "link" TEXT, "description" TEXT, "guid" TEXT UNIQUE , "enclosure_url" TEXT, "enclosure_length" TEXT, "enclosure_type" TEXT, "author" TEXT, "duration" TEXT, "pubDate" DATETIME, "watched" INTEGER);');
        link.execute('CREATE INDEX IF NOT EXISTS "feedurlindex" ON "feeds" (url)');
        link.execute('CREATE INDEX IF NOT EXISTS "itemsurlindex" ON "items" (channelurl)');
        link.close();
    }
    console.log(Moment().add(1, 'day').startOf('day').add(Math.round(Math.random() * 3600)));
    if (!Ti.App.Properties.hasProperty('SERVICESUBSCRIBER2')) {
        Ti.App.Properties.setString('SERVICESUBSCRIBER2', '1');
        var nextsynctime =  Moment().add(1, 'day').startOf('day').add(Math.round(Math.random() * 3600));
        alarmManager.addAlarmNotification({
            requestCode : 2, // must be INT to identify the alarm
            second : 10,
            contentTitle : 'DLR Mediathek',
            contentText : ' Podcastssynchronisierung gestartet',
            playSound : true,
            icon : Ti.App.Android.R.drawable.appicon,
            sound : Ti.Filesystem.getResRawDirectory() + 'kkj', //Set a custom sound to play
        });
        alarmManager.addAlarmService({
            service : 'de.appwerft.dlrmediathek.PodcastsyncService',
            second :nextsynctime.diff(Moment(), 'seconds'),
            repeat : 'daily'
        });
    }
    
    return this;
};

Module.prototype = {
    /* will called from UI and calls background service */
    triggerPodcastDownload : function(_args) {
        require('bencoding.alarmmanager').createAlarmManager().addAlarmService({
            service : 'de.appwerft.dlrmediathek.DownloaderService',
            second : 10,
            parameter : {
                url : _args.url
            }
        });
    },
    mirrorAllFeeds : function(_args) {
        var that = this;
        var total = 0;
        var stations = ['dlf', 'drk', 'drw'];
        var ndx = 0;
        function loadfeeds() {
            var feeds = require('model/' + stations[ndx]);
            function loadfeed() {
                var feed = feeds.shift();
                if (feed) {
                    total++;
                    console.log(feed.href);
                    that.loadFeed({
                        url : feed.href,
                        done : loadfeed
                    });
                } else {
                    console.log(ndx + ' ' + stations.length);
                    ndx++;
                    if (ndx < stations.length) {
                        loadfeeds();
                    } else {
                        _args.done && _args.done({
                            total : total
                        });
                    }
                }
            }

            loadfeed();
        }

        loadfeeds();
    },
    getAllFavedFeeds : function() {
        var link = Ti.Database.open(DB);
        var res = link.execute('SELECT * FROM feeds WHERE faved=1 ORDER BY lastBuildDate DESC');
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
        }
        res.close();
        link.close();
        return faved;
    },
    // get feed with all items
    getFeed : function(_args) {
        var link = Ti.Database.open(DB);
        var rows = link.execute('SELECT * FROM items WHERE channelurl=? ORDER BY DATE(pubDate) DESC', _args.url);
        var items = [];
        if (rows.getRowCount() > 0) {
            while (rows.isValidRow()) {
                items.push({
                    pubDate : rows.getFieldByName('pubDate'),
                    timestamp : Moment(rows.getFieldByName('pubDate')).unix(),
                    title : rows.getFieldByName('title'),
                    description : rows.getFieldByName('description'),
                    link : rows.getFieldByName('link'),
                    guid : rows.getFieldByName('guid'),
                    enclosure_url : rows.getFieldByName('enclosure_url'),
                    enclosure_type : rows.getFieldByName('enclosure_type'),
                    author : rows.getFieldByName('author'),
                    duration : rows.getFieldByName('duration'),
                    channelurl : rows.getFieldByName('channelurl'),
                });
                rows.next();
            }
            rows.close();
            link.close();
            _args.done({
                ok : true,
                items : items
            });
            return;
        }
        /* fallback if first time and not yet feed in database */
        //this.loadFeed(_args);
        var faved = 0;
        var that = this;
        var xhr = Ti.Network.createHTTPClient({
            onload : function() {
                var channel = new XMLTools(this.responseXML).toObject().channel;
                if (channel.item && toType(channel.item) != 'array') {
                    channel.item = [channel.item];
                }
                var link = Ti.Database.open(DB);
                link.execute('INSERT OR REPLACE INTO feeds VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', //
                _args.url, //
                this.getResponseHeader('Expires'), //
                this.getResponseHeader('Last-modified'), //
                this.getResponseHeader('ETag') || '', //
                this.getResponseHeader('Content-Length'), //
                channel.title, //
                channel.description, //
                channel.category, //
                _args.station, channel.pubDate, //
                channel.lastBuildDate, //
                channel.image.url, //
                faved);
                channel.item.forEach(function(item) {
                    link.execute('INSERT OR REPLACE INTO items VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', //
                    _args.url, item.title, item.link, item.description, item.guid, //
                    item.enclosure.url, item.enclosure.length, item.enclosure.type, item['itunes:author'], item['itunes:duration'], item.pubDate, 0);
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
    },
    loadFeed : function(_args) {
        var faved = 0;
        var that = this;
        var xhr = Ti.Network.createHTTPClient({
            onload : function() {
                var channel = new XMLTools(this.responseXML).toObject().channel;
                if (channel.item && toType(channel.item) != 'array') {
                    channel.item = [channel.item];
                }
                var link = Ti.Database.open(DB);
                link.execute('INSERT OR REPLACE INTO feeds VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', //
                _args.url, //
                this.getResponseHeader('Expires'), //
                this.getResponseHeader('Last-modified'), //
                this.getResponseHeader('ETag') || '', //
                this.getResponseHeader('Content-Length'), //
                channel.title, //
                channel.description, //
                channel.category, //
                _args.station, channel.pubDate, //
                channel.lastBuildDate, //
                channel.image.url, //
                faved);
                channel.item.sort(function(a, b) {
                    return parseInt(a.timestamp) > parseInt(b.timestamp);
                });
                channel.item.forEach(function(item) {
                    link.execute('INSERT OR REPLACE INTO items VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', _args.url, item.title, item.link, item.description, item.guid, //
                    item.enclosure.url, item.enclosure.length, item.enclosure.type, item['itunes:author'], item['itunes:duration'], item.pubDate, 0);
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
