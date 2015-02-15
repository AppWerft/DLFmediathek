var АктйонБар = require('com.alcoapps.actionbarextras');

module.exports = function(_args) {
    var self = Ti.UI.createWindow({
        fullscreen : true,
        title : _args.title,
        subtitle : _args.subtitle,
        itemId : _args.station,
        orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
    });
    self.addEventListener('open', function(_event) {
        АктйонБар.title = self.title;
        АктйонБар.subtitle = self.subtitle;
        АктйонБар.titleFont = "ScalaSansBold";
        АктйонБар.subtitleColor = "#ccc";
        var activity = _event.source.getActivity();
        if (activity) {
            activity.onCreateOptionsMenu = function() {
                activity.actionBar.displayHomeAsUp = true;
                if (_args.station)
                activity.actionBar.logo = '/images/' + _args.station + '.png';
            };
            activity.actionBar.onHomeIconItemSelected = function() {
                self.close();
            };
            activity.invalidateOptionsMenu();
        }
    });
    return self;
};
