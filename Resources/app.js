!function() {
    var self = Ti.UI.createTabGroup({
        fullscreen : true,
        orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT],
        tabs : [Ti.UI.createTab({
            title : 'Mediathek',
            window: require('ui/mediathek.window')()
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

    ['dayplan', 'podcasts','map', 'klangkunst'].forEach(function(win, ndx) {
        setTimeout(function() {
            self.tabs[ndx+1].setWindow(require('ui/'+ win+ '.window')());
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
   
    var gcm = require('vendor/gcmjs'),
        pendingData = gcm.getData();
    if (pendingData !== null) {
       console.log('GCM: has pending data on START. Data is:');
       console.log(JSON.stringify(pendingData));
        require('view.green').show(pendingData);
    }
    gcm.doRegistration({
        success : function(ev) {
           console.log('GCM success, deviceToken = ' + ev.deviceToken);
        },
        error : function(ev) {
           console.log('GCM error = ' + ev.error);
        },
        callback : function(data) {
            var dataStr = JSON.stringify(data);
           console.log('GCM notification while in foreground. Data is:');
           console.log(dataStr);
            require('view.white').show(dataStr);
        },
        unregister : function(ev) {
           console.log('GCM: unregister, deviceToken =' + ev.deviceToken);
        },
        data : function(data) {
           console.log('GCM: has pending data on RESUME. Data is:');
           console.log(JSON.stringify(data));
            // 'data' parameter = gcm.data
            require('view.green').show(data);
        }
    });
    require('controls/recorder.adapter')();
}();
