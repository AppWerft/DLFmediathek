var Model = require('model/stations'),
    Feed = new (require('controls/feed.adapter'))(),
    Moment = require('vendor/moment'),
    АктйонБар = require('com.alcoapps.actionbarextras');

module.exports = function(_args) {
    var self = Ti.UI.createWindow({
        fullscreen : true,
        orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
    });

    var Player = new (require('ui/audioplayer.widget'))();
    self.AudioPlayerView = Player.createView({
        color : _args.color
    });
    self.list = Ti.UI.createListView({
        height : Ti.UI.FILL,
        backgroundColor : _args.station,
        templates : {
            'podcastlist' : require('TEMPLATES').podcastlist,
        },
        defaultItemTemplate : 'podcastlist',
        sections : [Ti.UI.createListSection({})]
    });
    var items = [];
    Feed.getFeed({
        url : _args.url,
        done : function(_feeditems) {
            _feeditems.items.forEach(function(item) {
                var res = /<img src="(.*?)" /gmi.exec(item.description);
                var image = (res) ? res[1] : null;
                items.push({
                    pubdate : {
                        text : Moment(item.pubDate).format('LLL')
                    },
                    image : {
                        image : image,
                        height : (image != null) ? 70 : 90,
                        defaultImage : '/images/' + _args.station + '.png'
                    },
                    title : {
                        text : item.title,
                        color : _args.color
                    },
                    duration : {
                        text : 'Dauer: ' + item['itunes:duration'],
                    },
                    author : {
                        text : 'Autor: ' + item['itunes:author'],
                    },
                    properties : {
                        itemId : JSON.stringify(item)
                    }
                });
            });
            self.list.sections[0].setItems(items);
        }
    });
    self.add(self.list);
    self.add(self.AudioPlayerView);
    self.list.addEventListener('itemclick', function(_e) {
        var item = JSON.parse(_e.itemId);
        console.log(item);
        var sec = parseInt(item['itunes:duration'].split(':')[0]) * 60 + parseInt(item['itunes:duration'].split(':')[1]);
        Player.startPlayer({
            url : item.enclosure.url,
            title : item.title,
            sec : sec,
            duration : item['itunes:duration']
        });
    });
    self.addEventListener('close', function() {
        Player.stopPlayer();
    });
    self.addEventListener('open', function(_event) {
        АктйонБар.title = 'DeutschlandRadio';
        АктйонБар.subtitle = _args.title;
        АктйонБар.titleFont = "ScalaSansBold";
        АктйонБар.subtitleColor = "#ccc";
        var activity = _event.source.getActivity();
        if (activity) {
            console.log('activity');
            activity.onCreateOptionsMenu = function(_menuevent) {
                activity.actionBar.displayHomeAsUp = true;
                if (_args.station)
                    activity.actionBar.logo = '/images/' + _args.station + '.png';
                // _menuevent.menu.clear();
                _menuevent.menu.add({
                    title : 'Kanal merken',
                    itemId : '1',
                    icon : (Feed.isFaved(_args.url)) ? Ti.App.Android.R.drawable.ic_action_faved : Ti.App.Android.R.drawable.ic_action_favorite_add,
                    showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
                }).addEventListener("click", function(_e) {
                    var menuitem = _menuevent.menu.findItem('1');
                    Feed.toggleFaved(_args.url);
                    menuitem.setIcon(Feed.isFaved(_args.url) ? Ti.App.Android.R.drawable.ic_action_faved : Ti.App.Android.R.drawable.ic_action_favorite_add);
                });
                activity.actionBar.onHomeIconItemSelected = function() {
                    self.close();
                };
            };
            activity.invalidateOptionsMenu();
        }
    });
    return self;
};
