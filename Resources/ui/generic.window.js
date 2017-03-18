var АктйонБар = require('com.alcoapps.actionbarextras');

module.exports = function(_args) {
    var self = Ti.UI.createWindow({
        title : _args.title,
        subtitle : _args.subtitle,
        itemId : _args.station,
        fullscreen : false,
        backgroundColor : 'white'
    });
    if (_args.singlewindow == true)
        self.addEventListener('open', function(_event) {
            АктйонБар.title = self.title;
            АктйонБар.subtitle = self.subtitle;
            АктйонБар.titleFont = "ScalaSansBold";
            _args.color && АктйонБар.setBackgroundColor(_args.color);
            АктйонБар.subtitleColor = "#ccc";
            _args.color && АктйонБар.setStatusbarColor(_args.color);
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
