var Moment = require('vendor/moment');
Moment.locale('de');

const HEIGHT_OF_CURRENTBOX = 150;

module.exports = function(_args) {
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
            'podcast' : require('TEMPLATES').podcast,
        },
        defaultItemTemplate : 'podcast',
        sections : [Ti.UI.createListSection({})]
    });
    self.add(self.list);
    var dataItems = [];
    var currentHash = '';
    self.showCurrent = function() {
        self.list.animate({
            top : HEIGHT_OF_CURRENTBOX,
            duration : 700
        });
        self.containerforcurrenttext.setTop(0);
        require('controls/rpc.adapter')({
            url : _args.live,
            nocache : true,
            onload : function(_res) {
                if (currentHash == _res.hash)
                    return;
                currentHash = _res.hash;
                var live = _res.payload;

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
        require('controls/rpc.adapter')({
            url : _args.podcasts,
            nocache : (self.date.isSame(Moment().startOf('day'))) ? true : false,
            date : self.date.format('DD.MM.YYYY'),
            onload : function(_res) {
                dataItems = [];
                _res.payload.item.forEach(function(item) {
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
                        start : {
                            text : item.datetime.split(' ')[1].substr(0, 5)
                        },
                        title : {
                            color : _args.color,
                            text : item.sendung.text
                        },
                        subtitle : {
                            text : item.title || '',
                        },
                        autor : {
                            text : (autor != undefined) ? 'Autor: ' + autor : ''
                        }
                    });
                });
                self.list.sections[0].setItems(dataItems);
                self.list.setSections([self.list.sections[0]]);
                if (self.date.isSame(Moment().startOf('day')))
                    self.showCurrent();
                self.list.setMarker({
                    sectionIndex : 0,
                    itemIndex : 8
                });
                self.list.addEventListener('marker', function(e) {
                    self.containerforcurrenttext.animate({
                        top : -HEIGHT_OF_CURRENTBOX,
                    });
                    self.list.animate({
                        top : 0,
                        duration : 600
                    });return;
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
        self.cron = setInterval(self.updatePodcasts, 60000);
    else
        clearInterval(self.cron);
    self.list.addEventListener('itemclick', function(_e) {
        Ti.App.fireEvent('app:play', {
            item : JSON.parse(_e.itemId)
        });
    });
    return self;
};
