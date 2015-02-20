var Favs = new (require('controls/favorites.adapter'))();
var Moment = require('vendor/moment');
Moment.locale('de');

const HEIGHT_OF_CURRENTBOX = 150;

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
    }, 5000);
    self.containerforcurrenttext = Ti.UI.createScrollView({
        top : -HEIGHT_OF_CURRENTBOX,
        scrollType : 'vertical',
        contentHeight : Ti.UI.SIZE,
        backgroundColor : '#444',
        layout : 'vertical',
        height : HEIGHT_OF_CURRENTBOX
    });

    self.add(self.containerforcurrenttext);
    self.add(Ti.UI.createView({
        top : 0,
        height : 7,
        backgroundColor : _args.color
    }));

    self.list = Ti.UI.createListView({
        top : 7,
        height : Ti.UI.FILL,
        backgroundColor : _args.color,
        templates : {
            'mediathek' : require('TEMPLATES').mediathek,
        },
        defaultItemTemplate : 'mediathek',
        sections : [Ti.UI.createListSection({})]
    });
    self.add(self.list);
    var dataItems = [];
    var currentLiveHash = '';
    var currentMediathekHash = '';
    self.showCurrent = function() {

        self.containerforcurrenttext.setTop(0);
        require('controls/rpc.adapter')({
            url : _args.live,
            nocache : true,
            onload : function(_res) {
                self.list.animate({
                    top : HEIGHT_OF_CURRENTBOX,
                    duration : 700
                });
                if (currentLiveHash == _res.hash)
                    return;
                currentLiveHash = _res.hash;
                var live = _res.live;
                //       console.log(live);
                self.containerforcurrenttext.top = 0;
                self.containerforcurrenttext.removeAllChildren();
                self.containerforcurrenttext.add(Ti.UI.createLabel({
                    right : 50,
                    top : 8,
                    color : '#eee',
                    font : {
                        fontSize : 16,
                        fontFamily : 'ScalaSans'
                    },
                    text : 'seit: ' + live['time_start']
                }));
                self.containerforcurrenttext.add(Ti.UI.createLabel({
                    left : 10,
                    top : -5,
                    text : live.name,
                    color : _args.color,
                    font : {
                        fontSize : 20,
                        fontFamily : 'ScalaSansBold'
                    },
                    right : 50

                }));
                if ( typeof live.text == 'string') {
                    self.containerforcurrenttext.add(Ti.UI.createLabel({
                        left : 10,
                        right : 50,
                        top : 0,
                        bottom : 100,
                        text : live.text.substr(live.name.length).trim(),
                        font : {
                            fontSize : 14,
                            fontFamily : 'ScalaSans'
                        },
                        color : '#eee'
                    }));
                }
            }
        });
    };
    /* hiding of todays display */
    self.hideCurrent = function() {
        self.list.setTop(7);
        self.containerforcurrenttext.setTop(-HEIGHT_OF_CURRENTBOX);
    };
    self.updatePodcasts = function() {
        if (activityworking == false) {
            return;
        }
        require('controls/rpc.adapter')({
            url : _args.podcasts,
            type : 'mediathek',
            nocache : (self.date.isSame(Moment().startOf('day'))) ? true : false,
            date : self.date.format('DD.MM.YYYY'),
            onload : function(_res) {
                if (currentMediathekHash == _res.hash)
                    return;
                currentMediathekHash = _res.hash;
                self.list.sections = [];

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
                    self.list.appendSection(Ti.UI.createListSection({
                        headerTitle : sendung.name,
                        items : dataitems
                    }));
                });
                if (self.date.isSame(Moment().startOf('day')))
                    self.showCurrent();
                self.list.setMarker({
                    sectionIndex : 0,
                    itemIndex : 15
                });
                self.list.addEventListener('marker', function(e) {
                    self.containerforcurrenttext.animate({
                        top : -HEIGHT_OF_CURRENTBOX,
                    });
                    self.list.animate({
                        top : 0,
                        duration : 600
                    });
                    return;
                    self.list.setMarker({
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

    self.list.addEventListener('itemclick', function(_e) {
        if (_e.bindId && _e.bindId == 'fav') {
            var item = _e.section.getItemAt(_e.itemIndex);
            var isfav = Favs.toggleFav(JSON.parse(item.properties.itemId));
            item.fav.image = isfav ? '/images/fav.png' : '/images/favadd.png';
            item.fav.opacity = isfav ? 0.8 : 0.5;
            _e.section.updateItemAt(_e.itemIndex, item);
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
