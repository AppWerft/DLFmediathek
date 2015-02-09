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
                console.log(item);
                items.push({
                    pubdate : {
                        text : Moment(item.pubDate).format('HH:mm')
                    },
                    description : {
                        html : ( typeof item.description == 'string') ? item.description : '',
                        height : ( typeof item.description == 'string') ? Ti.UI.SIZE : 0,

                    },
                    image:{image: item.image},
                    title : {
                        text : item.title,
                        color: _args.color
                    }
                });

            });
            self.list.sections[0].setItems(items);
        }
    });
    self.add(self.list);
    self.open();
};
