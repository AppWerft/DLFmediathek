module.exports = function(pdf) {
	var $ = Ti.UI.createTableViewRow({
		height : 90,
		itemId : pdf.url
	});
	$.add(Ti.UI.createView({
		left : 0,
		top : 0,
		width : 70,
		height : 70,
		backgroundImage : '/images/' + pdf.station + '.png'
	}));
	$.add(Ti.UI.createLabel({
		left : 80,
		font : {
			fontSize : 22,
			fontFamily : 'Aller'
		},
		text : pdf.title.replace('KW ', 'Kalenderwoche\n')
	}));
	return $;
}; 