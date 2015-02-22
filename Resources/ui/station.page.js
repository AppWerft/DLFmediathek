var Favs = new (require('controls/favorites.adapter'))(),
    RSS = new (require('controls/rss.adapter'))();
var Moment = require('vendor/moment');
Moment.locale('de');

const HEIGHT_OF_TOPBOX = 150;

module.exports = function(_args) {
    var activityworking = true;
    var self = Ti.UI.createView({
        backgroundColor : '#fff',
        date : Moment().startOf('day'),
        itemId : {
            name : _args.name,
            podcasts : _args.podcasts,
            live : _args.live,
            stream : _args.stream
        },
    });
    setTimeout(function() {
        self.calendarView = require('ui/calendar.widget')({
            self : self,
            color : _args.color
        });
        self.add(self.calendarView);
    }, 3000);
    var TopBoxWidget = new (require('ui/currenttop.widget'))();
    self.topBox = TopBoxWidget.createView({
        height : HEIGHT_OF_TOPBOX,
        color : _args.color
    });

    self.add(self.topBox);
    self.add(Ti.UI.createView({
        top : 0,
        height : 7,
        backgroundColor : _args.color
    }));

    self.bottomList = Ti.UI.createListView({
        top : 7,
        height : Ti.UI.FILL,
        backgroundColor : _args.color,
        templates : {
            'mediathek' : require('TEMPLATES').mediathek,
        },
        defaultItemTemplate : 'mediathek',
        sections : [Ti.UI.createListSection({})]
    });
    self.add(self.bottomList);
    var dataItems = [];
    var lastPubDate = null;
    var currentMediathekHash = null;

    self.updateCurrentinTopBox = function(_forced) {
        var currentItem = RSS.getCurrentOnAir({
            station : _args.name
        });
        if (currentItem) {
            lastPubDate = currentItem.pubDate;
            self.topBox.setTop(8);
            self.bottomList.setTop(HEIGHT_OF_TOPBOX);

            TopBoxWidget.setPubDate(currentItem.pubDate);
            TopBoxWidget.setTitle(currentItem.title);
            TopBoxWidget.setDescription(currentItem.description);
            self.bottomList.animate({
                top : HEIGHT_OF_TOPBOX,
                duration : 700
            });
        }
    };
    /* hiding of todays display */
    self.hideCurrent = function() {
        self.bottomList.setTop(7);
        self.topBox.setTop(-HEIGHT_OF_TOPBOX);
    };
    self.updatePodcasts = function() {
        if (activityworking == false) {
            return;
        }
        require('controls/rpc.adapter')({
            url : _args.podcasts,
            nocache : (self.date.isSame(Moment().startOf('day'))) ? true : false,
            date : self.date.format('DD.MM.YYYY'),
            onload : function(_res) {
                if (currentMediathekHash == _res.hash)
                    return;
                currentMediathekHash = _res.hash;
                self.bottomList.sections = [];
                _res.mediathek.forEach(function(sendung) {
                    var dataitems = [];
                    sendung.subs.forEach(function(item) {
                        dataitems.push({
                            properties : {
                                accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE,
                                itemId : JSON.stringify(item),
                            },
                            start : {
                                text : item.start
                            },
                            playtrigger : {
                                bubbleParent : false
                            },
                            title : {
                                color : _args.color,
                                text : '',
                                height : 0
                            },
                            subtitle : {
                                text : item.subtitle,
                            },
                            fav : {
                                image : item.isfav ? '/images/fav.png' : '/images/favadd.png',
                                opacity : item.isfav ? 0.8 : 0.5
                            },
                            autor : {
                                text : (item.author) ? 'Autor: ' + item.author : '',
                                height : (item.author) ? Ti.UI.SIZE : 0
                            }
                        });
                    });
                    self.bottomList.appendSection(Ti.UI.createListSection({
                        headerTitle : sendung.name,
                        items : dataitems
                    }));
                });
                if (self.date.isSame(Moment().startOf('day')))
                    self.updateCurrentinTopBox();
                self.bottomList.setMarker({
                    sectionIndex : 5,
                    itemIndex : 0
                });
                self.bottomList.addEventListener('marker', function(e) {

                    self.topBox.animate({
                        top : -HEIGHT_OF_TOPBOX,
                    });
                    self.bottomList.animate({
                        top : 8,
                        duration : 600
                    });
                    return;
                    self.bottomList.setMarker({
                        sectionIndex : 0,
                        itemIndex : 0
                    });
                });
            }
        });
    };
    self.updatePodcasts();
    if (self.date.isSame(Moment().startOf('day')))
        self.cron = setInterval(self.updatePodcasts, 30000);
    else
        clearInterval(self.cron);

    self.bottomList.addEventListener('itemclick', function(_e) {
        if (_e.bindId && _e.bindId == 'fav') {
            var item = _e.section.getItemAt(_e.itemIndex);
            var isfav = Favs.toggleFav(JSON.parse(item.properties.itemId));
            item.fav.image = isfav ? '/images/fav.png' : '/images/favadd.png';
            item.fav.opacity = isfav ? 0.8 : 0.5;
            _e.section.updateItemAt(_e.itemIndex, item);
        } else if (_e.bindId && _e.bindId == 'sharetrigger') {
            require('com.alcoapps.socialshare').share({
                status : 'This is the status to share',
                image : fileToShare.nativePath,
                androidDialogTitle : 'Sharing is caring!!!'
            });
        } else if (_e.bindId && _e.bindId == 'playtrigger') {
            Ti.App.fireEvent('app:play', {
                item : JSON.parse(_e.itemId)
            });
        }
    });

    Ti.App.addEventListener('app:state', function(_payload) {
        activityworking = _payload.state;
    });

    return self;
};
