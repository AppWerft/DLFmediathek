var Model = require('model/stations'),
    Moment = require('vendor/moment');

module.exports = function(station) {
    station = 'drk';
    var color = Model[station].color;
    var self = require('ui/generic.window')({
        title : 'Klangkunst',
        subtitle : 'Hörspiel und Feature',
        station : station
    });
    self.list = Ti.UI.createListView({
        backgroundColor : station,
        templates : {
            'hoerkunst' : require('TEMPLATES').hoerkunst,
        },
        defaultItemTemplate : 'hoerkunst',
        sections : [Ti.UI.createListSection({})]
    });
    self.add(self.list);
    require('controls/hoerkunst.adapter')({
        station : station,
        done : function(_items) {
            var items = [];
            _items.forEach(function(item) {
                console.log(item);
                items.push({
                    properties : {
                        accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE,
                        itemId : JSON.stringify(item)
                    },
                    image : {
                        image : item.image
                    },
                    title : {
                        text : item.title
                    },
                    subtitle : {
                        text : (item.subtitle) ? item.subtitle.toUpperCase() : '',
                        height : (item.subtitle) ? Ti.UI.SIZE : 0,
                        color : color,
                    },
                    description : {
                        text : item.description
                    },
                    pubdate : {
                        text : item.pubdate
                    }
                });
            });
            self.list.sections[0].setItems(items);
        }
    });
    self.list.addEventListener('itemclick', function(_e) {
        var win = require('ui/hoerkunstdetail.window')({
            item : JSON.parse(_e.itemId),
            station : station
        }).open();
    });
    self.open();
};

function addEvent() {
    var intent = Ti.Android.createIntent({
        action : Ti.Android.ACTION_EDIT,
        type : 'vnd.android.cursor.item/event'
    });
    intent.putExtra('title', 'My title');
    intent.putExtra('description', 'My description');
    intent.putExtra('eventLocation', 'My location');
    intent.putExtra('beginTime', dateFromInMiliseconds);
    intent.putExtra('endTime', dateToInMiliseconds);
    Ti.Android.currentActivity.startActivity(intent);
}