var Moment = require('vendor/moment');
var XMLTools = require('vendor/XMLTools');
var Model = require('model/stations');
// http://jsfiddle.net/wkk95aov/
module.exports = function(_args) {
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
                    pubdate : article[1].p.a.text.replace(/[\s]{3,}/,' ')
                });

            };
            _args.done(items);
        }
    });
    xhr.open('GET', Model[_args.station].hoerkunst);
    xhr.send();
};

var _1 = {
    "h3" : {
        "a" : {
            "span" : {
                "text" : "Familienleben",
                "class" : "drk-overline"
            },
            "text" : "Mein privates Glück",
            "href" : "familienleben-mein-privates-glueck.964.de.html?dram:article_id=305228"
        }
    },
    "p" : {
        "text" : "Es ist ein verhängnisvoller Tag, der Tag, an dem Georgs Schwester Johanna allein in die Ferien nach Würzburg fährt und sein Onkel Adam unerwartet zu Besuch kommt. ",
        "a" : {
            "text" : "Hörspiel |                   11.02.2015 21:30 Uhr",
            "href" : "familienleben-mein-privates-glueck.964.de.html?dram:article_id=305228",
            "class" : "drk-sendestrecke"
        }
    },
    "class" : "drk-small"
};
