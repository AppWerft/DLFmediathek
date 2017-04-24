var themen = require("model/nova");
	
module.exports = function() {
	var androidView = Ti.UI.createScrollView({
		layout : "vertical",
		scrollType : "vertical",
		height : "80%"
	});
	Object.getOwnPropertyNames(themen).forEach(function(thema) {
		androidView.add(Ti.UI.createImageView({
			image : (themen[thema])? themen[thema].banner: undefined,
			itemId : thema,
			top : 0,
			height : 'auto'
		}));
	});

	var $ = Ti.UI.createOptionDialog({
		opts : {
			title : "Thema"
		},
		androidView : androidView
	});
	androidView.addEventListener("click", function(e) {
		var thema = e.source.itemId;
		require("ui/nova/thema.window")(thema, themen[thema].title, themen[thema].color);
		$.hide();
	});
	$.show();

};
