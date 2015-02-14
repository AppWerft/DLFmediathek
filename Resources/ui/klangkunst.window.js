var Model = require('model/stations'),
    Moment = require('vendor/moment'),
    Klangkunst = new (require('controls/klangkunst.adapter'))(),
    alarmManager = require('bencoding.alarmmanager').createAlarmManager();

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
            'klangkunst' : require('TEMPLATES').klangkunst,
        },
        defaultItemTemplate : 'klangkunst',
        sections : [Ti.UI.createListSection({})]
    });
    self.add(self.list);
    Klangkunst.getAllEvents({
        station : station,
        done : function(_items) {
            var items = [];
            _items.forEach(function(item) {
                console.log(item);
                items.push({
                    properties : {
                        //accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE,
                        itemId : JSON.stringify(item),
                        requestCode : item.requestCode
                    },
                    image : {
                        image : item.image
                    },
                    alarm : {
                        image : (item.isFaved) ? '/images/alarmfaved.png' : '/images/alarm.png',
                        opacity : 0.5
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
        if (_e.bindId && _e.bindId == 'alarm') {
            var item = _e.section.getItemAt(_e.itemIndex);
            var requestCode = item.properties.requestCode;
            Klangkunst.toggleFav(JSON.parse(item.properties.itemId));
            item.alarm.image = ( Klangkunst.isFav(requestCode)) ? '/images/alarmfaved.png' : '/images/alarm.png';
            _e.section.updateItemAt(_e.itemIndex, item);
        } else
            var win = require('ui/klangkunstdetail.window')({
                item : JSON.parse(_e.itemId),
                station : station
            });
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