var АктйонБар = require('com.alcoapps.actionbarextras');

var Player = Ti.Media.createAudioPlayer({
    allowBackground : true,
    volume : 1
});

var currentItem = null;

module.exports = function(_event) {
    var currentStationName = 'dlf';
    АктйонБар.title = 'DRadio';
    АктйонБар.subtitle = 'Mediathek';
    АктйонБар.titleFont = "ScalaSansBold";
    АктйонБар.subtitleColor = "#ccc";
    //dropdown = АктйонБар.createDropdown({
    //    titles : ["Spielplan des Tages", "Podcasts", "Third"]
    //});
    var activity = _event.source.getActivity();
    if (activity) {
        var FlipViewCollection = _event.source.FlipViewCollection;
        activity.onCreateOptionsMenu = function(_menuevent) {

            var currentPage = FlipViewCollection.views[Ti.App.Properties.getInt('LAST_STATION_NDX', 0)];
            activity.actionBar.logo = '/images/' + Ti.App.Properties.getString('LAST_STATION', 'dlf') + '.png';
            _menuevent.menu.clear();
            _menuevent.menu.add({
                title : 'RadioStart',
                itemId : '1',
                icon : Ti.App.Android.R.drawable.ic_action_play,
                showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
            }).addEventListener("click", function(_e) {
                var nextItem = FlipViewCollection.getViews()[FlipViewCollection.getCurrentPage()].itemId.name;
                if (Player.isPlaying()) {
                    Player.stop();
                    Player.release();
                    console.log('was playing');
                    if (currentItem == nextItem) {
                        return;
                    }
                }
                currentItem = FlipViewCollection.getViews()[FlipViewCollection.getCurrentPage()].itemId.name;
                require('controls/resolveplaylist')({
                    playlist : FlipViewCollection.getViews()[FlipViewCollection.getCurrentPage()].itemId.stream,
                    onload : function(_url) {
                        Player.release();
                        Player.setUrl(_url);
                        Player.start();
                    }
                });
            });
            _menuevent.menu.add({
                title : 'Tagesplan',
                itemId : '2',
                icon : Ti.App.Android.R.drawable.ic_action_rss,
                showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
            }).addEventListener("click", function(_e) {
                require('ui/dayplan.window')(currentStationName);
            });
            _menuevent.menu.add({
                title : 'Klangkunst',
                itemId : '4',
                icon : Ti.App.Android.R.drawable.ic_action_ohr,
                showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
            }).addEventListener("click", function(_e) {
                 require('ui/hoerkunst.window')(currentStationName);
            });

            _menuevent.menu.add({
                title : 'Podcasts',
                itemId : '3',
                icon : Ti.App.Android.R.drawable.ic_action_feed,
                showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
            }).addEventListener("click", function(_e) {
                require('ui/podcasts.window')(currentStationName);
            });

            // end of click handling

            /* Handling of PlayIcon*/
            var menuitem = _menuevent.menu.findItem('1');
            Player.addEventListener('change', function(_e) {
                console.log('state: ' + _e.state);
                switch (_e.state) {
                case 3:
                    menuitem.setIcon(Ti.App.Android.R.drawable.ic_action_stop);
                    break;
                case 4:
                case 5:
                    menuitem.setIcon(Ti.App.Android.R.drawable.ic_action_play);
                    break;

                };
            });
            activity.actionBar.displayHomeAsUp = false;
            FlipViewCollection.addEventListener('flipped', function(_e) {
                currentStationName = FlipViewCollection.getViews()[_e.index].itemId.name;
                Ti.App.Properties.setInt('LAST_STATION_NDX', _e.index);
                Ti.App.Properties.setString('LAST_STATION', currentStationName);
                activity.actionBar.logo = '/images/' + currentStationName + '.png';
                var menuitem = _menuevent.menu.findItem('2');
                if (currentStationName == 'drw')
                    menuitem.setVisible(false);
                else
                    menuitem.setVisible(true);
            });
            Ti.App.addEventListener('app:stop', function(_event) {
                if (Player.isPlaying()) {
                    Player.stop();
                    Player.release();
                }
            });
            Ti.App.addEventListener('app:play', function(_event) {
                var self = Ti.UI.createAlertDialog({
                    message : _event.item.title,
                    ok : 'Beitrag anhören',
                    title : _event.item.sendung.text
                });
                self.show();
                self.addEventListener('click', function(_e) {
                    if (_e.index < 0)
                        return;
                    if (Player.isPlaying()) {
                        Player.stop();
                        Player.release();
                    }
                    Player.setUrl(_event.item.url);
                    Player.start();
                });
            });
        };
        activity.invalidateOptionsMenu();
        require('vendor/versionsreminder')();
    }
    // require('vendor/versionsreminder')();
};
