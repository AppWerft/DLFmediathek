var Moment = require('vendor/moment'),
    XMLTools = require('vendor/XMLTools'),
    Model = require('model/stations');

// http://jsfiddle.net/wkk95aov/

//http://www.deutschlandradiokultur.de/hoerkunst.1656.de.rss
exports.getAll = function(_args) {
    if (Ti.App.Properties.hasProperty('HOERKUNST')) {
        _args.done(JSON.parse(Ti.App.Properties.getString('HOERKUNST')));
    }
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
                header && items.push({
                    title : header.text,
                    subtitle : (header.span) ? header.span.text : null,
                    description : article[1].p.text,
                    image : article[0].a.img.src,
                    pubdate : article[1].p.a.text.replace(/[\s]{3,}/, ' ')
                });
            };
            Ti.App.Properties.setString('HOERKUNST', JSON.stringify(items));
            _args.done(items);
        }
    });
    xhr.open('GET', Model[_args.station].hoerkunst);
    xhr.send();
};

exports.setAlarm = function(_item) {
    var alarmManager = require('bencoding.alarmmanager').createAlarmManager();
    var requestCode = parseInt(Ti.Utils.md5HexDigest(JSON.stringify(_item)).replace(/[\D]/g, '').substr(0, 8));
    var pubdate = Moment(_item.pubdate.split(' | ')[1].replace(' Uhr', ''), 'DD.MM.YYYY HH:mm');
    var alarm = {
        requestCode : requestCode, // must be INT to identify the alarm
        second : 0,
        minute : pubdate.minute(),
        hour : pubdate.hour(),
        day : pubdate.date(),
        month : pubdate.month(),
        year : pubdate.year(),
        contentTitle : 'Hörkunst im DeutschlandRadio',
        contentText : _item.title,
        playSound : true,
        icon : Ti.App.Android.R.drawable.appicon,
        sound : Ti.Filesystem.getResRawDirectory() + 'alarm', //Set a custom sound to play
    };
    alarmManager.addAlarmNotification(alarm);
    Ti.UI.createNotification({
        message : 'Erinnerung an „' + _item.title + '“ gesetzt.'
    }).show();
};