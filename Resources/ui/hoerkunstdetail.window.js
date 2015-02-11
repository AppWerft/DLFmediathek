var Model = require('model/stations'),
    Moment = require('vendor/moment');

module.exports = function(args) {
    var item = args.item;
    var color = Model[args.station].color;
    var self = require('ui/generic.window')({
        title : item.title,
        subtitle : item.pubdate,
        station : args.station
    });
    self.container = Ti.UI.createScrollView({
        layout : 'vertical',
        scrolltype : 'vertical'
    });
    self.add(self.container);
    self.container.add(Ti.UI.createImageView({
        image : item.image,
        top : 0,
        width : Ti.UI.FILL,height:'auto'
    }));
    
    return self;
};
