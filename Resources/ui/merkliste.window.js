var Model = require('model/stations'),
    Favs = new (require('controls/favorites.adapter'))();

var Moment = require('vendor/moment');
Moment.locale('de');

module.exports = function(station) {
    var self = Ti.UI.createWindow({
        theme : 'Theme.NoActionBar',
        fullscreen : true,
        backgroundColor : 'white',
        orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
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
    var equalizercontainer = Ti.UI.createView({
        right : 55,
        height : 30,
        width : 100
    });
    var equalizer = Ti.UI.createWebView({
        borderRadius : 1,
        width : Ti.UI.FILL,
        height : Ti.UI.FILL,
        visible : false,
        bottom : 0,
        url : '/images/equalizer.gif'
    });
    var progressview = Ti.UI.createView({
        bottom : 0,
        left : 0,
        width : 0,
        opacity : 0.15,
        backgroundColor : 'black',
        height : Ti.UI.FILL
    });
    equalizercontainer.add(equalizer);
    equalizercontainer.add(progressview);

    self.head.add(equalizercontainer);
    self.add(self.head);
    var playtrigger = Ti.UI.createImageView({
        image : '/images/playicon.png',
        width : 32,
        height : 32,
        opacity : 0.7,
        bubbleParent : false,
        right : 10
    });
    var downloadtrigger = Ti.UI.createImageView({
        image : '/images/downloadicon.png',
        width : 32,
        height : 32,
        opacity : 0.7,
        bubbleParent : false,
        right : 50
    });
    
    self.head.add(playtrigger);
    self.head.add(downloadtrigger);
    
    self.list = Ti.UI.createListView({
        top : 50,
        templates : {
            'merkliste' : require('TEMPLATES').merkliste,
            'merklisteactive' : require('TEMPLATES').merklisteactive,
        },
        defaultItemTemplate : 'merkliste',
        sections : [Ti.UI.createListSection({})]
    });
    self.add(self.list);
    self.Player = Ti.Media.createAudioPlayer({
        allowBackground : true,
        preload : true
    });
    var dataItems = [];
    function startPlayer() {
        if (self.Player.isPlaying()) {
            self.Player.stop();
            self.Player.release();
        }
        if (dataItems.length) {
            var item = JSON.parse(dataItems[0].properties.itemId);
            var url = item.url;
            // url = '/kkj.mp3';
            console.log('Info: player started with: ' + url);
            /*self.Player = Ti.Media.createAudioPlayer({
             allowBackground : true,
             url : url
             });*/
            self.Player.setUrl(url);
            self.Player.setTime(item.count);
            progressview.setWidth(0);
            //  self.Player.setUrl(url);
            self.Player.start();
        } else
            self.close();
    }

    function updateList() {
        dataItems = [];
        Favs.getAllFavs().forEach(function(item, ndx) {
            var autor = (item.author)?item.author:'';
           
            var seconds = item.duration % 60;
            if (seconds < 10)
                seconds = '0' + seconds;
            var duration = Math.floor(item.duration / 60) + ':' + seconds;
            dataItems.push({
                template : (ndx == 0) ? 'merklisteactive' : 'merkliste',
                properties : {
                    accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_NONE,
                    itemId : JSON.stringify(item)
                },
                pubdate : {
                    text : Moment(item.datetime).format('LLLL')
                },
                title : {
                    text : item.subtitle || ''
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
        self.list.sections[0].setItems(dataItems);
    }

    setTimeout(updateList, 10);
    self.list.addEventListener('itemclick', function(_e) {
        if (_e.bindId && _e.bindId == 'trash') {
            var item = _e.section.getItemAt(_e.itemIndex);
            Favs.killFav(JSON.parse(item.properties.itemId));
            updateList();
        }
    });
    self.Player.addEventListener('complete', function(_e) {
        console.log('Info: completing succeded ' + _e.success);
        self.Player.release();
        equalizer.hide();
        Favs.killFav(JSON.parse(dataItems[0].properties.itemId));
        console.log('last played audio deleted from model');
        // self.list.sections[0].deleteItemsAt(0, 1);
        console.log('last played audio deleted from view');
        updateList();
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
            downloadtrigger.hide();
            equalizer.setUrl('/images/equalizer.gif');
            playtrigger.setImage('/images/pauseicon.png');
            break;
        case 'paused':
            playtrigger.setImage('/images/playicon.png');
            equalizer.setUrl('/images/equalizer-13.png');
            break;
        default:
            equalizer.hide();
             downloadtrigger.show();
        }
    });
    self.Player.addEventListener('progress', function(_e) {
        if (dataItems.length) {
            var item = JSON.parse(dataItems[0].properties.itemId);
            item.count = _e.progress;
            console.log(_e.progress);
            Favs.savePlaytime(item);
            var duration = item.duration;
            var progress = _e.progress / 1000 / duration;
            progressview.setWidth(progress * 100);
        }
    });
    playtrigger.addEventListener('click', function() {
        if (self.Player.isPlaying())
            self.Player.pause();
        else if (self.Player.isPaused())
            self.Player.play();
        else
            startPlayer();
    });
    self.head.addEventListener('click', function() {
        self.close();
    });
    require('vendor/rating.reminder')();
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

