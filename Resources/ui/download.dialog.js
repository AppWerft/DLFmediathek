module.exports = function(_callback) {
	var aView = Ti.UI.createView({
		layout : 'vertical',
		right : 30,
		left : 30,
		height : 140
	});
	aView.add(Ti.UI.createView({
		top : 0,
		right : 20,
		left : 25,
		borderWidth : 0,
		borderColor : 'gray',
		height : 70
	}));
	aView.add(Ti.UI.createView({
		top : 0,
		right : 20,
		left : 25,
		borderWidth : 0,
		borderColor : 'gray',
		height : 70
	}));
	aView.children[0].add(Ti.UI.createLabel({
		textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
		text : 'Das Hörstück für das spätere Anhören zusätzlich „offline machen“.',
		height : Ti.UI.SIZE,
		left : 0,
		right : 60,
		width : Ti.UI.FILL,

	}));
	aView.children[0].add(Ti.UI.createSwitch({
		style : Ti.UI.Android.SWITCH_STYLE_SWITCH,
		value : Ti.App.Properties.hasProperty('OFFLINE_DECISION') ? Ti.App.Properties.getBool('OFFLINE_DECISION') : false,
		bottom : 0,
		height : 70,
		key : 'OFFLINE_DECISION',
		width : 70,
		right : 10
	}));
	aView.children[1].add(Ti.UI.createLabel({
		textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
		text : 'Diese obige Entscheidung merken.',
		height : Ti.UI.SIZE,
		left : 0,
		right : 60,
		width : Ti.UI.FILL,
	}));
	aView.children[1].add(Ti.UI.createSwitch({
		style : Ti.UI.Android.SWITCH_STYLE_SWITCH,
		value : (Ti.App.Properties.hasProperty('SAVE_OFFLINE_DECISION') && Ti.App.Properties.getBool('SAVE_OFFLINE_DECISION') == true) ? Ti.App.Properties.getBool('SAVE_OFFLINE_DECISION') : false,
		bottom : 0,
		key : 'SAVE_OFFLINE_DECISION',
		height : 60,
		width : '100%',
		right : 10
	}));
	aView.children[0].children[1].addEventListener('change', function(_e) {
		console.log( typeof _e.value);
		Ti.App.Properties.setBool(_e.source.key, _e.value);
		console.log(_e.value);
	});
	aView.children[1].children[1].addEventListener('change', function(_e) {
		Ti.App.Properties.setBool(_e.source.key, _e.value);
		console.log(_e.value);
	});
	var $ = Ti.UI.createAlertDialog({
		message : 'Hörstück wird in die persönliche Hörliste übertragen',
		title : 'Zeitsouveränes Radiohören',
		androidView : aView,
		ok : 'So soll es sein.',
	});
	$.addEventListener('click', _callback);
	$.show();
};
