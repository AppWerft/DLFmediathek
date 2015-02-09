module.exports = function(station) {
    if (!station) return;
    var model = require('model/stations')[station];
    console.log(model);
    console.log(station);
    
    var self = require('ui/generic.window')({
        title : 'Deutschlandradio',
        subtitle : 'Heutiges Tagesprogramm',
        station : station
    });
    self.list = Ti.UI.createListView({
        height : Ti.UI.FILL,
        backgroundColor : station,
        templates : {
            'podcastlist' : require('TEMPLATES').podcastlist,
        },
        defaultItemTemplate : 'podcastlist',
        sections : [Ti.UI.createListSection({})]
    });
    var items = [];
    require('controls/feed.adapter')({
        url : model.rss,
        onload : function(_feeditems) {
            feeditems.forEach(function(item) {
            });
            self.list.sections[0].setItems(items);
        }
    });
    self.add(self.list);
    self.open();
};
