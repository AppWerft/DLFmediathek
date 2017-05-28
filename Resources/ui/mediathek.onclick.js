var Model = require('model/stations'),
    Favs = new (require('controls/favorites.adapter'))();
var locked=false;

module.exports = function(_e) {
	var start = new Date().getTime();
	if (locked == true)
		return;
	locked = true;
	setTimeout(function() {
		locked = false;
	}, 2000);
	if (_e.bindId && _e.bindId == 'fav') {
		var item = _e.section.getItemAt(_e.itemIndex);
		var payload = JSON.parse(item.properties.itemId);
		var isfav = Favs.toggleFav(payload);
		item.fav.image = isfav ? '/images/fav.png' : '/images/favadd.png';
		if (isfav)
			require('ui/download.dialog')(function() {
				if (true == Ti.App.Properties.getBool('OFFLINE_DECISION')) {
					/* init the download*/
					var CacheAdapter = require('controls/cache.adapter');
					CacheAdapter.cacheURL(payload);
				}
			});
		item.fav.opacity = isfav ? 0.8 : 0.5;
		_e.section.updateItemAt(_e.itemIndex, item);
	} else if (_e.bindId && _e.bindId == 'share') {
		require('vendor/socialshare')({
			type : 'all',
			message : 'Höre gerade mit der #DLFMediathekApp „' + JSON.parse(_e.itemId).subtitle + '“',
			url : JSON.parse(_e.itemId).url,
		});
	} else if (_e.bindId && _e.bindId == 'playtrigger') {
		var data = JSON.parse(_e.itemId);
		require('ui/audioplayer.window').createAndStartPlayer({
			color : '#000',
			url : data.url,
			storage : 'cache',
			duration : data.duration,
			title : data.title,
			subtitle : data.subtitle,
			author : data.author,
			station : data.station,
			pubdate : data.pubdate
		});
		Ti.App.fireEvent('app:stopAudioStreamer');
	}
};
