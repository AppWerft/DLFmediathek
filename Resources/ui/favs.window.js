"use scrict";

var Model = require('model/stations'),
    Favs = new (require('controls/favorites.adapter'))(),
    Moment = require('vendor/moment');
Moment.locale('de');

module.exports = function(station) {
    var self = require('ui/generic.window')({
        title : 'DeutschlandRadio',
        subtitle : 'Meine Vormerkliste',
        station : null,
        menu : [{
            item : {
                title : 'RadioStart',
                itemId : '1',
                icon : Ti.App.Android.R.drawable.ic_action_play,
                showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
            },
            onclick : function() {
            }
        }]
    });
    self.Player = Ti.Media.createAudioPlayer({
        allowBackground : true
    });
    self.list = Ti.UI.createListView({
        templates : {
            'favorite' : require('TEMPLATES').favorite,
        },
        defaultItemTemplate : 'favorite',
        sections : [Ti.UI.createListSection({})]
    });
    self.add(self.list);
    var dataItems = [];
    
    function startPlayer(){
        var url = JSON.parse(dataItems[0].properties.itemId);
    }
    function updateList() {

        Favs.getAllFavs().forEach(function(item) {
            var autor = item.author;
            if ( typeof autor == 'string') {
                autor = autor.split(', ')[1] + ' ' + autor.split(', ')[0];
            } else
                autor = autor.text;
            dataItems.push({
                properties : {
                    accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE,
                    itemId : JSON.stringify(item),
                },
                pubdate : {
                    text : Moment(item.datetime).format('LLLL')
                },
                title : {
                    text : item.sendung.text
                },
                subtitle : {
                    color : Model[item.station].color,
                    text : item.title || '',
                },
                logo : {
                    image : '/images/' + item.station + '.png',
                },
                trash : {
                    image : '/images/trash.png',
                },
                autor : {
                    text : (autor != undefined) ? 'Autor: ' + autor : ''
                }
            });
        });
        self.list.sections[0].setItems(dataItems);
    }

    setTimeout(updateList, 50);
    self.list.addEventListener('itemclick', function(_e) {
        if (_e.bindId && _e.bindId == 'trash') {
            var item = _e.section.getItemAt(_e.itemIndex);
            Favs.killFav(JSON.parse(item.properties.itemId));
            updateList();
        }
    });
    self.Player.addEventListener('complete', function() {

        /* killFav */
        Favs.killFav(JSON.parse(dataItems.shift().properties.itemId));
        /* refreshList */
        updateList();
        /* restart with toppest mp3 */
        startPlayer();
    });
    return self;
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

