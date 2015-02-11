module.exports = function(station) {
    var win = require('ui/generic.window')({
        title : 'Klangkunst',
        subtitle : 'Hörspiel und Feature',
        station : station
    });
    require('controls/klangkunst.adapter')({
        url : 'http://www.deutschlandradiokultur.de/hoerkunst.1656.de.html',
        done : function() {
        }
    });
    win.open();
};
