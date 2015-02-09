module.exports = function(station) {
    var self = Ti.UI.createWindow({
        fullscreen : true,
        itemId : station,
        orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
    });
    self.addEventListener('open', require('ui/rss.menu'));
    self.open();
};
