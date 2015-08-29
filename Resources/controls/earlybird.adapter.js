module.exports = function() {
	function nextPage(i) {
		loadPage(i, function(res) {
			console.log(res.length);
			if (i < 10) {
				i++;
				nextPage(i);
			}
		});
	}

	// START
	nextPage(1);
};

function loadPage(i, onload) {
	var xhr = Ti.Network.createHTTPClient({
		onload : function() {
			var figures = JSON.parse(this.responseText).query.results.figure;
			if ( typeof figures[0] == 'object') {
				var items = [];
				figures.forEach(function(f) {
					if (f['class'] == "teaser__image") {
						items.push({
							mp3 : f.button['data-mp3'],
							title : f.button['data-title'],
							image : f.a.img.src,
							alt : f.a.img.alt,
							copy : f.div ? f.div.a.span : undefined,
						});
					}
				});
			}
			console.log(items[0]);
			onload(items);
		}
	});
	xhr.open('GET', "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D'dradiowissen.de%2Fearly-bird%2Fp" + i + "'%20and%20xpath%3D'%2F%2Ffigure'&format=json");
	xhr.send();
}