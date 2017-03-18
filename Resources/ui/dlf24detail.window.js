module.exports = function(_e) {

	var $ = require('ui/generic.window')({
		subtitle : "Meldung aus der DLF-Nachrichtenredaktion",
		title : "DLF24",
		station : "DLF",
		singlewindow : true,
		color : require('model/stations').dlf.color,
		actionbarHidden : true
	});

	$.add(Ti.UI.createScrollView({
		scrollType : "vertical",
		layout : "vertical",
		top : 70,
		contentHeight : Ti.UI.SIZE

	}));

	require("controls/dlf24").getNewsItem(_e.itemId, function(e) {
		$.title= e.overline;
		$.children[0].add(Ti.UI.createImageView({
			image : e.aufmacher,
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			top : 0
		}));
		$.children[0].children[0].addEventListener("click", function() {
			Ti.UI.createNotification({
				message : e.bu
			}).show();
		});
		$.children[0].add(Ti.UI.createLabel({
			top : 5,
			left : 10,
			right : 5,
			text : e.title,
			font : {
				fontSize : 22,
				fontFamily : 'Aller Bold'
			},
			color : require('model/stations').dlf.color
		}));
		$.children[0].add(Ti.UI.createLabel({
			top : 5,
			left : 10,
			right :10,
			font : {
				fontSize : 18,
				fontFamily : 'Aller Bold'
			},
			color: "#333",
			text : e.shorttext
		}));
		$.children[0].add(Ti.UI.createLabel({
			top : 5,
			left : 10,
			right : 10,
			color:"#333",
			font : {
				fontSize : 18,
				fontFamily : 'Aller'
			},
			text : e.fulltext
		}));
	});
	$.open();
};
