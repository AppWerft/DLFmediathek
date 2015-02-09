module.exports = function(station) {
    var self = require('ui/generic.window')({
        title : 'Deutschlandradio',
        subtitle : 'Sendungen zum Nachhören',
        station : station
    });
    setTimeout(function() {
        var m = 'model/' + station;
        var model = require(m);
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
                    url : (item.a) ? item.a.img.alt : item.href,
                }
            }));
        });
        self.add(self.list);
        self.list.addEventListener('click', function(_e) {
            require('ui/podcastlist.window')({
                color : model.color,
                url : _e.source.itemId.url,
                title : _e.source.itemId.title,
                station : station
            });
        });
    }, 10);
    self.open();
};
