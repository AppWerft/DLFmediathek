var Model = require('model/stations'),
    Moment = require('vendor/moment');

module.exports = function(args) {
	var parent = args.self,
	    color = args.color,
	    station = args.station;
	var $ = Ti.UI.createView({
		width : 220,
		right : -220,
		opacity : 0.9,
		top : 0,
		height : 40,
		color : 'white',
		text : 'Heute',
		transform : Ti.UI.create2DMatrix({
			rotate : 90,
			anchorPoint : {
				x : 0,
				y : 0
			}
		}),
		backgroundColor : color,
		font : {
			fontSize : 20,
			fontFamily : 'Aller Bold'
		},
	});
	$.add(Ti.UI.createLabel({
		text : 'Heute',
		left : 15,
		width : Ti.UI.FILL,
		color : 'white',
		touchEnabled : false,
		font : {
			fontSize : 22,
			fontFamily : 'Aller Bold'
		},
	}));
	$.addEventListener('click', function(_e) {
		var picker = Ti.UI.createPicker({
			type : Ti.UI.PICKER_TYPE_DATE,
			minDate : new Date(2009, 0, 1),
			maxDate : Moment().toDate(),
			value : parent.date.toDate(),
			locale : 'de'
		});
		picker.showDatePickerDialog({
			value : parent.date.toDate(),
			callback : function(e) {
				if (!e.cancel) {
					require('ui/mediathekarchiv.window')({
						date : Moment(e.value).startOf('day'),
						station : station,
						archive : true
					}).open();
				}
			}
		});
	});
	return $;
};
