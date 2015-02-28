var Model = require('model/stations'),
    Moment = require('vendor/moment'),
    Podcast = new (require('controls/feed.adapter'))();
    
module.exports = function(station) {
     if (!station)
        station = 'dlf';
    var self = require('ui/generic.window')({
        title : 'Deutschlandradio',
        subtitle : 'Sendungen zum Nachhören',
        station : station
    });
    setTimeout(function() {
        var m = 'model/' + station;
        var model = require(m);
        var color = require('model/stations')[station].color;
        self.list = Ti.UI.createScrollView({
            scrollType : 'vertical',
            layout : 'horizontal',
            horizontalWrap : true,
            contentWidth : Ti.UI.FILL,

            width : Ti.UI.FILL,
            height : Ti.UI.FILL,
        });
        model.forEach(function(item) {
            self.list.add(Ti.UI.createImageView({
                image : (item.a) ? item.a.img.src : item.img.src,
                width : (item.a) ? '50%' : '33.3%',
                height : 'auto',
                top : 0,
                left : 0,
                itemId : {
                    title : (item.a) ? item.a.img.alt : item.img.alt,
                    url : (item.a) ? item.a.href : item.href,
                }
            }));
        });
        self.add(self.list);
        self.list.addEventListener('click', function(_e) {
            if (_e.source.itemId)
                require('ui/podcastlist.window')({
                    color : color,
                    url : _e.source.itemId.url,
                    title : _e.source.itemId.title,
                    station : station
                }).open();
        });
    }, 100);
   return self;
};
