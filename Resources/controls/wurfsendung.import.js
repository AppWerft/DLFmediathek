module.exports = function(channelid) {
	var channnelid = 220;
	function nextChannel(channelid) {
		loadChannel(channelid, function(res) {
			console.log(res);
			if (channelid < 225) {
				channelid++;
				nextChannel(channelid);
			}
		});
	}

	nextChannel(channelid);
};

function loadChannel(channelid, onload) {
	var xhr = Ti.Network.createHTTPClient({
		onload : function() {
			var body = JSON.parse(this.responseText).query.results.body;
			var title = body.div[1].div[1].div[0].div[0].h1.split(/\r\n    /gm);
			title.shift();
			title.shift();
			var parts = body.div[1].div[1].div[0].div[1].div;
			var channel = {
				title : title,
				tracks : parts.map(function(p) {
					console.log(p);
					var res = p.a.href.match(/PlayTrack\/([\d]+)$/);
					var meta = p.a.content.split(/\r\n    /gm);
					meta.pop();
					meta.shift();
					return {
						channelid : channelid,
						id : res[1],
						title : p.a.content.replace(/  /gm, '').replace(/\r\n/gm, '').replace(/^ /gm, ''),
						meta : meta
					};
				})
			};
			onload(channel);
		}
	});
	xhr.open('GET', 'https://query.yahooapis.com/v1/public/yql?q=SELECT%20*%20from%20html%20where%20url%3D%27http%3A%2F%2Fwurfsendung.dradio.de%2Fwurf%2Findex.php%2Fen%2FHome%2FArchivDetail%2Fid%2F' + channelid + '%27&format=json&diagnostics=true&callback=');
	xhr.send();
}