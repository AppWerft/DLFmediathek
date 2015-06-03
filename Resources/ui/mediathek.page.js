var Favs = new (require('controls/favorites.adapter'))(),
    Model = require('model/stations');
RSS = new (require('controls/rss.adapter'))();
var Moment = require('vendor/moment');
Moment.locale('de');

const HEIGHT_OF_TOPBOX = 160;

module.exports = function(_args) {
    var activityworking = true;
    var self = Ti.UI.createView({
        backgroundColor : '#444',
        station : _args.station,
        date : Moment().startOf('day'),
        itemId : {
            name : _args.station,
            podcasts : _args.podcasts,
            live : _args.live,
            stream : _args.stream
        },
    });
    Ti.App.addEventListener('daychanged', function() {
        self.date = Moment().startOf('day');
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
    self.bottomView = require('com.rkam.swiperefreshlayout').createSwipeRefresh({
        view : self.bottomList,
        height : Ti.UI.FILL,
        width : Ti.UI.FILL,
        backgroundColor : '#444'
    });
    self.bottomView.addEventListener('refreshing', function() {
        if (Math.random() > 0.9)
            Ti.UI.createNotification({
                message : 'Sehr gut, Medienkompetenz=1!\nAber bitte nicht allzuoft hier ziehen. Empfehlung: so alle fünf Minuten – sonst leierst aus …'
            }).show();
        setTimeout(function() {
            self.bottomView.setRefreshing(false);
        }, 5000);
        self.updatePodcasts();
    });
    self.add(self.bottomView);
    var dataItems = [];
    var lastPubDate = null;
    var currentMediathekHash = null;
    self.updateCurrentinTopBox = function(_forced) {
        var currentItem = RSS.getCurrentOnAir({
            station : _args.station
        });
        if (currentItem) {
            lastPubDate = currentItem.pubDate;
            self.topBox.setTop(8);
            self.bottomView.setTop(HEIGHT_OF_TOPBOX);
            TopBoxWidget.setProgress(currentItem.progress);
            TopBoxWidget.setPubDate(currentItem.pubDate);
            TopBoxWidget.setTitle(currentItem.title);
            TopBoxWidget.setDescription(currentItem.description);
            self.bottomView.animate({
                top : HEIGHT_OF_TOPBOX,
                duration : 700
            });
        }
    };
    /* hiding of todays display */
    self.hideCurrent = function() {
        self.bottomView.setTop(7);
        self.topBox.setTop(-HEIGHT_OF_TOPBOX);
    };
    self.updatePodcasts = function() {
        self.bottomView.setRefreshing(true);
        setTimeout(function() {
            self.bottomView.setRefreshing(false);
        }, 10000);
        if (activityworking == false) {
            return;
        }
        require('controls/rpc.adapter')({
            url : _args.podcasts,
            nocache : (self.date.isSame(Moment().startOf('day'))) ? true : false,
            date : self.date.format('DD.MM.YYYY'),
            onload : function(_res) {
                self.bottomView.setRefreshing(false);
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
                            share : {
                                opacity : 0.7
                            },
                            autor : {
                                text : (item.author) ? 'Autor: ' + item.author : '',
                                height : (item.author) ? Ti.UI.SIZE : 0
                            },
                            duration : {
                                text : (item.duration) ? 'Dauer: ' + Moment().startOf('day').seconds(item.duration).format('m:ss') : '',

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
                    self.bottomView.animate({
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
        self.cron = setInterval(self.updatePodcasts, 300000);
    else
        clearInterval(self.cron);

    self.bottomList.addEventListener('itemclick', function(_e) {
        if (_e.bindId && _e.bindId == 'fav') {
            var item = _e.section.getItemAt(_e.itemIndex);
            var isfav = Favs.toggleFav(JSON.parse(item.properties.itemId));
            item.fav.image = isfav ? '/images/fav.png' : '/images/favadd.png';
            item.fav.opacity = isfav ? 0.8 : 0.5;
            _e.section.updateItemAt(_e.itemIndex, item);
        } else if (_e.bindId && _e.bindId == 'share') {
            Ti.Media.vibrate();
            require('ui/sharing.chooser')(function(_type) {
                require('vendor/socialshare')({
                    type : _type,
                    message : 'Höre gerade mit der #DRadioMediathekApp „' + JSON.parse(_e.itemId).subtitle + '“ auf ' + Model[_args.station].name,
                    url : JSON.parse(_e.itemId).url,
                    // image : fileToShare.nativePath,
                });
            });
            /**/
        } else if (_e.bindId && _e.bindId == 'playtrigger') {
            Ti.App.fireEvent('app:play', {
                item : JSON.parse(_e.itemId)
            });
        }
    });
    setInterval(self.updateCurrentinTopBox, 5000);
    Ti.App.addEventListener('app:state', function(_payload) {
        activityworking = _payload.state;
    });
    return self;
};
