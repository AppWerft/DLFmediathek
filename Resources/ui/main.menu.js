var АктйонБар = require('com.alcoapps.actionbarextras');

var Player = Ti.Media.createAudioPlayer({
    allowBackground : true,
    volume : 1
});

var currentItem = null;

module.exports = function(_event) {
    var currentStation = '';
    АктйонБар.title = 'DeutschlandRadio';
    АктйонБар.subtitle = 'Mediathek';
    АктйонБар.titleFont = "ScalaSansBold";
    АктйонБар.subtitleColor = "#ccc";
    var activity = _event.source.getActivity();
    if (activity) {
        var FlipViewCollection = _event.source.FlipViewCollection;
        activity.onCreateOptionsMenu = function(_menuevent) {
            var currentPage = FlipViewCollection.views[0];
            _menuevent.menu.clear();

            _menuevent.menu.add({
                title : 'Tagesplan',
                itemId : '0',
                icon : Ti.App.Android.R.drawable.ic_action_rss,
                showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
            }).addEventListener("click", function(_e) {
                require('ui/rss.window')(currentStation);
            });

            _menuevent.menu.add({
                title : 'RadioStart',
                itemId : '1',
                icon : Ti.App.Android.R.drawable.ic_action_play,
                showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
            }).addEventListener("click", function(_e) {
                var nextItem = FlipViewCollection.getViews()[FlipViewCollection.getCurrentPage()].itemId.name;
                console.log('Current=' + currentItem + ' nextItem=' + nextItem);
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
                currentStation = FlipViewCollection.getViews()[_e.index].itemId.name;
                activity.actionBar.logo = '/images/' + currentStation + '.png';
                var menuitem = _menuevent.menu.findItem('0');
                if (currentStation == 'drw')
                    menuitem.setVisible(false);
                else
                    menuitem.setVisible(true);
            });
            Ti.App.addEventListener('app:play', function(_event) {
                console.log(_event.item);
                var self = Ti.UI.createAlertDialog({
                    message : _event.item.title,
                    ok : 'Beitrag anhören',
                    title : _event.item.sendung.text
                });
                self.show();
                self.addEventListener('click', function(_e) {
                    console.log(_e);
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
