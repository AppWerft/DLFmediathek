var Model = require('model/stations'),
    Favs = new (require('controls/favorites.adapter'))();

var Moment = require('vendor/moment');
Moment.locale('de');

module.exports = function(station) {
    var self = Ti.UI.createWindow({
        theme : 'Theme.NoActionBar',
        fullscreen : true,
        backgroundColor : 'white'
    });
    self.head = Ti.UI.createView({
        left : 0,
        top : 0,
        height : 50,
        width : Ti.UI.FILL,
        backgroundColor : '#6B6A6A'
    });
    self.head.add(Ti.UI.createImageView({
        image : '/images/vormerklistekopf.png',
        height : 50,
        width : 280,
        left : 0
    }));
    var equalizer = Ti.UI.createWebView({
        borderRadius : 1,
        right : 55,
        height : 25,
        width : 100,
        visible : false,
        url : '/images/equalizer.gif'
    });
    self.head.add(equalizer);
    self.add(self.head);
    var playtrigger = Ti.UI.createImageView({
        image : '/images/playicon.png',
        width : 32,
        height : 32,
        opacity : 0.7,
        bubbleParent : false,
        right : 10
    });

    self.head.add(playtrigger);
    self.list = Ti.UI.createListView({
        top : 50,
        templates : {
            'merkliste' : require('TEMPLATES').merkliste,
        },
        defaultItemTemplate : 'merkliste',
        sections : [Ti.UI.createListSection({})]
    });
    self.add(self.list);
    self.Player = Ti.Media.createAudioPlayer({
        allowBackground : true,
    });

    var dataItems = [];
    function startPlayer() {
        if (self.Player.isPlaying()) {
            self.Player.stop();
            self.Player.release();
        }
        if (dataItems.length) {
            var url = JSON.parse(dataItems[0].properties.itemId).url + '?_=' + Math.random();
            // url = '/kkj.mp3';
            console.log('Info: player started with: ' + url);
            /*self.Player = Ti.Media.createAudioPlayer({
             allowBackground : true,
             url : url
             });*/
            self.Player.setUrl(url);
            //  self.Player.setUrl(url);
            self.Player.start();
        } else
            self.close();
    }

    function updateList() {
        console.log('Info: start updating Vormerkliste');
        dataItems = [];
        Favs.getAllFavs().forEach(function(item) {
            var autor = item.author;
            if ( typeof autor == 'string') {
                autor = autor.split(', ')[1] + ' ' + autor.split(', ')[0];
            } else
                autor = autor.text;
            var seconds = item.duration % 60;
            if (seconds < 10)
                seconds = '0' + seconds;
            var duration = Math.floor(item.duration / 60) + ':' + seconds;
            dataItems.push({
                properties : {
                    accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_NONE,
                    itemId : JSON.stringify(item),
                },
                pubdate : {
                    text : Moment(item.datetime).format('LLLL')
                },
                title : {
                    text : item.sendung.text
                },
                duration : {
                    text : duration
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
                trashcontainer : {
                    pubbleParent : true,
                },
                autor : {
                    text : (autor != undefined) ? 'Autor: ' + autor : ''
                }
            });
        });
        Ti.UI.createNotification({
            message : dataItems.length + ' Stücke in der Vormerkliste'
        }).show();
        console.log('Info: ' + dataItems.length + ' items in vormerkliste');
        self.list.sections[0].setItems(dataItems);
    }

    setTimeout(updateList, 10);
    self.list.addEventListener('itemclick', function(_e) {
        if (_e.bindId && _e.bindId == 'trash') {
            var item = _e.section.getItemAt(_e.itemIndex);
            var fav = JSON.parse(item.properties.itemId);
            Favs.killFav(fav);
            updateList();
        }
    });
    self.Player.addEventListener('complete', function(_e) {
        console.log(_e);
        self.Player.release();
        equalizer.hide();
        Favs.killFav(JSON.parse(dataItems[0].properties.itemId));
        self.list.sections[0].deleteItemsAt(0, 1);
        startPlayer();
    });

    self.addEventListener('close', function() {
        console.log('Info: merklisteWindow closed => kill player');
        if (self.Player.isPlaying()) {
            console.log('Warning: Player is active => stop and release');
            self.Player.stop();
            self.Player.release();
        }
    });
    self.Player.addEventListener('change', function(_e) {
        Ti.API.error(_e.state + '    ' + _e.description);
        switch (_e.description) {
        case 'playing':
            equalizer.show();
            playtrigger.setImage('/images/pauseicon.png');
            var section = self.list.getSections()[0];
            return;
            console.log(section);
            var item = section.getItemAt(0);
            console.log(item);
            item.trash.height = 0;
            item.autor.height = 0;
            item.duration.top = 72;
            item.title.height = 0;
            console.log('Info: item is modified => rerender');
            section.updateItemAt(0, item);
            break;
        case 'paused':
            playtrigger.setImage('/images/playicon.png');
             equalizer.hide();
        break;    
        default:
            equalizer.hide();
        }
    });
    playtrigger.addEventListener('click', function() {
        if (self.Player.isPlaying())
            self.Player.pause();
        else if (self.Player.isPaused())
            self.Player.play();
        else
            startPlayer()
    });
    self.head.addEventListener('click', function() {
        self.close();
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

