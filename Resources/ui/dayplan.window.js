var Moment = require('vendor/moment');

module.exports = function(station) {
    if (!station)
        return;
    var model = require('model/stations')[station];
    var self = require('ui/generic.window')({
        title : 'Deutschlandradio',
        subtitle : 'Heutiges Tagesprogramm',
        station : station
    });
    self.list = Ti.UI.createListView({
        height : Ti.UI.FILL,
        backgroundColor : station,
        templates : {
            'schema' : require('TEMPLATES').schema,
        },
        defaultItemTemplate : 'schema',
        sections : [Ti.UI.createListSection({})]
    });
    var items = [];
    require('controls/feed.adapter')({
        url : model.rss,
        onload : function(_feeditems) {
            _feeditems.items.forEach(function(item) {
                console.log(item.link);
                if ( typeof item.link != 'string')
                    item.link = null;
                items.push({
                    properties : {
                        accessoryType : (item.link) ? Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE : Ti.UI.LIST_ACCESSORY_TYPE_NONE,
                        itemId : (item.link) ? JSON.stringify(item) : undefined,
                    },
                    start : {
                        text : Moment(item.pubDate).format('HH:mm')
                    },
                    description : {
                        html : ( typeof item.description == 'string') ? item.description : '',
                        height : ( typeof item.description == 'string') ? Ti.UI.SIZE : 0,

                    },
                    title : {
                        text : item.title,
                        color : model.color
                    }
                });

            });
            self.list.sections[0].setItems(items);
        }
    });
    self.list.addEventListener('itemclick', function(_e) {
        if (_e.itemId) {
            var item = JSON.parse(_e.itemId);
            var win = require('ui/generic.window')({
                subtitle : item.title,
                title : 'Deutschlandradio',
                station : station
            });
            var web = Ti.UI.createWebView({
                borderRadius : 1,
                enableZoomControls : false,
                url : item.link
            });
            win.add(web);
            win.open();
        }
    });
    self.add(self.list);
    self.open();
};
