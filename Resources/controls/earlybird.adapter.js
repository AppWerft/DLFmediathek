module.exports = function(_onload) {
	var page = 0;
	function nextPage(page) {
		loadPage(page + 1, function(res) {
			_onload(page, res);
			if (page < 10) {
				page++;
				nextPage(page);
			}
		});
	}

	// START
	nextPage(0);
};

function loadPage(_i, _onload) {
	if (Ti.App.Properties.hasProperty('EARLYBIRD_'+_i)) {
		_onload(Ti.App.Properties.getList('EARLYBIRD_'+_i));
	}
	var xhr = Ti.Network.createHTTPClient({
		timeout : 20000,
		onload : function() {
			var figures = JSON.parse(this.responseText).query.results.figure;
			console.log(figures[0]);
			if (Array.isArray(figures) && typeof figures[0] == 'object') {
				var items = [];
				figures.forEach(function(f) {
					if (f['class'] == "teaser__image") {
						if (f.button) {
							var title = f.button['data-title'].replace('Early Bird - ', '').replace(/(\([\d:]+\))/, '');
							var res = f.button['data-title'].match(/\(([\d:]+)\)/, '');
							if (res)
								var duration = parseInt(res[1].split(':')[0]) * 60 + parseInt(res[1].split(':')[1]);
							items.push({
								mp3 : f.button['data-mp3'],
								title : title,
								duration : res ? duration : '', // in sec.
								image : f.a.img.src,
								alt : f.a.img.alt,
								copy : f.div ? f.div.a.span : 'k.A.',
							});
						} else {

						}
					}
				});
				_onload(items);
				Ti.App.Properties.setList('EARLYBIRD_'+_i,items);

			} else {
				console.log('Warning: yql-result is invalide' + this.responseText);
			}
		},
		onerror : function(_e) {
			console.log('Error: ' + _e);
		}
	});
	var url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D'dradiowissen.de%2Fearly-bird%2Fp" + _i + "'%20and%20xpath%3D'%2F%2Ffigure'&format=json";
	xhr.open('GET', url, true);
	xhr.send(null);
}