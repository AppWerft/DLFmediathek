var URL = "http://www.deutschlandradio.de/programmvorschau-als-pdf.427.de.html";

var Adapter = function(done) {
	if (Ti.App.Properties.hasProperty('PDF'))
		done(Ti.App.Properties.getList('PDF'));
	var res = [];
	var subXpaths = {
		href : "//a[@target=_self]/@href",
		week : "//a[@target=_self]/text()"
	};
	require('de.appwerft.scraper').createScraper({
		url : URL,
		rootXpath : "//div[@class=deutschlandfunkColor]",
		subXpaths : subXpaths
	}, function(_e) {
		if (_e.success) {
			_e.items.forEach(function(pdf) {
				res.push({
					url : "http://www.deutschlandradio.de/" + pdf.href,
					title : pdf.week,
					station : "dlf"
				});
			});
		}
		require('de.appwerft.scraper').createScraper({
			url : URL,
			rootXpath : "//div[@class=dradiokulturColor]",
			subXpaths : subXpaths
		}, function(_e) {
			if (_e.success) {
				_e.items.forEach(function(pdf) {
					res.push({
						url : "http://www.deutschlandradio.de/" + pdf.href,
						title : pdf.week,
						station : "drk"
					});
				});
			}
			Ti.App.Properties.setList('PDF', res);
			done(res);
		});
	});
};

module.exports = Adapter;
