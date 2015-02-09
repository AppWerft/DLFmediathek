var Moment = require('vendor/moment');

module.exports = function(_args) {
    var self = require('ui/generic.window')({
        title : 'Deutschlandradio',
        subtitle : _args.title,
        station : _args.station
    });
    self.list = Ti.UI.createListView({
        height : Ti.UI.FILL,
        backgroundColor : _args.station,
        templates : {
            'podcastlist' : require('TEMPLATES').podcastlist,
        },
        defaultItemTemplate : 'podcastlist',
        sections : [Ti.UI.createListSection({})]
    });
    var items = [];
    require('controls/feed.adapter')({
        url : _args.url,
        onload : function(_feeditems) {
            _feeditems.items.forEach(function(item) {
                console.log(item.description);
                var res = /<img src="(.*?)" /gmi.exec(item.description);
                console.log(res);
                var image = (res) ? res[1] : '';
                items.push({
                    pubdate : {
                        text : Moment(item.pubDate).format('LLL')
                    },
                    image : {
                        image : image,
                        defaultImage : '/images/' + _args.station+ '.png'
                    },
                    title : {
                        text : item.title,
                        color : _args.color
                    },
                    duration : {
                        text : 'Dauer: ' + item['itunes:duration'].trim(),
                    },
                    author : {
                        text : 'Autor: ' + item['itunes:author'].trim(),
                    }
                });

            });
            self.list.sections[0].setItems(items);
        }
    });
    self.add(self.list);
    self.open();
};
