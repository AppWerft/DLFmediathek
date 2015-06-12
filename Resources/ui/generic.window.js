var АктйонБар = require('com.alcoapps.actionbarextras');

module.exports = function(_args) {
    var self = Ti.UI.createWindow({
        title : _args.title,
        subtitle : _args.subtitle,
        itemId : _args.station,
        fullscreen : true,
        backgroundColor : 'white',
        orientationModes : (_args.orientationModes) ? _args.orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
    });
    if (_args.singlewindow == true)
        self.addEventListener('open', function(_event) {
            АктйонБар.title = self.title;
            АктйонБар.subtitle = self.subtitle;
            АктйонБар.titleFont = "ScalaSansBold";
             АктйонБар.setBackgroundColor('#444444');
            АктйонБар.subtitleColor = "#ccc";
            var activity = _event.source.getActivity();
            if (activity) {
                activity.onCreateOptionsMenu = function(_menuevent) {
                    activity.actionBar.displayHomeAsUp = true;
                    if (_args.menu) {
                        _menuevent.menu.clear();
                        _args.menu.forEach(function(menu) {
                            _menuevent.menu.add(menu.item).addEventListener('click', menu.onclick);
                        });
                    }
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
