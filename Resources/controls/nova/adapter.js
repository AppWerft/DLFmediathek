'use strict';

module.exports = function(ndx, slot, cb) {
	slot = slot.toLowerCase().replace("hörsaal", "hörsaal").replace("grünstreifen", "gruenstreifen").replace(" ", "-");
	var url = 'https://dradiowissen.de/' + slot + '/p' + (ndx + 1) + "?_=" + Math.random();
	setTimeout(doRequest, ndx * 5000);
	
	function doRequest() {
		require('de.appwerft.soup').createDocument({
			url : url,
			timeout : 30000,
			onerror : function() {
				console.log("Error from Soup !!!!");
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
				console.log(ndx + " Articles: " + articles.length + " in " + result.duration + " ms.");
				var res = [];
				articles.forEach(function(article) {
					if (article.select("figure button") && article.select("figure a img")) {
						var thema = article.selectFirst(".teaser__meta a").getAttribute("href").replace("https://dradiowissen.de/", "");
						var sendung = article.getFirstChild().getFirstChild().getText();
						var image = article.selectFirst("figure a img").getAttribute("src");
						var button = article.selectFirst("figure button");
						var title = article.selectFirst("h3 a").getText();
						if (button) {
							var link = button.getAttribute("data-mp3");
							var alt = button.getAttribute("data-title");
							if (alt) {
								var match = alt.match(/\(([\d]+:[\d][\d])\)/);
								if (match)
									var duration = parseInt(match[1].split(':')[0]) * 60 + parseInt(match[1].split(':')[1]);
								else
									console.log("Error No match \n" + alt);
							} else
								console.log("Error: no alt!");
							res.push({
								sendung : clean(sendung),
								link : link,
								thema : thema,
								alt : alt,
								title : clean(title),
								image : image,
								duration : duration,
								text : clean(article.selectFirst(".teaser__text p").getText())
							});
						}
					}
				});
				cb(res, ndx);
			}
		});
	}

};
