var Model = require('model/stations');
   Feeds = new (require('controls/feed.adapter'))();
module.exports = function(p, station, dims) {
	var url = (p.a) ? p.a.href : p.href;
	var itemId = {
		title : (p.a) ? p.a.img.alt : p.img.alt,
		subtitle : p.subtitle,
		url : url,
		banner : p.banner,
		text : p.text,
		color : Model[station].color
	};
	var $;
	if (station == "drw") {
		var bg = '/images/podcasts/' + p.img.src;
		$ = Ti.UI.Android.createCardView({
			padding : 0,
			width : dims.width,
			height : dims.height,
			top : 0,
			itemId : JSON.stringify(itemId),
			borderRadius : 10,
			useCompatPadding : true
		});
		$.add(Ti.UI.createImageView({
			touchEnabled : false,
			image : bg
		}));
	} else {// alte sachen
		$ = Ti.UI.Android.createCardView({
			padding : 0,
			width : dims.width,
			height : dims.height,
			top : 0,
			itemId : JSON.stringify(itemId),
			borderRadius : 10,
			useCompatPadding : true,
			backgroundColor : itemId.color,
		});
		require("ui/podcast/tile.widget")({
			view : $,
			isfaved : Feeds.isFaved(url),
			textalign : (station == "dlf") ? "left" : "center",
			width : dims.width,
			fontsize : 0.41 * parseFloat(dims.width),
			subtitle : itemId.subtitle,
			title : itemId.title,
		});
	}
	return $;
};
