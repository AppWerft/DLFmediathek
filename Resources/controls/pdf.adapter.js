var URL = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.deutschlandradio.de%2Fprogrammvorschau-als-pdf.427.de.html%22%20and%20xpath%3D%22%2F%2Fhtml%2Fbody%2Fdiv[1]%2Fdiv%2Fdiv%2Fdiv[2]%2Fdiv%2Fdiv%22&format=json&callback=";

var Adapter = function(done) {
	if (Ti.App.Properties.hasProperty('PDF'))
		done(Ti.App.Properties.getList('PDF'));
	var $ = Ti.Network.createHTTPClient({
		onload : function() {
			var json = JSON.parse(this.responseText);
			var dlf = json.query.results.div[1].p;
			var drk = json.query.results.div[2].p;
			var res = [];
			dlf.forEach(function(e) {
				e.a && res.push({
					station : 'dlf',
					url : 'http://www.deutschlandradio.de/' + e.a.href,
					title : e.a.content
				});
			});
			drk.forEach(function(e) {
				e.a && res.push({
					station : 'drk',
					url : 'http://www.deutschlandradio.de/' + e.a.href,
					title : e.a.content
				});
			});
			Ti.App.Properties.setList('PDF', res);
			done(res);
		},
		onerror : function(e) {
			console.log(e);
		}
	});
	$.open('GET', URL);
	$.send(null);
};

module.exports = Adapter;
