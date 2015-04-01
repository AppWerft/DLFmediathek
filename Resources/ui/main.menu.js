var Player = Ti.Media.createAudioPlayer({
    allowBackground : true,
    volume : 1
}),
Model = require('model/stations'),
АктйонБар = require('com.alcoapps.actionbarextras'),
    stations = require('model/stations'),
    currentRadio = Ti.App.Properties.getString('LAST_STATION', 'dlf'),
// listening
    currentStation = Ti.App.Properties.getString('LAST_STATION', 'dlf');
// viewing




module.exports = function(_event) {
    var laststation = Ti.App.Properties.getString('LAST_STATION', 'dlf');
    var currentStationName = laststation;
    АктйонБар.setTitle(Model[laststation].name);
    АктйонБар.setSubtitle('Mediathek');
    АктйонБар.setFont("ScalaSansBold");
    АктйонБар.subtitleColor = "#ccc";
    var activity = _event.source.getActivity();
    if (activity) {
        activity.actionBar.logo = '/images/' +laststation + '.png';
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
                        return;
                }
                currentRadio = currentStation;
                require('controls/resolveplaylist')({
                    playlist : url,
                    onload : function(_url) {
                        Ti.UI.createNotification({
                            message : 'Wir hören jetzt das laufende „' +stations[currentStation].name + '“.'}
                        ).show();
                        Player.release();
                        Player.setUrl(_url+ '?_='+ Math.random());
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
                console.log('state: ' + _e.state + ' ' + _e.description) ;
                console.log('currentSation='+currentStation) ;
                var playicon = (currentStation)
                switch (_e.state) {
                case 1:
                     menuitem.setIcon(Ti.App.Android.R.drawable.ic_action_loading);
                break;
                case 3:
                    menuitem.setIcon(Ti.App.Android.R.drawable['ic_action_stop_'+currentStation]);
                    break;
                case 4:
                case 5:
                    menuitem.setIcon(Ti.App.Android.R.drawable['ic_action_play_'+currentStation]);
                    break;

                };
            });
            activity.actionBar.displayHomeAsUp = false;
            Ti.App.addEventListener('app:station', function(_e) {
                var menuitem = _menuevent.menu.findItem('1');
                currentStation = _e.station;
                if (!currentRadio)
                    currentRadio = _e.station;
                switch (_e.station) {
                case 'dlf':
                    АктйонБар.setTitle('Deutschlandfunk');
                    if (!Player.isPlaying()) menuitem.setIcon(Ti.App.Android.R.drawable.ic_action_play_dlf);
                    break;
                case 'drk':
                    АктйонБар.setTitle('DRadio Kultur');
                     if (!Player.isPlaying()) menuitem.setIcon(Ti.App.Android.R.drawable.ic_action_play_drk);
                    break;
                case 'drw':
                    АктйонБар.setTitle('DRadio Wissen');
                     if (!Player.isPlaying()) menuitem.setIcon(Ti.App.Android.R.drawable.ic_action_play_drw);
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
