var URL = "http://www.deutschlandradio.de/programmvorschau-als-pdf.427.de.html";

var Adapter = function(done) {
	if (Ti.App.Properties.hasProperty('PDF'))
		done(Ti.App.Properties.getList('PDF'));
	var res = [];

	require('de.appwerft.soup').createDocument({
		url : URL,
		timeout : 30000,
		onerror : function() {
			console.log("Error from Soup !!!!");
		},
		onload : function(result) {
			if (!result.document) {
				console.log("Error: result without document");
				return;
			}
			var pdfs = [];
			result.document.select(".text .deutschlandfunkColor p a").forEach(function(e) {
				pdfs.push({
					link : "http://deutschlandradio.de/" + e.getAttribute("href"),
					title : e.getText(),
					station : "dlf"
				});
			});
			result.document.select(".text .dradiokulturcolor p a").forEach(function(e) {
				pdfs.push({
					link : "http://deutschlandradio.de/" + e.getAttribute("href"),
					title : e.getText(),
					station : "drk"
				});
			});
			console.log(pdfs);
			if (done)
				done(pdfs);
		}
	});
};

module.exports = Adapter;
