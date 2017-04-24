'use strict';

module.exports = function(ndx, cb) {
	var Document = require('de.appwerft.soup').createDocument({
		url : 'https://dradiowissen.de/thema/p' + ndx,
		onload : function() {
			var articles = Document.select("article");
			var res = [];
			articles.forEach(function(article) {
				if (article.select("figure button") && article.select("figure a img")) {
					var sendung = article.getFirstChild().getFirstChild().getText();
					var image = article.selectFirst("figure a img").getAttribute("src");
					var button = article.selectFirst("figure button");
					if (button) {
						var link = button.getAttribute("data-mp3");
						var title = button.getAttribute("data-title");
						res.push({
							sendung : sendung,
							link : link,
							title : title,
							image : image
						});
					}
				}
			});
			cb(res);
		}
	});
	return;
};
