var Moment = require('vendor/moment');

module.exports = function(_args) {
    var self = require('ui/generic.window')({
        title : 'Deutschlandradio',
        subtitle : _args.title,
        station : _args.station
    });
    var Player = new (require('ui/audioplayer.widget'))();
    self.AudioPlayerView = Player.createView({
        color : _args.color
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
                var res = /<img src="(.*?)" /gmi.exec(item.description);
                var image = (res) ? res[1] : null;
                items.push({
                    pubdate : {
                        text : Moment(item.pubDate).format('LLL')
                    },
                    image : {
                        image : image,
                        height : (image != null) ? 70 : 90,
                        defaultImage : '/images/' + _args.station + '.png'
                    },
                    title : {
                        text : item.title,
                        color : _args.color
                    },
                    duration : {
                        text : 'Dauer: ' + item['itunes:duration'],
                    },
                    author : {
                        text : 'Autor: ' + item['itunes:author'],
                    },
                    properties : {
                        itemId : JSON.stringify(item)
                    }
                });

            });
            self.list.sections[0].setItems(items);
        }
    });
    self.add(self.list);
    self.add(self.AudioPlayerView);
    self.list.addEventListener('itemclick', function(_e) {
        var item = JSON.parse(_e.itemId);
        console.log(item);
        var sec = parseInt(item['itunes:duration'].split(':')[0]) * 60 + parseInt(item['itunes:duration'].split(':')[1]);
        Player.startPlayer({
            url : item.enclosure.url,
            title: item.title,
            sec : sec,
            duration : item['itunes:duration']
        });
    });
    self.open();
};
