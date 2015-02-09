var Moment = require('vendor/moment');
Moment.locale('de');

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
    var calendartrigger = Ti.UI.createView({
        width : 200,
        right : -200,
        opacity : 0.9,
        top : 0,
        height : 40,
        color : 'white',
        text : 'Heute',
        zIndex : 999,
        transform : Ti.UI.create2DMatrix({
            rotate : 90,
            anchorPoint : {
                x : 0,
                y : 0
            }
        }),
        backgroundColor : _args.color,
        font : {
            fontSize : 20,
            fontFamily : 'ScalaSansBold'
        },
    });
    calendartrigger.add(Ti.UI.createLabel({
        text : 'Heute',
        left : 15,
        width : Ti.UI.FILL,
        color : 'white',
        touchEnabled : false,
        font : {
            fontSize : 22,
            fontFamily : 'ScalaSansBold'
        },
    }));
    calendartrigger.addEventListener('click', function(_e) {
        var picker = Ti.UI.createPicker({
            type : Ti.UI.PICKER_TYPE_DATE,
            minDate : new Date(2009, 0, 1),
            maxDate : Moment().toDate(),
            value : self.date.toDate(),
            locale : 'de'
        });
        picker.showDatePickerDialog({
            value : self.date.toDate(),
            callback : function(e) {
                if (!e.cancel) {
                    self.date = Moment(e.value).startOf('day');
                    calendartrigger.children[0].setText(Moment(self.date).format('LL'));
                    self.updatePodcasts();
                }
            }
        });
    });
    calendartrigger.addEventListener('swipe', function(_e) {
        if (_e.direction == 'left') {// back in time
            self.date = self.date.add(-1, 'd');
            self.hideCurrent();
        }
        if (_e.direction == 'right') {// forward in time
            if (self.date.isBefore(Moment().startOf('day'))) {
                self.date = self.date.add(1, 'd');
            }
        }
        _e.source.children[0].setText(Moment(self.date).format('LL'));
        self.updatePodcasts();
    });
    self.containerforcurrenttext = Ti.UI.createScrollView({
        top : -200,
        scrollType : 'vertical',
        contentHeight : Ti.UI.SIZE,
        backgroundColor : '#444',
        layout : 'vertical',
        height : 200
    });
    setTimeout(function() {
        self.add(calendartrigger);
    }, 5000);
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
            top : 200,
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
        self.containerforcurrenttext.setTop(-200);
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
