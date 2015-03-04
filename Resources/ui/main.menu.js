var Player = Ti.Media.createAudioPlayer({
    allowBackground : true,
    volume : 1
});
var АктйонБар = require('com.alcoapps.actionbarextras');

var stations = require('model/stations');
var currentRadio = null;
// listening
var currentStation = null;
// viewing

module.exports = function(_event) {
    var currentStationName = 'dlf';
    АктйонБар.setTitle('DRadio');
    АктйонБар.setSubtitle('Mediathek');
    АктйонБар.setFont("ScalaSansBold");
    АктйонБар.subtitleColor = "#ccc";
    var activity = _event.source.getActivity();
    if (activity) {
        activity.onCreateOptionsMenu = function(_menuevent) {
            _menuevent.menu.clear();
            _menuevent.menu.add({
                title : 'RadioStart',
                itemId : '1',
                icon : Ti.App.Android.R.drawable.ic_action_play,
                showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
            }).addEventListener("click", function() {
                var url = stations[currentRadio].stream;
                if (Player.isPlaying()) {
                    Player.stop();
                    Player.release();
                    console.log('was playing');
                    if (currentRadio == currentStation) {
                        return;
                    }
                }
                currentRadio = currentStation;
                require('controls/resolveplaylist')({
                    playlist : url,
                    onload : function(_url) {
                        Player.release();
                        Player.setUrl(_url);
                        Player.start();
                    }
                });
            });
            _menuevent.menu.add({
                title : 'Meine Vormerkliste',
                itemId : '5',
                icon : Ti.App.Android.R.drawable.ic_action_fav,
                showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
            }).addEventListener("click", function(_e) {
                require('ui/merkliste.window')().open();
            });
            _menuevent.menu.add({
                title : 'Meine Podcasts',
                itemId : '6',
                icon : Ti.App.Android.R.drawable.ic_action_fav,
                showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
            }).addEventListener("click", function(_e) {
                require('ui/mypodcasts.window')().open();
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
            Ti.App.addEventListener('app:station', function(_e) {
                currentStation = _e.station;
                if (!currentRadio)
                    currentRadio = _e.station;
                console.log('STATIONSWEXEL  ' + _e.station);
                switch (_e.station) {
                case 'dlf':
                    АктйонБар.setTitle('Deutschlandfunk');
                    break;
                case 'drk':
                    АктйонБар.setTitle('DRadio Kultur');
                    break;
                case 'drw':
                    АктйонБар.setTitle('DRadio Wissen');
                    break;
                }
                activity.actionBar.logo = '/images/' + _e.station + '.png';
            });
            Ti.App.addEventListener('app:stop', function(_event) {
                if (Player.isPlaying()) {
                    Player.stop();
                    Player.release();
                }
            });

            Ti.App.addEventListener('app:tab', function(_event) {
                if (_event.title)
                    АктйонБар.setTitle(_event.title);
                if (_event.subtitle)
                    АктйонБар.setSubtitle(_event.subtitle);
                if (_event.icon)
                    activity.actionBar.logo = '/images/' + _event.icon + '.png';
                if (_event.leftmenu) {
                    АктйонБар.setHomeAsUpIcon("/images/menu.png");
                    activity.actionBar.setDisplayHomeAsUp(true);
                    activity.actionBar.onHomeIconItemSelected = function() {
                       Ti.App.fireEvent('app:togglemapmenu');
                    }
                } else {
                    activity.actionBar.setDisplayHomeAsUp(false);
                    activity.actionBar.onHomeIconItemSelected = function() {}
                }

            });
            Ti.App.addEventListener('app:play', function(_event) {
                var self = Ti.UI.createAlertDialog({
                    message : _event.item.subtitle,
                    ok : 'Beitrag anhören',
                    title : _event.item.title
                });
                self.show();
                self.addEventListener('click', function(_e) {
                    if (_e.index < 0)
                        return;
                    if (Player.isPlaying()) {
                        Player.stop();
                    }
                    Player.release();
                    Player.setUrl(_event.item.url);
                    Player.start();
                });
            });
        };
        activity && activity.invalidateOptionsMenu();
        require('vendor/versionsreminder')();
    }
};
