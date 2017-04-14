module.exports = function() {
	var $ = Ti.UI.createView({
		backgroundColor : "#6000",
		touchEnabled : false,
		pubbleParent : false,
		zIndex : 998
	});
	$.add(require("ti.animation").createLottieView({
		file : '/images/gears.json',
		loop : true,
		width : 320,
		height : 320,
		zIndex : 999,
		touchEnabled : false,
		autoStart : true
	}));
	return $;
};
