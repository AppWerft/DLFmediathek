				'use strict';

var nova = require("model/nova");

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

module.exports = function(ndx, slot, cb) {
	//	if (slot != "thema")
	//	slot = "podcasts/download/" + slot;
	var url = 'https://www.deutschlandfunknova.de/' + slot + '/p' + (ndx + 1) + "?" + new Date().getTime();
	console.log("-----------------\n" + url);
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
				var res = [];
				var articles = result.document.select("article");
				articles && articles.forEach(function(article) {
					if (article.select("figure button") && article.select("figure a img")) {
						var thema = article.selectFirst(".teaser__meta a").getAttribute("href").replace("https://dradiowissen.de/", "");
						var sendung = article.getFirstChild().getFirstChild().getText();
						var image = article.selectFirst("figure a img").getAttribute("src");
						var button = article.selectFirst("figure button");
						var title = article.selectFirst("h3 a").getText();
						var text = article.selectFirst(".teaser__text p").getText();
						if (button) {
							var link = button.getAttribute("data-mp3");
							var alt = button.getAttribute("data-title");
							if (alt) {
								var match = alt.match(/\(.*?\)/);
								if (match) {
									var duration = hms2s(match[0].replace("(", "").replace(")", ""));
								} else
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
								text : clean(text),
								color : nova[thema] ? nova[thema].color : "#777777"
							});
						}
					}
				});
				var items = result.document.select("ul.teaser__results li.item");
				// Podcasts
				items && items.forEach(function(item) {
					if (item.select("figure.teaser__image") && item.select("h3")) {
						var image = item.selectFirst("figure.teaser__image img").getAttribute("src");
						var alt = item.selectFirst("figure.teaser__image img").getAttribute("alt");
						var sendung = item.selectFirst("div.kicker").getText();
						var thema = item.selectFirst("div.kicker").getText();
						var text =  item.selectFirst("div.text p").getText();
						var title = item.selectFirst("h3").getText();
						var link = item.selectFirst("div small a").getAttribute("href");
						res.push({
							sendung : clean(sendung),
							link : link,
							alt : alt,
							title : clean(title),
							image : image,
							duration : 0,
							text : text,
							color : nova[slot] ? nova[slot].color : "#777777"
						});
					}
				});
				res && cb(res, ndx);
			}
		});
	}

};
