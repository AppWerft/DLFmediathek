module.exports = function(_item) {
	var $ = Ti.UI.createView({
		top : 70
	});
	$.scrollContainer = Ti.UI.createScrollView({
		scrollType : "vertical",
		layout : "vertical",
		backgroundColor : "white",
		contentHeight : Ti.UI.SIZE
	});
	$.add($.scrollContainer);
	require("controls/dlf24").getNewsItem(_item.link, function(e) {
		$.scrollContainer.add(Ti.UI.createImageView({
			image : e.aufmacher,
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			top : 0
		}));
		$.scrollContainer.children[0].addEventListener("click", function() {
			Ti.UI.createNotification({
				message : e.bu
			}).show();
		});
		$.scrollContainer.add(Ti.UI.createLabel({
			top : -14,
			backgroundColor : "#cfff",
			font : {
				fontSize : 9
			},
			right : 0,
			color : "black",
			height : 14,
			text : "  Bildnachweis: " + e.copyright + "  ",
		}));
		$.scrollContainer.add(Ti.UI.createLabel({
			top : 15,
			left : 10,
			right : 5,
			text : e.title,
			font : {
				fontSize : 22,
				fontFamily : 'Aller Bold'
			},
			color : "#461C9C"
		}));
		$.scrollContainer.add(Ti.UI.createLabel({
			top : 10,
			left : 10,
			right : 10,
			font : {
				fontSize : 20,
				fontFamily : 'Aller Bold'
			},
			color : "#333",
			text : e.shorttext
		}));
		$.scrollContainer.add(Ti.UI.createLabel({
			top : 15,
			left : 55,
			right : 10,
			color : "#333",
			font : {
				fontSize : 20,
				fontFamily : 'Aller'
			},
			text : e.fulltext + "\n\n"
		}));
		$.overline = Ti.UI.createView({
			bottom : -40,
			width : Ti.UI.SIZE,
			height : 40,
			left : 0,opacity:0.8,
			transform : Ti.UI.create2DMatrix({
				rotate : -90,
				anchorPoint : {
					x : 0,
					y : 0
				}
			}),
			backgroundColor : "#461C9C"
		});
		$.overline.add(Ti.UI.createLabel({
			color : "white",
			text : "  " + e.overline + "  ",
			font : {
				fontSize : 20,
				fontFamily : 'Aller Bold'
			},

		}));
		$.add($.overline);
	});
	return $;
};
