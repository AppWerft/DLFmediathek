! function() {

    var self = Ti.UI.createTabGroup({
        fullscreen : true,
        orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT],
        tabs : [Ti.UI.createTab({
            title : 'Mediathek',
            window : require('ui/mediathek.window')()
        }), Ti.UI.createTab({
            title : 'Tagesübersicht',
        }), Ti.UI.createTab({
            title : 'Podcasts',
        }), Ti.UI.createTab({
            title : 'Hörerkarte',
        }), Ti.UI.createTab({
            title : 'Klangkunst',
        })]
    });

    self.addEventListener('open', require('ui/main.menu'));

    ['dayplan', 'podcasts', 'map', 'klangkunst'].forEach(function(win, ndx) {
        setTimeout(function() {
            self.tabs[ndx + 1].setWindow(require('ui/'+ win+ '.window')());
        }, ndx * 100);
    });

    var RSS = new (require('controls/rss.adapter'))();
    RSS.getRSS({
        station : 'dlf'
    });
    RSS.getRSS({
        station : 'drk'
    });
    self.open();
    self.setActiveTab(0);
    
    var tools = require('bencoding.android.tools');
    require('vendor/cronservice.trigger')();
}();
