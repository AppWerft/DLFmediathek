module.exports = function(_container, _i, _onload) {
	if (Ti.App.Properties.hasProperty('EARLYBIRDWEB__' + _i)) {
		_onload(Ti.App.Properties.getList('EARLYBIRDWEB__' + _i));
	}
	var url = 'http://dradiowissen.de/early-bird/p' + (_i + 1);
	var dummywebView = Ti.UI.createWebView({
		url : url,
		opacity : 0,
		width : 10,
		height : 10		,
		borderRadius : 2
	});
	_container.add(dummywebView);
	function onLoad() {
		var res = dummywebView.evalJS("JSON.stringify($('figure.teaser__image').map(function(){var item={mp3:$(this).find('button').attr('data-mp3'),title:$(this).find('button').attr('data-title'),image:$(this).find('a img').attr('src')}; return item;}));");
		console.log(res);
		if (!res) return;
		var items = JSON.parse(res);
		var resultlist = [];
		if (items && typeof items == 'object') {
			Object.getOwnPropertyNames(items).forEach(function(key) {
				var item = items[key];
				if (item.image && item.title) {
					var match = item.title.match(/\(([\d][\d]:[\d][\d])\)/);
					if (match && Array.isArray(match)) {
						item.duration = parseInt(match[1].split(':')[0]) * 60 + parseInt(match[1].split(':')[1]);
						item.title = item.title.replace(/\(([\d][\d]:[\d][\d])\)/, '').replace('Early Bird - ','');
						resultlist.push(item);
					}
				}
			});
			Ti.App.Properties.setList('EARLYBIRDWEB_' + _i, resultlist);
			_onload(resultlist);
		}
		_container.remove(dummywebView);
		dummywebView = null;
	}
	dummywebView.addEventListener('load', onLoad);
};
