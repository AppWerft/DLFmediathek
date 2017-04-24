var W = 60;
module.exports = function() {
	var $ = Ti.UI.createView({
		width : W,
		height : W,
		right : 10,
		bottom : 10,
		backgroundImage : "/images/menuwhite.png",
		backgroundColor : require("model/stations").drw.color,
		borderRadius : W / 2
	});
	return $;
};
