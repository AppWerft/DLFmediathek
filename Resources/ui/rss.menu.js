var АктйонБар = require('com.alcoapps.actionbarextras');


module.exports = function(_event) {
    АктйонБар.title = 'DeutschlandRadio';
    АктйонБар.subtitle = 'Heutiges Programm';
    АктйонБар.titleFont = "ScalaSansBold";
    АктйонБар.subtitleColor = "#ccc";
    var activity = _event.source.getActivity();
    activity.actionBar.logo = "/images" + _event.source.itemId + '.png';
    
    
    if (activity) {
        activity.onCreateOptionsMenu = function(_menuevent) {
            _menuevent.menu.clear();
            activity.actionBar.displayHomeAsUp = true;
        };
        activity.invalidateOptionsMenu();
    }
};
