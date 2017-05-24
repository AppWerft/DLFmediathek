'use strict';

function hms2s(str) {
	var p = str.split(':'),
	    s = 0,
	    m = 1;

	while (p.length > 0) {
		s += m * parseInt(p.pop(), 10);
		m *= 60;
	}

	return s;
}

module.exports = function(url, cb) {
	var url = url.replace(".html", ".mhtml")
	function doRequest() {
		require('de.appwerft.soup').createDocument({
			url : url,
			timeout : 30000,
			onerror : function() {
				console.log("Error from Soup !!!!");
				cb(null);
			},
			onload : function(result) {
				if (!result.document) {
					console.log("Error: result without document");
					return;
				}
				var articles = result.document.select("article");
				if (!articles) {
					console.log("Error: no articles in document!");
					return;
				}
				var res = [];
				articles.forEach(function(article) {
					res.push({
						subtitle : article.selectFirst("h3 a").getText(),
						title : article.selectFirst("h3 span").getText(),
						image : article.selectFirst("a.image img").getAttribute("src"),
						text : article.selectFirst("p").getText()
					});
				});
				cb(res, ndx);
			}
		});
	}

};
