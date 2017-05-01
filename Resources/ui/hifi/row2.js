module.exports = function(device, dark) {
	var $ = Ti.UI.createTableViewRow({
		itemId : JSON.stringify(device),
		touchEnabled : true
	});
	$.container = Ti.UI.createView({
		right : 60,
		opacity : (device.connected == true) ? 1 : 0.5
	});
	$.add($.container);
	$.container.add(Ti.UI.createLabel({
		right : 40,
		text : device.name,
		color : dark ? "#ddd" : '#333',
		textAlign : 'left',
		width : Ti.UI.FILL,
		left : 80,
		font : {
			fontSize : 18,
			fontFamily : "Aller Bold"
		}
	}));
	var logo = Ti.UI.createImageView({
		top : 10,
		left : 20,
		image : (device.connected) ? "/images/bt4.png" : "/images/bt0.png",
		height : 32,
		bottom : 10
	});

	$.switcher = Ti.UI.createSwitch({
		value : device.connected, // mandatory property for iOS
		style : Ti.UI.Android.SWITCH_STYLE_SWITCH,
		right : 10,
		bubbleParent : true,
		touchEnabled : true
	});
	$.switcher.addEventListener("click", function(e) {
		
		$.fireEvent("click", {
			row : $,
			section : {
				ndx : 2
			}
		});
		$.switcher.setValue(!$.switcher.getValue());
	});
	$.spinner = Ti.UI.createActivityIndicator({
		style : Ti.UI.ActivityIndicatorStyle.BIG,
		height : 50,
		width : 50,
		bubbleParent : true,
		touchEnabled : false,

		zIndex : 0,
		right : 12
	});

	$.container.add(logo);
	$.add($.spinner);
	$.add($.switcher);
	return $;
};
