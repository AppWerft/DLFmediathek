var Moment = require('vendor/moment'),
    XMLTools = require('vendor/XMLTools'),
    Model = require('model/stations'),
    DB = Ti.App.Properties.getString('DATABASE');

var Module = function() {
    var link = Ti.Database.open(DB);
    link.execute('CREATE TABLE IF NOT EXISTS "events" ("requestCode" INTEGER, "pubdate" DATETIME, "station" VARCHAR, "json" TEXT);');
    link.close();
};

Module.prototype = {
    getAllEvents : function(_args) {
        if (Ti.App.Properties.hasProperty('KLANGKUNST_CACHE')) {
            _args.done(JSON.parse(Ti.App.Properties.getString('KLANGKUNST_CACHE')));
        }
        var that = this;
        var xhr = Ti.Network.createHTTPClient({
            onload : function() {
                var page = this.responseText.replace(/\n/mg, ' '),
                    pattern = new RegExp('<article class="drk\-articlesmall">(.*?)</article>', 'gmi'),
                    match = null,
                    items = [];
              
                while (( match = pattern.exec(page)) != null) {
                    // dirty trick : pseudo xml for using the xml lib
                    var xml = '<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><article>' + match[1] + '</article></rss>';
                    var article = new XMLTools(xml).toObject().article.div;
                    var header = article[1].h3.a;
                    if (header) {
                        var item = {
                            title : header.text,
                            subtitle : (header.span) ? header.span.text : null,
                            description : article[1].p.text,
                            image : article[0].a.img.src,
                            pubdate : article[1].p.a.text.replace(/[\s]{3,}/, ' ')
                        };
                        item.requestCode = parseInt(Ti.Utils.md5HexDigest(JSON.stringify(item.pubdate)).replace(/[\D]/g, '').substr(0, 16));
                        item.isFaved = that.isFav(item.requestCode);
                        items.push(item);
                    }
                }
                Ti.App.Properties.setString('KLANGKUNST_CACHE', JSON.stringify(items));
                _args.done(items);
            }
        });
        xhr.open('GET', Model[_args.station].hoerkunst);
        xhr.send();
    },
    addFav : function(_item) {
        var requestCode = _item.requestCode;
        var link = Ti.Database.open(DB);
        link.execute('insert into events (requestCode,pubdate,station,json) values (?,?,?,?)', requestCode, _item.datetime, _item.station, JSON.stringify(_item));
        link.close();
        var alarmManager = require('bencoding.alarmmanager').createAlarmManager();
        var pubdate = Moment(_item.pubdate.split(' | ')[1].replace(' Uhr', ''), 'DD.MM.YYYY HH:mm');
        var seconds = pubdate.diff(Moment())/1000;
        var alarm = {
            requestCode : requestCode, // must be INT to identify the alarm
            second : Math.floor(seconds),
            contentTitle : 'Hörkunst im DeutschlandRadio',
            contentText : _item.title,
            playSound : true,
            icon : Ti.App.Android.R.drawable.appicon,
            sound : Ti.Filesystem.getResRawDirectory() + 'kkj', //Set a custom sound to play
        };
        alarmManager.addAlarmNotification(alarm);
        console.log(alarm);
        Ti.UI.createNotification({
            message : 'Erinnerung an „' + _item.title + '“ gesetzt.'
        }).show();
    },
    killFav : function(_item) {
        var link = Ti.Database.open(DB);
        var sql = 'delete from events where requestCode=station="' + _item.station + '" and pubdate="' + _item.datetime + '"';
        link.execute(sql);
        link.close();
    },
    toggleFav : function(_requestCode) {
        if (this.isFav(_requestCode)) {
            this.killFav(_requestCode);
        } else {
            this.addFav(_requestCode);
        }
        return this.isFav(_requestCode);
    },
    getAllFavs : function() {
        var link = Ti.Database.open(DB);
        var rows = link.execute('select * from fav order by pubdate desc');
        var items = [];
        while (rows.isValidRow()) {
            items.push(JSON.parse(rows.fieldByName('json')));
            rows.next();
        }
        rows.close();
        link.close();
        return items;
    },
    isFav : function(_requestCode) {
        var link = Ti.Database.open(DB);
        var rows = link.execute('select * from events where requestCode=?', _requestCode);
        var found = rows.rowCount ? true : false;
        rows.close();
        link.close();
        return found;
    },
};
module.exports = Module;
//http://www.deutschlandradiokultur.de/hoerkunst.1656.de.rss

