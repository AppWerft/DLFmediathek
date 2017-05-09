module.exports = function(opts) {
	var $ = (opts.view) ? opts.view : Ti.UI.createView({
		backgroundColor : opts.color || "#ddd"
	});
	$.add(Ti.UI.createImageView({
		width : 50,
		height : 50,
		touchEnabled : false,
		top : 20,
		image : "/images/D.png"
	}));
	$.container = Ti.UI.createView({
		layout : "vertical",
		touchEnabled : false,
		left : 5,
		right : 5,
		bottom : 10,
		height : Ti.UI.SIZE
	});
	$.add($.container);
	$.container.add(Ti.UI.createLabel({
		touchEnabled : false,
		text : opts.subtitle,
		top : 0,
		textAlign : opts.textalign,
		width : Ti.UI.FILL,
		left : 5,
		right : 10,
		bottom : 5,
		height : Ti.UI.SIZE,
		color : "#333",
		font : {
			fontSize : opts.fontsize * 0.8,
			fontFamily : 'Aller Bold'
		}
	}));

	$.container.add(Ti.UI.createLabel({
		touchEnabled : false,
		text : opts.title,
		top : 0,
		width : Ti.UI.FILL,
		textAlign : opts.textalign,
		left : 5,
		right : 5,
		color : "white",
		font : {
			fontSize : opts.fontsize,
			fontFamily : 'Aller Bold'
		}
	}));
	if (opts.isfaved) {
		$.add(Ti.UI.createImageView({
			width : 20,
			height : 20,
			opacity : 0.9,
			touchEnabled : false,
			top : 5,
			right : 5,
			image : "/images/faved.png"
		}));
	}
	return $;
};
