(function() {
    var self = Ti.UI.createTabGroup({
        fullscreen : true,
        orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT],
        tabs : [Ti.UI.createTab({
            title : 'Mediathek',
            window : require('ui/mediathek.window')()
        }), Ti.UI.createTab({
            title : 'Podcasts',
            window : require('ui/podcasts.window')()
        }), Ti.UI.createTab({
            title : 'Tagesübersicht',
            window : require('ui/dayplan.window')()
        }), Ti.UI.createTab({
            title : 'Klangkunst',
            window : require('ui/klangkunst.window')()
        }), Ti.UI.createTab({
            title : 'Hörerkarte',
            window : require('ui/map.window')()
        })]
    });
    self.addEventListener('open',require('ui/main.menu'));
    self.open();
    var RSS = new (require('controls/rss.adapter'))();
    RSS.getRSS({
        station : 'dlf'
    });
    RSS.getRSS({
        station : 'drk'
    });

})();
