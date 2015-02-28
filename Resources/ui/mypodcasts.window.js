var Model = require('model/stations'),
    Feeds = new (require('controls/feed.adapter'))(),
    Moment = require('vendor/moment');
Moment.locale('de');

module.exports = function() {
    var station='dlf';
    var self = require('ui/generic.window')({
        title : 'DeutschlandRadio',
        subtitle : 'Meine Podcasts',
        station : null
    });
    self.list = Ti.UI.createListView({
        templates : {
            'mypodcasts' : require('TEMPLATES').mypodcasts,
        },
        defaultItemTemplate : 'mypodcasts',
        sections : [Ti.UI.createListSection({})]
    });
    self.add(self.list);
    function updateList() {
        var dataItems = [];
        Feeds.getAllFavedFeeds().forEach(function(item) {
           /* var PATTERN = {
                "url" : "http://www.deutschlandfunk.de/podcast-computer-und-kommunikation-komplette-sendung.416.de.podcast.xml",
                "http_expires" : "Sat, 14 Feb 2015 21:20:08 GMT",
                "http_lastmodified" : "Sat, 14 Feb 2015 21:19:08 GMT",
                "http_etag" : "",
                "http_contentlength" : 2578,
                "title" : "Computer und Kommunikation (komplette Sendung) - Deutschlandfunk",
                "description" : "Jeden Samstag das Neueste aus Computertechnik und Informationstechnologie. Beiträge, Reportagen und Interviews zu IT-Sicherheit, Informatik, Datenschutz, Smartphones, Cloud-Computing und IT-Politik. Die Trends der IT werden kompakt und informativ zusammengefasst.",
                "category" : "Info",
                "station" : "",
                "pubDate" : "Sat, 14 Feb 2015 22:19:08 +0100",
                "lastBuildDate" : "Sat, 14 Feb 2015 22:19:08 +0100",
                "image" : "http://www.deutschlandfunk.de/media/files/d/d4a13a32cde15fff1f5bdbfc3688d14av1.jpg",
                "faved" : 1
            };*/
            console.log(item.image);
             console.log(station);
            dataItems.push({
                properties : {
                    accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE,
                    itemId : JSON.stringify(item),
                },
                lastbuilddate : {
                    text : 'Letzter Beitrag:\n' + Moment(item.lastBuildDate).format('LLLL')
                },
                title : {
                    text : item.title
                },
                description : {
                    text : item.description,
                },
                logo : {
                    image : item.image,
                    defaultImage : '/images/' + station + '.png'
                },

            });
        });
        self.list.sections[0].setItems(dataItems);
    }
    updateList();
    self.list.addEventListener('itemclick', function(_e) {
        require('ui/podcastlist.window')(JSON.parse(_e.itemId)).open();
    });
    return self;
};

