var Model = require('model/stations'),
    Favs = new (require('controls/favorites.adapter'))(),
    Moment = require('vendor/moment');
Moment.locale('de');

module.exports = function(station) {
    var self = require('ui/generic.window')({
        title : 'DeutschlandRadio',
        subtitle : 'Meine Podcasts',
        station : null
    });
    self.list = Ti.UI.createListView({
        templates : {
            'favorite' : require('TEMPLATES').favorite,
        },
        defaultItemTemplate : 'favorite',
        sections : [Ti.UI.createListSection({})]
    });
    self.add(self.list);
    function updateList() {
        var dataItems = [];
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
    updateList();
    self.list.addEventListener('itemclick', function(_e) {
        if (_e.bindId && _e.bindId == 'trash') {
            var item = _e.section.getItemAt(_e.itemIndex);
            Favs.killFav(JSON.parse(item.properties.itemId));
            updateList();
        }
    });
    return self;
};


