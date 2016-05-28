module.exports = function() {
	var channelid =1;
	
	function nextChannel(channelid) {
		loadChannel(channelid, function(_res) {
			console.log('"'+ _res.replace('"','\\"') + '",');
			if (channelid < 248) {
				channelid++;
				nextChannel(channelid);
			} 
		});
	}

	// START
	nextChannel(channelid);
};

function loadChannel(channelid, onload) {
	var Scraper = require("de.appwerft.scraper").createScraper({
		url : "http://wurfsendung.dradio.de/wurf/index.php/en/Home/ArchivDetail/id/" + channelid,
		rootXpath : "//body",
		subXpaths : {
			title : "//div[@id=circular_headline]/h1/text()",
		}
	}, function(_e) {
		if (_e.success) {
			onload(_e.items[0].title.trim());
		}
	});
	/*
	var Scraper = require("de.appwerft.scraper").createScraper({
		url : "http://wurfsendung.dradio.de/wurf/index.php/en/Home/ArchivDetail/id/" + channelid,
		rootXpath : "//body",
		subXpaths : {
			url : "//div[@class=item-with-audio]/a/@href",
			title : "//div[@class=item-with-audio]/a[@title=Play]/text()",
			meta : "//div[@class=item-with-audio]/div[@class=track-infos]/text()"

		}
	}, function(_e) {
		if (_e.success) {
			onload(_e.items);
		}
	});*/

}